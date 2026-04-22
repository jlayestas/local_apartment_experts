package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.BaseIntegrationTest;
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
class LeadPropertyLinkControllerTest extends BaseIntegrationTest {

    private String createLead() throws Exception {
        String body = """
                {"firstName":"Link","lastName":"TestLead"}
                """;
        MvcResult r = mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString()).at("/data/id").asText();
    }

    private String createProperty() throws Exception {
        String body = """
                {
                  "title":"Link Test Property",
                  "addressLine1":"Av. Insurgentes 100",
                  "city":"CDMX",
                  "state":"CDMX",
                  "propertyType":"APARTMENT",
                  "price":9000,
                  "priceFrequency":"MONTHLY"
                }
                """;
        MvcResult r = mockMvc.perform(post("/api/v1/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString()).at("/data/id").asText();
    }

    // ── POST /api/v1/leads/{leadId}/properties ────────────────────────────────

    @Test
    void linkProperty_returns201WithLinkPayload() throws Exception {
        String leadId = createLead();
        String propId = createProperty();

        String body = String.format("""
                {"propertyId":"%s","linkType":"SUGGESTED"}
                """, propId);

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.leadId").value(leadId))
                .andExpect(jsonPath("$.data.propertyId").value(propId))
                .andExpect(jsonPath("$.data.linkType").value("SUGGESTED"))
                .andExpect(jsonPath("$.data.property.title").value("Link Test Property"));
    }

    @Test
    void linkProperty_withNote_persistsNote() throws Exception {
        String leadId = createLead();
        String propId = createProperty();

        String body = String.format("""
                {"propertyId":"%s","linkType":"INTERESTED","note":"Client really likes this one"}
                """, propId);

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.note").value("Client really likes this one"));
    }

    @Test
    void linkProperty_missingPropertyId_returns400() throws Exception {
        String leadId = createLead();

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"linkType":"SUGGESTED"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void linkProperty_missingLinkType_returns400() throws Exception {
        String leadId = createLead();
        String propId = createProperty();

        String body = String.format("""
                {"propertyId":"%s"}
                """, propId);

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void linkProperty_duplicateLinkType_returns409() throws Exception {
        String leadId = createLead();
        String propId = createProperty();
        String body = String.format("""
                {"propertyId":"%s","linkType":"SUGGESTED"}
                """, propId);

        // First link succeeds
        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        // Same (lead, property, linkType) triple must be rejected
        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void linkProperty_nonExistentLead_returns404() throws Exception {
        String propId = createProperty();
        String body = String.format("""
                {"propertyId":"%s","linkType":"SUGGESTED"}
                """, propId);

        mockMvc.perform(post("/api/v1/leads/00000000-0000-0000-0000-000000000000/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void linkProperty_nonExistentProperty_returns404() throws Exception {
        String leadId = createLead();

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"propertyId":"00000000-0000-0000-0000-000000000000","linkType":"SUGGESTED"}
                                """))
                .andExpect(status().isNotFound());
    }

    // ── GET /api/v1/leads/{leadId}/properties ─────────────────────────────────

    @Test
    void listLinks_noLinks_returnsEmptyArray() throws Exception {
        String leadId = createLead();

        mockMvc.perform(get("/api/v1/leads/" + leadId + "/properties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void listLinks_afterLinking_returnsLinks() throws Exception {
        String leadId = createLead();
        String propId = createProperty();

        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                        {"propertyId":"%s","linkType":"SUGGESTED"}
                        """, propId)));

        mockMvc.perform(get("/api/v1/leads/" + leadId + "/properties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].propertyId").value(propId));
    }

    // ── PATCH /api/v1/leads/{leadId}/properties/{linkId} ─────────────────────

    @Test
    void updateLink_changeLinkType_returnsUpdatedLink() throws Exception {
        String leadId = createLead();
        String propId = createProperty();

        MvcResult r = mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {"propertyId":"%s","linkType":"SUGGESTED"}
                                """, propId)))
                .andReturn();
        String linkId = objectMapper.readTree(r.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(patch("/api/v1/leads/" + leadId + "/properties/" + linkId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"linkType":"INTERESTED"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.linkType").value("INTERESTED"));
    }

    @Test
    void updateLink_addNote_persistsNote() throws Exception {
        String leadId = createLead();
        String propId = createProperty();

        MvcResult r = mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {"propertyId":"%s","linkType":"SUGGESTED"}
                                """, propId)))
                .andReturn();
        String linkId = objectMapper.readTree(r.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(patch("/api/v1/leads/" + leadId + "/properties/" + linkId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"note":"Toured on Tuesday, lead loved the kitchen"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.note").value("Toured on Tuesday, lead loved the kitchen"));
    }

    // ── DELETE /api/v1/leads/{leadId}/properties/{linkId} ────────────────────

    @Test
    void deleteLink_returns204() throws Exception {
        String leadId = createLead();
        String propId = createProperty();

        MvcResult r = mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {"propertyId":"%s","linkType":"SUGGESTED"}
                                """, propId)))
                .andReturn();
        String linkId = objectMapper.readTree(r.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(delete("/api/v1/leads/" + leadId + "/properties/" + linkId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteLink_linkIsGoneFromList() throws Exception {
        String leadId = createLead();
        String propId = createProperty();

        MvcResult r = mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {"propertyId":"%s","linkType":"SUGGESTED"}
                                """, propId)))
                .andReturn();
        String linkId = objectMapper.readTree(r.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(delete("/api/v1/leads/" + leadId + "/properties/" + linkId));

        mockMvc.perform(get("/api/v1/leads/" + leadId + "/properties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void deleteLink_nonExistentLink_returns404() throws Exception {
        String leadId = createLead();

        mockMvc.perform(delete("/api/v1/leads/" + leadId + "/properties/00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    void relinkAfterDelete_succeeds() throws Exception {
        String leadId = createLead();
        String propId = createProperty();
        String linkBody = String.format("""
                {"propertyId":"%s","linkType":"SUGGESTED"}
                """, propId);

        MvcResult r = mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(linkBody))
                .andReturn();
        String linkId = objectMapper.readTree(r.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(delete("/api/v1/leads/" + leadId + "/properties/" + linkId));

        // Re-linking the same property+type after deletion must succeed
        mockMvc.perform(post("/api/v1/leads/" + leadId + "/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(linkBody))
                .andExpect(status().isCreated());
    }
}
