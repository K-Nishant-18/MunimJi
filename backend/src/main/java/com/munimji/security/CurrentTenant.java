package com.munimji.security;

import com.munimji.exception.UnauthorizedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Reads the shop (tenant) id of the caller from the SecurityContext.
 * Services use it to keep every query inside the caller's own shop.
 */
public final class CurrentTenant {

    private CurrentTenant() {
    }

    /** Owner's user id of the shop the caller belongs to. */
    public static Long id() {
        AppUserDetails user = currentUser();
        if (user == null) {
            throw new UnauthorizedException("Please login first");
        }
        return user.getTenantId();
    }

    /** The caller's own user id (differs from the tenant id for staff). */
    public static Long userId() {
        AppUserDetails user = currentUser();
        if (user == null) {
            throw new UnauthorizedException("Please login first");
        }
        return user.getUserId();
    }

    private static AppUserDetails currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        if (authentication.getPrincipal() instanceof AppUserDetails user) {
            return user;
        }
        return null;
    }
}
