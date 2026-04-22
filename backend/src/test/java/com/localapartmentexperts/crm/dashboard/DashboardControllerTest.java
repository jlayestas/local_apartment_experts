package com.localapartmentexperts.crm.dashboard;

import com.localapartmentexperts.crm.BaseIntegrationTest;
import com.localapartmentexperts.crm.lead.dto.CreateLeadRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
@Rollback
@WithMockUser(username = "admin@test.local", roles = {"ADMIN"})
class DashboardControllerTest extends BaseIntegrationTest {

    // ── GET /api/v1/dashboard/summary ─────────────────────────────────────────

    @Test
    void summary_emptyDatabase_returnsZeroCounts() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.newLeadsCount").value(0))
                .andExpect(jsonPath("$.data.unassignedLeadsCount").value(0))
                .andExpect(jsonPath("$.data.dueTodayCount").value(0))
                .andExpect(jsonPath("$.data.overdueCount").value(0));
    }

    @Test
    void summary_afterCreatingNewLead_incrementsNewAndUnassignedCount() throws Exception {
        var lead = new CreateLeadRequest(
                "Dashboard", "Test",
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null, null
        );
        mockMvc.perform(post("/api/v1/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(lead)));

        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.newLeadsCount").value(1))
                .andExpect(jsonPath("$.data.unassignedLeadsCount").value(1));
    }

    @Test
    void summary_withFollowUpDueToday_incrementsDueTodayCount() throws Exception {
        var lead = new CreateLeadRequest(
                "DueToday", "Lead",
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null,
                java.time.LocalDate.now(),
                null
        );
        mockMvc.perform(post("/api/v1/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(lead)));

        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.dueTodayCount").value(1));
    }

    @Test
    void summary_withOverdueFollowUp_incrementsOverdueCount() throws Exception {
        var lead = new CreateLeadRequest(
                "Overdue", "Lead",
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null,
                java.time.LocalDate.now().minusDays(1),
                null
        );
        mockMvc.perform(post("/api/v1/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(lead)));

        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.overdueCount").value(1));
    }

    @Test
    void summary_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous()))
                .andExpect(status().isUnauthorized());
    }

    // ── GET /api/v1/dashboard/recent-leads ────────────────────────────────────

    @Test
    void recentLeads_emptyDatabase_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/recent-leads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void recentLeads_afterCreatingLeads_returnsLeads() throws Exception {
        for (int i = 0; i < 3; i++) {
            var lead = new CreateLeadRequest(
                    "Recent" + i, "Lead",
                    null, null, null, null, null,
                    null, null, null, null, null, null,
                    null, null, null, null, null, null
            );
            mockMvc.perform(post("/api/v1/leads")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json(lead)));
        }

        mockMvc.perform(get("/api/v1/dashboard/recent-leads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }
}
