package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable record of a single status transition on a lead.
 * Written once per status change — never updated.
 * Companion to the activities table: this table is structured for queries;
 * activities is ordered for display.
 */
@Entity
@Table(name = "lead_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    /**
     * NULL on the initial LEAD_CREATED record — no previous status exists.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 40)
    private LeadStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 40)
    private LeadStatus toStatus;

    /**
     * The employee who made the change. NULL for system-initiated transitions.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    /** Optional free-text reason recorded at transition time. */
    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
