package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.lead.dto.CreateLeadPropertyLinkRequest;
import com.localapartmentexperts.crm.lead.dto.LeadPropertyLinkDTO;
import com.localapartmentexperts.crm.lead.dto.UpdateLeadPropertyLinkRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Endpoints for linking properties to a lead.
 *
 * <ul>
 *   <li>GET    /api/v1/leads/{id}/properties              – all linked properties for a lead</li>
 *   <li>POST   /api/v1/leads/{id}/properties              – link a property to a lead</li>
 *   <li>PATCH  /api/v1/leads/{id}/properties/{linkId}     – update link type or note</li>
 *   <li>DELETE /api/v1/leads/{id}/properties/{linkId}     – remove a property link</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/leads/{leadId}/properties")
@RequiredArgsConstructor
public class LeadPropertyLinkController {

    private final LeadPropertyLinkService linkService;

    // ── GET /api/v1/leads/{leadId}/properties ─────────────────────────────────

    @GetMapping
    public ApiResponse<List<LeadPropertyLinkDTO>> list(@PathVariable UUID leadId) {
        return ApiResponse.ok(linkService.getLinksForLead(leadId));
    }

    // ── POST /api/v1/leads/{leadId}/properties ────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LeadPropertyLinkDTO> create(
            @PathVariable UUID leadId,
            @Valid @RequestBody CreateLeadPropertyLinkRequest request,
            Authentication authentication) {

        LeadPropertyLinkDTO created = linkService.create(leadId, request, authentication.getName());
        return ApiResponse.ok(created, "Property linked to lead");
    }

    // ── PATCH /api/v1/leads/{leadId}/properties/{linkId} ─────────────────────

    @PatchMapping("/{linkId}")
    public ApiResponse<LeadPropertyLinkDTO> update(
            @PathVariable UUID leadId,
            @PathVariable UUID linkId,
            @RequestBody UpdateLeadPropertyLinkRequest request,
            Authentication authentication) {

        LeadPropertyLinkDTO updated = linkService.update(leadId, linkId, request, authentication.getName());
        return ApiResponse.ok(updated, "Link updated");
    }

    // ── DELETE /api/v1/leads/{leadId}/properties/{linkId} ────────────────────

    @DeleteMapping("/{linkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID leadId,
            @PathVariable UUID linkId,
            Authentication authentication) {

        linkService.delete(leadId, linkId, authentication.getName());
    }
}
