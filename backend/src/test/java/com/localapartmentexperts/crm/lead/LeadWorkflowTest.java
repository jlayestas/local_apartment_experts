package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.BaseIntegrationTest;
import com.localapartmentexperts.crm.lead.dto.AssignLeadRequest;
import com.localapartmentexperts.crm.lead.dto.ChangeStatusRequest;
import com.localapartmentexperts.crm.lead.dto.CreateLeadRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
@Rollback
@WithMockUser(username = "admin@test.local", roles = {"ADMIN"})
class LeadWorkflowTest extends BaseIntegrationTest {

    private String createLead() throws Exception {
        var request = new CreateLeadRequest(
                "Workflow", "Lead",
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null, null
        );
        MvcResult result = mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();
    }

    // ── Status transitions ────────────────────────────────────────────────────

    @Test
    void changeStatus_newToContactAttempted_succeeds() throws Exception {
        String id = createLead();

        mockMvc.perform(post("/api/v1/leads/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChangeStatusRequest(
                                com.localapartmentexperts.crm.common.enums.LeadStatus.CONTACT_ATTEMPTED,
                                "Called but no answer"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONTACT_ATTEMPTED"));
    }

    @Test
    void changeStatus_fullForwardChain_eachStepSucceeds() throws Exception {
        String id = createLead();

        String[] forwardStatuses = {
                "CONTACT_ATTEMPTED", "CONTACTED", "QUALIFIED",
                "APPOINTMENT_SCHEDULED", "APPLICATION_IN_PROGRESS"
        };
        for (String status : forwardStatuses) {
            mockMvc.perform(post("/api/v1/leads/" + id + "/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new ChangeStatusRequest(
                                    com.localapartmentexperts.crm.common.enums.LeadStatus.valueOf(status),
                                    "Moving forward"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status").value(status));
        }
    }

    @Test
    void changeStatus_toClosedWon_makesLeadTerminal() throws Exception {
        String id = createLead();

        mockMvc.perform(post("/api/v1/leads/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChangeStatusRequest(
                                com.localapartmentexperts.crm.common.enums.LeadStatus.CLOSED_WON,
                                "Signed lease"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CLOSED_WON"));
    }

    @Test
    void changeStatus_fromClosedWon_isRejected() throws Exception {
        String id = createLead();

        // First close it
        mockMvc.perform(post("/api/v1/leads/" + id + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(new ChangeStatusRequest(
                        com.localapartmentexperts.crm.common.enums.LeadStatus.CLOSED_WON, "Done"))));

        // Then try to reopen — must fail
        mockMvc.perform(post("/api/v1/leads/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChangeStatusRequest(
                                com.localapartmentexperts.crm.common.enums.LeadStatus.NEW,
                                "Trying to reopen"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void changeStatus_fromClosedLost_isRejected() throws Exception {
        String id = createLead();

        mockMvc.perform(post("/api/v1/leads/" + id + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(new ChangeStatusRequest(
                        com.localapartmentexperts.crm.common.enums.LeadStatus.CLOSED_LOST, "Not interested"))));

        mockMvc.perform(post("/api/v1/leads/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChangeStatusRequest(
                                com.localapartmentexperts.crm.common.enums.LeadStatus.CONTACTED,
                                "Reopening"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void changeStatus_toUnresponsive_succeeds() throws Exception {
        String id = createLead();

        mockMvc.perform(post("/api/v1/leads/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChangeStatusRequest(
                                com.localapartmentexperts.crm.common.enums.LeadStatus.UNRESPONSIVE,
                                "No response after 3 attempts"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("UNRESPONSIVE"));
    }

    @Test
    void changeStatus_onNonExistentLead_returns404() throws Exception {
        mockMvc.perform(post("/api/v1/leads/00000000-0000-0000-0000-000000000000/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChangeStatusRequest(
                                com.localapartmentexperts.crm.common.enums.LeadStatus.CONTACTED,
                                "Note"))))
                .andExpect(status().isNotFound());
    }

    // ── Lead assignment ───────────────────────────────────────────────────────

    @Test
    void assignLead_toActiveAgent_succeeds() throws Exception {
        String id = createLead();
        UUID agentId = userRepository.findByEmail(AGENT_EMAIL)
                .orElseThrow().getId();

        mockMvc.perform(post("/api/v1/leads/" + id + "/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new AssignLeadRequest(agentId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assignedAgent").isNotEmpty());
    }

    @Test
    void assignLead_toNonExistentUser_returns404() throws Exception {
        String id = createLead();

        mockMvc.perform(post("/api/v1/leads/" + id + "/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new AssignLeadRequest(
                                UUID.fromString("00000000-0000-0000-0000-000000000000")))))
                .andExpect(status().isNotFound());
    }

    @Test
    void assignLead_toNonExistentLead_returns404() throws Exception {
        UUID agentId = userRepository.findByEmail(AGENT_EMAIL)
                .orElseThrow().getId();

        mockMvc.perform(post("/api/v1/leads/00000000-0000-0000-0000-000000000000/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new AssignLeadRequest(agentId))))
                .andExpect(status().isNotFound());
    }
}
