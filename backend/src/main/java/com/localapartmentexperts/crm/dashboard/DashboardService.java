package com.localapartmentexperts.crm.dashboard;

import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.dashboard.dto.DashboardSummaryDTO;
import com.localapartmentexperts.crm.lead.LeadRepository;
import com.localapartmentexperts.crm.lead.dto.LeadSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final int RECENT_LEADS_LIMIT = 10;

    private final LeadRepository leadRepository;

    /**
     * Returns the four summary counts for the dashboard cards.
     * All four counts are independent queries — no joins, all hit indexed columns.
     */
    public DashboardSummaryDTO getSummary() {
        LocalDate today = LocalDate.now();

        long newLeadsCount        = leadRepository.countByStatus(LeadStatus.NEW);
        long unassignedLeadsCount = leadRepository.countByAssignedUserIsNull();
        long dueTodayCount        = leadRepository.countDueOn(today, LeadStatus.terminalStatuses());
        long overdueCount         = leadRepository.countOverdueBefore(today, LeadStatus.terminalStatuses());

        return new DashboardSummaryDTO(newLeadsCount, unassignedLeadsCount, dueTodayCount, overdueCount);
    }

    /**
     * Returns the 10 most recently created leads for the dashboard feed.
     * Reuses {@link LeadSummaryDTO} — same shape as the leads list, no new DTO needed.
     */
    public List<LeadSummaryDTO> getRecentLeads() {
        return leadRepository
                .findRecentLeads(PageRequest.of(0, RECENT_LEADS_LIMIT))
                .stream()
                .map(LeadSummaryDTO::from)
                .toList();
    }
}
