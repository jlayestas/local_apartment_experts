package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Records the relationship between a lead and a specific property.
 * Agents use this to suggest listings, track interest, log tours, and record rejections.
 *
 * <p>Multiple link types for the same (lead, property) pair may coexist as separate rows
 * to capture the full progression over time (SUGGESTED → INTERESTED → TOURED).
 * The DB enforces UNIQUE (lead_id, property_id, link_type).
 *
 * <p>Does not extend BaseEntity — this table has no updated_at; rows are append-only
 * except for the nullable note field which agents may correct.
 *
 * <p>Persisted to the {@code lead_property_links} table (see V13__create_lead_property_links.sql).
 */
@Entity
@Table(name = "lead_property_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadPropertyLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", nullable = false, length = 20)
    private LeadPropertyLinkType linkType;

    /** Optional agent note, e.g. reason for rejection or feedback after a tour. */
    @Column(columnDefinition = "TEXT")
    private String note;

    /** The employee who created this link record. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
