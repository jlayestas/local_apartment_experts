package com.localapartmentexperts.crm.activity;

import com.localapartmentexperts.crm.activity.dto.ActivityDTO;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.lead.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads/{leadId}/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final LeadRepository leadRepository;

    /**
     * Returns the full activity timeline for a lead, newest first.
     * Returns 404 if no lead exists with the given id.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getLeadTimeline(
            @PathVariable UUID leadId) {

        if (!leadRepository.existsById(leadId)) {
            throw new ResourceNotFoundException("Lead not found: " + leadId);
        }

        List<ActivityDTO> timeline = activityService.getLeadTimeline(leadId);
        return ResponseEntity.ok(ApiResponse.ok(timeline));
    }
}
