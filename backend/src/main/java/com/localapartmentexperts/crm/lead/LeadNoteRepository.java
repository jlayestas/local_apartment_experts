package com.localapartmentexperts.crm.lead;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeadNoteRepository extends JpaRepository<LeadNote, UUID> {

    /** All notes for a lead, newest first — primary read pattern for the detail page. */
    List<LeadNote> findByLeadIdOrderByCreatedAtDesc(UUID leadId);

    /** Note count per lead — useful for summary views without loading body text. */
    long countByLeadId(UUID leadId);
}
