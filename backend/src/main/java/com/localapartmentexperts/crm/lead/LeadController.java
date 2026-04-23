package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.common.response.PagedResponse;
import com.localapartmentexperts.crm.lead.dto.AssignLeadRequest;
import com.localapartmentexperts.crm.lead.dto.ChangeStatusRequest;
import com.localapartmentexperts.crm.lead.dto.CreateLeadRequest;
import com.localapartmentexperts.crm.lead.dto.LeadDetailDTO;
import com.localapartmentexperts.crm.lead.dto.LeadSummaryDTO;
import com.localapartmentexperts.crm.lead.dto.RecommendedPropertyDTO;
import com.localapartmentexperts.crm.lead.dto.UpdateLeadRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
@Validated
public class LeadController {

    private final LeadService leadService;
    private final PropertyRecommendationService recommendationService;

    // ── POST /api/v1/leads ────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LeadDetailDTO> create(
            @Valid @RequestBody CreateLeadRequest request,
            Authentication authentication) {

        LeadDetailDTO created = leadService.create(request, authentication.getName());
        return ApiResponse.ok(created, "Lead created");
    }

    // ── GET /api/v1/leads ─────────────────────────────────────────────────────

    @GetMapping
    public ApiResponse<PagedResponse<LeadSummaryDTO>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) UUID assignedUserId,
            @RequestParam(required = false) LeadSource source,
            @RequestParam(required = false) Boolean followUpDue,
            @RequestParam(required = false) LocalDate createdFrom,
            @RequestParam(required = false) LocalDate createdTo,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        Page<LeadSummaryDTO> result = leadService.list(
                search, status, assignedUserId, source,
                followUpDue, createdFrom, createdTo, page, size);

        return ApiResponse.ok(new PagedResponse<>(result));
    }

    // ── GET /api/v1/leads/{id} ────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ApiResponse<LeadDetailDTO> getById(@PathVariable UUID id) {
        return ApiResponse.ok(leadService.getById(id));
    }

    // ── PATCH /api/v1/leads/{id} ──────────────────────────────────────────────

    @PatchMapping("/{id}")
    public ApiResponse<LeadDetailDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLeadRequest request,
            Authentication authentication) {

        LeadDetailDTO updated = leadService.update(id, request, authentication.getName());
        return ApiResponse.ok(updated, "Lead updated");
    }

    // ── POST /api/v1/leads/{id}/status ────────────────────────────────────────

    @PostMapping("/{id}/status")
    public ApiResponse<LeadDetailDTO> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeStatusRequest request,
            Authentication authentication) {

        LeadDetailDTO updated = leadService.changeStatus(id, request, authentication.getName());
        return ApiResponse.ok(updated, "Status updated to " + updated.status());
    }

    // ── POST /api/v1/leads/{id}/assign ────────────────────────────────────────

    @PostMapping("/{id}/assign")
    public ApiResponse<LeadDetailDTO> assign(
            @PathVariable UUID id,
            @Valid @RequestBody AssignLeadRequest request,
            Authentication authentication) {

        LeadDetailDTO updated = leadService.assign(id, request, authentication.getName());
        return ApiResponse.ok(updated, "Lead assigned");
    }

    // ── GET /api/v1/leads/{leadId}/recommended-properties ─────────────────────

    @GetMapping("/{leadId}/recommended-properties")
    public ApiResponse<List<RecommendedPropertyDTO>> getRecommendedProperties(
            @PathVariable UUID leadId,
            @RequestParam(defaultValue = "3") @Min(1) @Max(20) int limit) {

        return ApiResponse.ok(recommendationService.recommend(leadId, limit));
    }
}
