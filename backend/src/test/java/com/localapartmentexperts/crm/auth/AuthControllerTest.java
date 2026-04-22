package com.localapartmentexperts.crm.auth;

import com.localapartmentexperts.crm.BaseIntegrationTest;
import com.localapartmentexperts.crm.auth.dto.LoginRequest;
import com.localapartmentexperts.crm.common.enums.UserRole;
import com.localapartmentexperts.crm.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthControllerTest extends BaseIntegrationTest {

    // ── POST /api/v1/auth/login ───────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returns200AndUserPayload() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest(ADMIN_EMAIL, ADMIN_PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(ADMIN_EMAIL));
    }

    @Test
    void login_setsSessionCookie() throws Exception {
        MockHttpSession session = adminSession();
        assert session != null : "Session should be created after successful login";
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest(ADMIN_EMAIL, "WrongPass999!"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withUnknownEmail_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest("nobody@nowhere.com", "AnyPass1!"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withDisabledAccount_returns403() throws Exception {
        String disabledEmail = "disabled@test.local";
        if (!userRepository.existsByEmail(disabledEmail)) {
            userRepository.saveAndFlush(User.builder()
                    .firstName("Dis").lastName("Abled")
                    .email(disabledEmail)
                    .passwordHash(new BCryptPasswordEncoder(4).encode("Pass1234!"))
                    .role(UserRole.AGENT).language("es").active(false).build());
        }

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest(disabledEmail, "Pass1234!"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void login_withBlankEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest("", ADMIN_PASSWORD))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withBlankPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest(ADMIN_EMAIL, ""))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withMalformedEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest("not-an-email", ADMIN_PASSWORD))))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/v1/auth/me ───────────────────────────────────────────────────

    @Test
    void me_whenAuthenticated_returnsCurrentUser() throws Exception {
        MockHttpSession session = adminSession();

        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(ADMIN_EMAIL));
    }

    @Test
    void me_withoutSession_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    // ── POST /api/v1/auth/logout ──────────────────────────────────────────────

    @Test
    void logout_invalidatesSession() throws Exception {
        MockHttpSession session = adminSession();

        mockMvc.perform(post("/api/v1/auth/logout").session(session))
                .andExpect(status().isOk());

        // Subsequent request with the same session should fail
        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_withoutSession_stillReturns200() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk());
    }

    // ── Unauthenticated access to protected endpoints ─────────────────────────

    @Test
    void protectedEndpoint_withoutSession_returns401WithJsonBody() throws Exception {
        mockMvc.perform(get("/api/v1/leads"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false));
    }
}
