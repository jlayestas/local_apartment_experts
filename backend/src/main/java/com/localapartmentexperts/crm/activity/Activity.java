package com.localapartmentexperts.crm.activity;

import com.localapartmentexperts.crm.common.enums.ActivityType;
import com.localapartmentexperts.crm.lead.Lead;
import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Immutable activity log entry. Does not extend BaseEntity because it has no updated_at.
 * Written exclusively via ActivityService — never updated after creation.
 * Table is "activities" (not "lead_activities") — all event types live here.
 */
@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Null for property-only events. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private Lead lead;

    /** Null for lead-only events. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;

    /**
     * The employee who triggered this event. Nullable — system events have no actor.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 40)
    private ActivityType activityType;

    /**
     * Flexible JSON payload. Defaults to empty object — never null.
     * Shape by type:
     *   LEAD_CREATED          → {}
     *   STATUS_CHANGED        → {"from":"NEW","to":"CONTACTED"}
     *   ASSIGNED              → {"assignedToId":"uuid","assignedToName":"Jane Doe"}
     *   FOLLOW_UP_SET         → {"date":"2025-06-01"}
     *   NOTE_ADDED            → {"preview":"First 80 chars of note..."}
     *   CONTACT_METHOD_UPDATED→ {"from":"EMAIL","to":"WHATSAPP"}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, Object> metadata = new java.util.HashMap<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
