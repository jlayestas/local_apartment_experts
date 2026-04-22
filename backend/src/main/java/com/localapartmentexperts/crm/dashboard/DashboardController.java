package com.localapartmentexperts.crm.dashboard;

import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.dashboard.dto.DashboardSummaryDTO;
import com.localapartmentexperts.crm.lead.dto.LeadSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // ── GET /api/v1/dashboard/summary ─────────────────────────────────────────

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryDTO> summary() {
        return ApiResponse.ok(dashboardService.getSummary());
    }

    // ── GET /api/v1/dashboard/recent-leads ────────────────────────────────────

    @GetMapping("/recent-leads")
    public ApiResponse<List<LeadSummaryDTO>> recentLeads() {
        return ApiResponse.ok(dashboardService.getRecentLeads());
    }
}
