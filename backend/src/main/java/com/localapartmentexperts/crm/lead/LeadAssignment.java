package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable record of a single assignment event on a lead.
 * The *current* assignment is leads.assigned_user_id (source of truth).
 * This table is the historical audit trail: who assigned whom, and when.
 * assigned_to = NULL means the lead was explicitly unassigned.
 */
@Entity
@Table(name = "lead_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    /**
     * The employee the lead was assigned to. NULL = explicitly unassigned.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    /**
     * The employee who performed the assignment action.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    private User assignedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
