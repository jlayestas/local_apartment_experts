package com.localapartmentexperts.crm.user;

import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.user.dto.CreateUserRequest;
import com.localapartmentexperts.crm.user.dto.ResetPasswordRequest;
import com.localapartmentexperts.crm.user.dto.UpdateUserRequest;
import com.localapartmentexperts.crm.user.dto.UserDetailDTO;
import com.localapartmentexperts.crm.user.dto.UserSummaryDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── Public (authenticated) ─────────────────────────────────────────────────

    /**
     * GET /api/v1/users/assignable
     * Returns all active employees for the lead/property assignment dropdown.
     */
    @GetMapping("/assignable")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getAssignableUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAssignableUsers()));
    }

    // ── Admin only ─────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/users
     * Returns all users (active and inactive) for the admin management table.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDetailDTO>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.listAllUsers()));
    }

    /**
     * POST /api/v1/users
     * Creates a new user. Email must be unique.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailDTO>> createUser(
            @Valid @RequestBody CreateUserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(userService.createUser(req)));
    }

    /**
     * GET /api/v1/users/{id}
     * Returns full detail for a single user.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailDTO>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    /**
     * PATCH /api/v1/users/{id}
     * Partial update — only provided fields are changed.
     * Prevents admins from deactivating themselves or changing their own role.
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailDTO>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest req,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.updateUser(id, req, authentication.getName())));
    }

    /**
     * PATCH /api/v1/users/{id}/password
     * Resets a user's password. Returns 204 No Content on success.
     */
    @PatchMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(
            @PathVariable UUID id,
            @Valid @RequestBody ResetPasswordRequest req) {
        userService.resetPassword(id, req);
        return ResponseEntity.noContent().build();
    }
}
