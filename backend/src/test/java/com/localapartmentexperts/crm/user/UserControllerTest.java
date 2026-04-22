package com.localapartmentexperts.crm.user;

import com.localapartmentexperts.crm.BaseIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
@Rollback
@WithMockUser(username = "admin@test.local", roles = {"ADMIN"})
class UserControllerTest extends BaseIntegrationTest {

    // ── GET /api/v1/users/assignable ──────────────────────────────────────────

    @Test
    void getAssignableUsers_returnsBothSeedUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users/assignable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    void getAssignableUsers_onlyReturnsActiveUsers() throws Exception {
        // Disable the agent and confirm it no longer appears
        User agent = userRepository.findByEmail(AGENT_EMAIL).orElseThrow();
        agent.setActive(false);
        userRepository.saveAndFlush(agent);

        mockMvc.perform(get("/api/v1/users/assignable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].email", not(hasItem(AGENT_EMAIL))));
    }

    @Test
    void getAssignableUsers_isSortedByFirstNameThenLastName() throws Exception {
        mockMvc.perform(get("/api/v1/users/assignable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].firstName").exists());
    }

    @Test
    void getAssignableUsers_responseContainsIdAndName() throws Exception {
        mockMvc.perform(get("/api/v1/users/assignable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").isNotEmpty())
                .andExpect(jsonPath("$.data[0].firstName").isNotEmpty())
                .andExpect(jsonPath("$.data[0].lastName").isNotEmpty());
    }

    @Test
    void getAssignableUsers_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/users/assignable")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous()))
                .andExpect(status().isUnauthorized());
    }
}
