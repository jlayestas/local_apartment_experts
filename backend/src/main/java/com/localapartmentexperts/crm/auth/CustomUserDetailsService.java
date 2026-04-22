package com.localapartmentexperts.crm.auth;

import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Called by Spring Security's DaoAuthenticationProvider on every login attempt.
     * Returning a disabled UserDetails causes Spring to throw DisabledException,
     * which GlobalExceptionHandler maps to HTTP 401 "Account is disabled".
     * Using a generic UsernameNotFoundException message to avoid user-enumeration.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Bad credentials"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .disabled(!user.isActive())
                .accountExpired(false)
                .credentialsExpired(false)
                .accountLocked(false)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
