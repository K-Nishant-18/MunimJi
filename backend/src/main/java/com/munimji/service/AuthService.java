package com.munimji.service;

import com.munimji.dto.auth.AuthResponse;
import com.munimji.dto.auth.LoginRequest;
import com.munimji.dto.auth.RegisterRequest;
import com.munimji.entity.User;
import com.munimji.entity.UserRole;
import com.munimji.exception.BadRequestException;
import com.munimji.exception.ConflictException;
import com.munimji.exception.ForbiddenException;
import com.munimji.exception.UnauthorizedException;
import com.munimji.repository.UserRepository;
import com.munimji.security.AppUserDetails;
import com.munimji.security.JwtUtil;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Three ways to register:
     *  - no token: open to everyone, but only as OWNER (starts a new shop)
     *  - OWNER token: may only add STAFF to his own shop
     *  - STAFF token: not allowed
     */
    @Transactional
    public AuthResponse register(RegisterRequest request, Authentication currentAuth) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("A user with this email already exists");
        }

        UserRole role = UserRole.OWNER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Role must be OWNER or STAFF");
            }
        }

        User user = new User(request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                role);

        if (isAnonymous(currentAuth)) {
            if (role != UserRole.OWNER) {
                throw new ForbiddenException("Register as an owner to start a new shop");
            }
            // ownerId stays null: an owner IS their own shop
        } else if (isOwner(currentAuth)) {
            if (role != UserRole.STAFF) {
                throw new ForbiddenException("An owner can only add staff users");
            }
            user.setOwnerId(((AppUserDetails) currentAuth.getPrincipal()).getTenantId());
        } else {
            throw new ForbiddenException("Only the owner can create new users");
        }

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(),
                            request.getPassword()));
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name());
    }

    private boolean isAnonymous(Authentication authentication) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return true;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ANONYMOUS".equals(authority.getAuthority()));
    }

    private boolean isOwner(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_OWNER".equals(authority.getAuthority()));
    }
}
