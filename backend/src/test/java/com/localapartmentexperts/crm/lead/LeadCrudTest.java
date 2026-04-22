package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.BaseIntegrationTest;
import com.localapartmentexperts.crm.lead.dto.CreateLeadRequest;
import com.localapartmentexperts.crm.lead.dto.UpdateLeadRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
@Rollback
@WithMockUser(username = "admin@test.local", roles = {"ADMIN"})
class LeadCrudTest extends BaseIntegrationTest {

    private static CreateLeadRequest minimalLead() {
        return new CreateLeadRequest(
                "Ana", "García",
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null, null
        );
    }

    private static CreateLeadRequest fullLead() {
        return new CreateLeadRequest(
                "Carlos", "López",
                "carlos@example.com", "+525551234567", "+525559876543",
                com.localapartmentexperts.crm.common.enums.ContactMethod.WHATSAPP,
                com.localapartmentexperts.crm.common.enums.LeadSource.REFERRAL,
                LocalDate.now().plusMonths(2),
                new BigDecimal("5000"), new BigDecimal("12000"),
                java.util.List.of("Polanco", "Condesa"),
                (short) 2, (short) 1,
                "Looking for a furnished apartment",
                "es",
                com.localapartmentexperts.crm.common.enums.UrgencyLevel.HIGH,
                null,
                LocalDate.now().plusDays(3),
                null
        );
    }

    // ── POST /api/v1/leads ────────────────────────────────────────────────────

    @Test
    void createLead_withMinimalData_returns201() throws Exception {
        mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(minimalLead())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Ana"))
                .andExpect(jsonPath("$.data.lastName").value("García"))
                .andExpect(jsonPath("$.data.status").value("NEW"));
    }

    @Test
    void createLead_withFullData_persistsAllFields() throws Exception {
        mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(fullLead())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email").value("carlos@example.com"))
                .andExpect(jsonPath("$.data.phone").value("+525551234567"))
                .andExpect(jsonPath("$.data.urgencyLevel").value("HIGH"))
                .andExpect(jsonPath("$.data.status").value("NEW"));
    }

    @Test
    void createLead_missingFirstName_returns400() throws Exception {
        var request = new CreateLeadRequest(
                "", "García",
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null, null
        );
        mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createLead_missingLastName_returns400() throws Exception {
        var request = new CreateLeadRequest(
                "Ana", "",
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null, null
        );
        mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createLead_invalidEmail_returns400() throws Exception {
        var request = new CreateLeadRequest(
                "Ana", "García",
                "not-an-email", null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null, null
        );
        mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createLead_negativeBudget_returns400() throws Exception {
        var request = new CreateLeadRequest(
                "Ana", "García",
                null, null, null, null, null,
                null, new BigDecimal("-100"), null, null, null, null,
                null, null, null, null, null, null
        );
        mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/v1/leads ─────────────────────────────────────────────────────

    @Test
    void listLeads_emptyDatabase_returnsEmptyPage() throws Exception {
        mockMvc.perform(get("/api/v1/leads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void listLeads_afterCreation_returnsPaginatedResult() throws Exception {
        mockMvc.perform(post("/api/v1/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(minimalLead())));

        mockMvc.perform(get("/api/v1/leads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.totalElements").value(greaterThanOrEqualTo(1)));
    }

    @Test
    void listLeads_searchByName_filtersResults() throws Exception {
        mockMvc.perform(post("/api/v1/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(minimalLead())));

        mockMvc.perform(get("/api/v1/leads").param("search", "Ana"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].firstName").value("Ana"));
    }

    @Test
    void listLeads_filterByStatus_returnsMatchingLeads() throws Exception {
        mockMvc.perform(post("/api/v1/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(minimalLead())));

        mockMvc.perform(get("/api/v1/leads").param("status", "NEW"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].status", everyItem(is("NEW"))));
    }

    @Test
    void listLeads_pagination_respectsPageSizeParam() throws Exception {
        for (int i = 0; i < 3; i++) {
            var lead = new CreateLeadRequest("Lead" + i, "Test",
                    null, null, null, null, null,
                    null, null, null, null, null, null,
                    null, null, null, null, null, null);
            mockMvc.perform(post("/api/v1/leads")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json(lead)));
        }

        mockMvc.perform(get("/api/v1/leads").param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.totalPages").value(greaterThanOrEqualTo(2)));
    }

    // ── GET /api/v1/leads/{id} ────────────────────────────────────────────────

    @Test
    void getLeadById_existingLead_returnsDetail() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(fullLead())))
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(get("/api/v1/leads/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id))
                .andExpect(jsonPath("$.data.firstName").value("Carlos"));
    }

    @Test
    void getLeadById_nonExistentId_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/leads/00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    // ── PATCH /api/v1/leads/{id} ──────────────────────────────────────────────

    @Test
    void updateLead_changesFields() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(minimalLead())))
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .at("/data/id").asText();

        // UpdateLeadRequest — only email is changed
        String patch = """
                {"email":"updated@example.com"}
                """;

        mockMvc.perform(patch("/api/v1/leads/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patch))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("updated@example.com"))
                .andExpect(jsonPath("$.data.firstName").value("Ana"));
    }

    @Test
    void updateLead_nonExistentId_returns404() throws Exception {
        String patch = """
                {"email":"updated@example.com"}
                """;
        mockMvc.perform(patch("/api/v1/leads/00000000-0000-0000-0000-000000000000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patch))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateLead_withInvalidEmail_returns400() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(minimalLead())))
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .at("/data/id").asText();

        String patch = """
                {"email":"not-valid"}
                """;

        mockMvc.perform(patch("/api/v1/leads/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patch))
                .andExpect(status().isBadRequest());
    }
}
