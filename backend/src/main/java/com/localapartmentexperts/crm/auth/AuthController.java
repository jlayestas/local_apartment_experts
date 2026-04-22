package com.localapartmentexperts.crm.auth;

import com.localapartmentexperts.crm.auth.dto.AuthUserDTO;
import com.localapartmentexperts.crm.auth.dto.LoginRequest;
import com.localapartmentexperts.crm.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/login
     * Authenticates an employee and establishes a server-side session.
     * On success, sets an HttpOnly, SameSite=Strict CRM_SESSION cookie.
     *
     * 200 → AuthUserDTO
     * 400 → validation error (blank email / password)
     * 401 → bad credentials or disabled account
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthUserDTO>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        AuthUserDTO user = authService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    /**
     * GET /api/v1/auth/me
     * Returns the profile of the currently authenticated user.
     * Requires a valid session cookie — returns 401 otherwise (enforced by Spring Security).
     *
     * 200 → AuthUserDTO
     * 401 → no session / expired session
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthUserDTO>> me(Authentication authentication) {
        AuthUserDTO user = authService.getCurrentUser(authentication);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    /*
     * POST /api/v1/auth/logout
     * Handled by Spring Security's LogoutFilter (configured in SecurityConfig).
     * Invalidates the session, clears the CRM_SESSION cookie, returns 200 JSON.
     * No controller method needed — the filter intercepts before routing.
     */
}
