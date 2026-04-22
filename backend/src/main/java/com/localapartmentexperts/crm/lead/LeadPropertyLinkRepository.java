package com.localapartmentexperts.crm.lead;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeadPropertyLinkRepository extends JpaRepository<LeadPropertyLink, UUID> {

    /**
     * All links for a lead, newest first.
     * Eagerly fetches property and createdBy to avoid N+1 when building DTOs.
     */
    @Query("""
            SELECT lpl FROM LeadPropertyLink lpl
            LEFT JOIN FETCH lpl.property
            LEFT JOIN FETCH lpl.createdBy
            WHERE lpl.lead.id = :leadId
            ORDER BY lpl.createdAt DESC
            """)
    List<LeadPropertyLink> findByLeadIdOrderByCreatedAtDesc(@Param("leadId") UUID leadId);

    /**
     * Checks whether a (lead, property, link_type) triple already exists.
     * Used to enforce uniqueness before insert.
     */
    boolean existsByLeadIdAndPropertyIdAndLinkType(
            UUID leadId, UUID propertyId, LeadPropertyLinkType linkType);

    /**
     * Finds a specific link by its id, fetching property and createdBy eagerly.
     * Used after PATCH to return a fully-populated DTO without a second query.
     */
    @Query("""
            SELECT lpl FROM LeadPropertyLink lpl
            LEFT JOIN FETCH lpl.property
            LEFT JOIN FETCH lpl.createdBy
            WHERE lpl.id = :id
            """)
    Optional<LeadPropertyLink> findByIdWithDetails(@Param("id") UUID id);
}
