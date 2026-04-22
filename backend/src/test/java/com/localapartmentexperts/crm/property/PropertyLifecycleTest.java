package com.localapartmentexperts.crm.property;

import com.localapartmentexperts.crm.BaseIntegrationTest;
import com.localapartmentexperts.crm.property.dto.CreatePropertyRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Transactional
@Rollback
@WithMockUser(username = "admin@test.local", roles = {"ADMIN"})
class PropertyLifecycleTest extends BaseIntegrationTest {

    private String createDraftProperty() throws Exception {
        var req = new CreatePropertyRequest(
                "Lifecycle Property", null, null, null,
                "Insurgentes Sur 500", null, "Del Valle",
                "Ciudad de México", "CDMX",
                null, null, null,
                new BigDecimal("9000"), "MONTHLY",
                "APARTMENT",
                (short) 1, (short) 1,
                null, null, false,
                null, null, null,
                null, null,
                null, null, null
        );
        MvcResult result = mockMvc.perform(post("/api/v1/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();
    }

    // ── DRAFT → PUBLISHED ─────────────────────────────────────────────────────

    @Test
    void publishProperty_fromDraft_changesStatusToPublished() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/publish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"));
    }

    @Test
    void publishProperty_alreadyPublished_returns400OrConflict() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/publish"));

        mockMvc.perform(post("/api/v1/properties/" + id + "/publish"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 409
                            : "Expected 400 or 409 but got " + status;
                });
    }

    // ── PUBLISHED → DRAFT ─────────────────────────────────────────────────────

    @Test
    void unpublishProperty_fromPublished_changesStatusToDraft() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/publish"));

        mockMvc.perform(post("/api/v1/properties/" + id + "/unpublish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DRAFT"));
    }

    @Test
    void unpublishProperty_fromDraft_returns400OrConflict() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/unpublish"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 409
                            : "Expected 400 or 409 but got " + status;
                });
    }

    // ── ANY → ARCHIVED ────────────────────────────────────────────────────────

    @Test
    void archiveProperty_fromDraft_changesStatusToArchived() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/archive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
    }

    @Test
    void archiveProperty_fromPublished_changesStatusToArchived() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/publish"));

        mockMvc.perform(post("/api/v1/properties/" + id + "/archive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
    }

    @Test
    void archiveProperty_alreadyArchived_returns400OrConflict() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/archive"));

        mockMvc.perform(post("/api/v1/properties/" + id + "/archive"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 409
                            : "Expected 400 or 409 but got " + status;
                });
    }

    @Test
    void publishProperty_fromArchived_returns400OrConflict() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/archive"));

        mockMvc.perform(post("/api/v1/properties/" + id + "/publish"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 409
                            : "Expected 400 or 409 but got " + status;
                });
    }

    // ── Activity log ──────────────────────────────────────────────────────────

    @Test
    void getPropertyActivities_afterLifecycleEvents_returnsTimeline() throws Exception {
        String id = createDraftProperty();

        mockMvc.perform(post("/api/v1/properties/" + id + "/publish"));
        mockMvc.perform(post("/api/v1/properties/" + id + "/unpublish"));

        mockMvc.perform(get("/api/v1/properties/" + id + "/activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }
}
