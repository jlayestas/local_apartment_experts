package com.localapartmentexperts.crm.lead;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeadAssignmentRepository extends JpaRepository<LeadAssignment, UUID> {

    /** Full assignment history for a lead, oldest first — for the detail-page timeline. */
    List<LeadAssignment> findByLeadIdOrderByCreatedAtAsc(UUID leadId);

    /**
     * Most recent assignment record for a lead.
     * Prefer leads.assigned_user_id as the source of truth for the current assignee;
     * use this only when you need to know *who made* the last assignment.
     */
    Optional<LeadAssignment> findFirstByLeadIdOrderByCreatedAtDesc(UUID leadId);
}
