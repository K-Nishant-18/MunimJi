package com.munimji.security;

import com.munimji.entity.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

/**
 * The logged in user carried in the SecurityContext. Besides the usual
 * UserDetails fields it also carries the shop (tenant) id, so every service
 * can scope its queries without loading the user row again.
 *
 * tenantId is the OWNER's user id in both cases:
 *   OWNER -> own user id (their shop id IS their user id)
 *   STAFF -> the owner's user id (the shop they work in)
 */
public class AppUserDetails implements UserDetails {

    private final Long userId;
    private final Long tenantId;
    private final String email;
    private final String password;
    private final UserRole role;

    public AppUserDetails(Long userId, Long tenantId, String email, String password, UserRole role) {
        this.userId = userId;
        this.tenantId = tenantId;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public UserRole getRole() {
        return role;
    }

    @Override
    public List<GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
