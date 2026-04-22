package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.BaseIntegrationTest;
import com.localapartmentexperts.crm.lead.dto.CreateLeadRequest;
import com.localapartmentexperts.crm.lead.dto.CreateNoteRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
@Rollback
@WithMockUser(username = "admin@test.local", roles = {"ADMIN"})
class LeadNoteControllerTest extends BaseIntegrationTest {

    private String createLead() throws Exception {
        var request = new CreateLeadRequest(
                "Note", "TestLead",
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

    // ── POST /api/v1/leads/{leadId}/notes ─────────────────────────────────────

    @Test
    void addNote_withValidBody_returns201() throws Exception {
        String leadId = createLead();

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new CreateNoteRequest("Client called back, very interested."))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.body").value("Client called back, very interested."))
                .andExpect(jsonPath("$.data.authorName").isNotEmpty())
                .andExpect(jsonPath("$.data.createdAt").isNotEmpty());
    }

    @Test
    void addNote_withBlankBody_returns400() throws Exception {
        String leadId = createLead();

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new CreateNoteRequest(""))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addNote_withWhitespaceBody_returns400() throws Exception {
        String leadId = createLead();

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new CreateNoteRequest("   "))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addNote_onNonExistentLead_returns404() throws Exception {
        mockMvc.perform(post("/api/v1/leads/00000000-0000-0000-0000-000000000000/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new CreateNoteRequest("A note"))))
                .andExpect(status().isNotFound());
    }

    // ── GET /api/v1/leads/{leadId}/notes ──────────────────────────────────────

    @Test
    void listNotes_noNotes_returnsEmptyList() throws Exception {
        String leadId = createLead();

        mockMvc.perform(get("/api/v1/leads/" + leadId + "/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void listNotes_afterAddingNotes_returnsAllNotes() throws Exception {
        String leadId = createLead();

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(new CreateNoteRequest("First note"))));
        mockMvc.perform(post("/api/v1/leads/" + leadId + "/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(new CreateNoteRequest("Second note"))));

        mockMvc.perform(get("/api/v1/leads/" + leadId + "/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    void listNotes_onNonExistentLead_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/leads/00000000-0000-0000-0000-000000000000/notes"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listNotes_notesAreOrderedMostRecentFirst() throws Exception {
        String leadId = createLead();

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(new CreateNoteRequest("Older note"))));
        mockMvc.perform(post("/api/v1/leads/" + leadId + "/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(new CreateNoteRequest("Newer note"))));

        mockMvc.perform(get("/api/v1/leads/" + leadId + "/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].body").value("Newer note"));
    }
}
