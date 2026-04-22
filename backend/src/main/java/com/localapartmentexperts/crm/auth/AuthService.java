package com.localapartmentexperts.crm.auth;

import com.localapartmentexperts.crm.auth.dto.AuthUserDTO;
import com.localapartmentexperts.crm.auth.dto.LoginRequest;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final UserRepository userRepository;

    /**
     * Authenticates the user, stamps last_login_at, then saves the security context
     * to the session. The DB write happens before the session is committed so that
     * any persistence failure prevents the session from being established.
     */
    @Transactional
    public AuthUserDTO login(LoginRequest request,
                             HttpServletRequest httpRequest,
                             HttpServletResponse httpResponse) {

        // 1. Verify credentials — throws BadCredentialsException or DisabledException on failure
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // 2. Load the full User entity (needed for the DTO and for the DB update)
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 3. Stamp last login — if this fails, the transaction rolls back and no session is saved
        userRepository.updateLastLoginAt(user.getId(), Instant.now());

        // 4. Establish the server-side session
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return AuthUserDTO.from(user);
    }

    /**
     * Returns the profile of the currently authenticated user.
     * Spring Security guarantees this is only reachable by authenticated principals.
     */
    @Transactional(readOnly = true)
    public AuthUserDTO getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(AuthUserDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
