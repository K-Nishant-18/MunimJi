package com.munimji.security;

import com.munimji.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.munimji.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // An owner IS their own shop, staff belong to the owner's shop
        Long tenantId = user.getOwnerId() != null ? user.getOwnerId() : user.getId();
        return new AppUserDetails(user.getId(), tenantId, user.getEmail(),
                user.getPassword(), user.getRole());
    }
}
