package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Append-only free-text note attached to a lead.
 * Notes are never edited or deleted in v1.
 * Does not extend BaseEntity — immutable records have no updated_at.
 */
@Entity
@Table(name = "lead_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
