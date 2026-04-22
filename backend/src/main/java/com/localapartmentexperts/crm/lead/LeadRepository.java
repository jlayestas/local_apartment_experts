package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.enums.LeadStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface LeadRepository extends JpaRepository<Lead, UUID>, JpaSpecificationExecutor<Lead> {

    // ── Dashboard counts ──────────────────────────────────────────────────

    /** Count leads with the given status. Used for the "NEW leads" dashboard card. */
    long countByStatus(LeadStatus status);

    /** Count leads with no assigned agent. Used for the "Unassigned" dashboard card. */
    long countByAssignedUserIsNull();

    /**
     * Count leads whose follow-up date is exactly today and are not in a terminal status.
     * Used for the "Due Today" dashboard card.
     */
    @Query("""
            SELECT COUNT(l) FROM Lead l
            WHERE l.nextFollowUpDate = :today
              AND l.status NOT IN :excludedStatuses
            """)
    long countDueOn(@Param("today") LocalDate today,
                    @Param("excludedStatuses") Collection<LeadStatus> excludedStatuses);

    /**
     * Count leads whose follow-up date is in the past and are not in a terminal status.
     * Used for the "Overdue" dashboard card.
     */
    @Query("""
            SELECT COUNT(l) FROM Lead l
            WHERE l.nextFollowUpDate < :today
              AND l.status NOT IN :excludedStatuses
            """)
    long countOverdueBefore(@Param("today") LocalDate today,
                            @Param("excludedStatuses") Collection<LeadStatus> excludedStatuses);

    // ── Dashboard recent leads ────────────────────────────────────────────────

    /**
     * Fetches the most recently created leads with their assignees in a single query.
     * LEFT JOIN FETCH avoids N+1 on assignedUser for this small, fixed-size result.
     * Pass {@code PageRequest.of(0, 10)} for the standard dashboard list.
     */
    @Query("""
            SELECT l FROM Lead l
            LEFT JOIN FETCH l.assignedUser
            ORDER BY l.createdAt DESC
            """)
    List<Lead> findRecentLeads(Pageable pageable);
}
