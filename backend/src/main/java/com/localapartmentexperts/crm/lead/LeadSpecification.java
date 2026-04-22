package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Static factory for building {@link Specification<Lead>} predicates.
 *
 * <p>Each filter is optional — null means "no constraint". All active predicates
 * are AND-ed together. The specification is passed to
 * {@link LeadRepository#findAll(Specification, org.springframework.data.domain.Pageable)}.
 */
public final class LeadSpecification {

    private LeadSpecification() {}

    /**
     * Builds a specification from the given filter values.
     *
     * @param search       case-insensitive substring match across firstName, lastName, email, phone
     * @param status       exact status match
     * @param assignedUserId exact assignee match; use a sentinel or separate "unassigned" filter if needed
     * @param source       exact source match
     * @param followUpDue  when {@code true}: nextFollowUpDate &le; today AND status is not terminal
     * @param createdFrom  inclusive start of createdAt range (interpreted as start of day UTC)
     * @param createdTo    inclusive end of createdAt range (interpreted as end of day UTC)
     */
    public static Specification<Lead> withFilters(
            String search,
            LeadStatus status,
            UUID assignedUserId,
            LeadSource source,
            Boolean followUpDue,
            LocalDate createdFrom,
            LocalDate createdTo) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ── Text search ───────────────────────────────────────────────────
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern)
                ));
            }

            // ── Status ────────────────────────────────────────────────────────
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // ── Assigned user ─────────────────────────────────────────────────
            if (assignedUserId != null) {
                predicates.add(cb.equal(root.get("assignedUser").get("id"), assignedUserId));
            }

            // ── Source ────────────────────────────────────────────────────────
            if (source != null) {
                predicates.add(cb.equal(root.get("source"), source));
            }

            // ── Follow-up due ─────────────────────────────────────────────────
            // "Due" = nextFollowUpDate is set and on or before today, and the lead is not closed
            if (Boolean.TRUE.equals(followUpDue)) {
                predicates.add(cb.isNotNull(root.get("nextFollowUpDate")));
                predicates.add(cb.lessThanOrEqualTo(root.get("nextFollowUpDate"), LocalDate.now()));
                predicates.add(root.get("status").in(LeadStatus.openStatuses()));
            }

            // ── Created date range ────────────────────────────────────────────
            if (createdFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        createdFrom.atStartOfDay().toInstant(ZoneOffset.UTC)
                ));
            }

            if (createdTo != null) {
                // Inclusive: include the full createdTo day
                predicates.add(cb.lessThan(
                        root.get("createdAt"),
                        createdTo.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)
                ));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
