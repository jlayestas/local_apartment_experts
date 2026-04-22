package com.localapartmentexperts.crm.dashboard.dto;

/**
 * Counts displayed on the CRM dashboard summary cards.
 *
 * <ul>
 *   <li>{@code newLeadsCount}        — leads with status NEW</li>
 *   <li>{@code unassignedLeadsCount} — leads with no assigned agent</li>
 *   <li>{@code dueTodayCount}        — open leads whose follow-up date is today</li>
 *   <li>{@code overdueCount}         — open leads whose follow-up date is in the past</li>
 * </ul>
 */
public record DashboardSummaryDTO(
        long newLeadsCount,
        long unassignedLeadsCount,
        long dueTodayCount,
        long overdueCount
) {}
