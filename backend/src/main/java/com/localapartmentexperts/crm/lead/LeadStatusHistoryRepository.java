package com.localapartmentexperts.crm.lead;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeadStatusHistoryRepository extends JpaRepository<LeadStatusHistory, UUID> {

    /** Full status history for a lead, oldest first — used to render the transition timeline. */
    List<LeadStatusHistory> findByLeadIdOrderByCreatedAtAsc(UUID leadId);

    /**
     * Most recent status change record for a lead.
     * Useful for displaying the last transition without loading the full history.
     */
    Optional<LeadStatusHistory> findFirstByLeadIdOrderByCreatedAtDesc(UUID leadId);
}
