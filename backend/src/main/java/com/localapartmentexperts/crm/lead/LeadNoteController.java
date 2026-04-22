package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.lead.dto.CreateNoteRequest;
import com.localapartmentexperts.crm.lead.dto.NoteDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads/{leadId}/notes")
@RequiredArgsConstructor
public class LeadNoteController {

    private final LeadNoteService leadNoteService;

    // ── POST /api/v1/leads/{leadId}/notes ─────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NoteDTO> create(
            @PathVariable UUID leadId,
            @Valid @RequestBody CreateNoteRequest request,
            Authentication authentication) {

        NoteDTO created = leadNoteService.create(leadId, request, authentication.getName());
        return ApiResponse.ok(created, "Note added");
    }

    // ── GET /api/v1/leads/{leadId}/notes ──────────────────────────────────────

    @GetMapping
    public ApiResponse<List<NoteDTO>> list(@PathVariable UUID leadId) {
        return ApiResponse.ok(leadNoteService.getLeadNotes(leadId));
    }
}
