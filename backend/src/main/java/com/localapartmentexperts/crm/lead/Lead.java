package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.entity.BaseEntity;
import com.localapartmentexperts.crm.common.enums.ContactMethod;
import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.common.enums.UrgencyLevel;
import com.localapartmentexperts.crm.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ── Contact info ──────────────────────────────────────────────────────

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(length = 255)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(name = "whatsapp_number", length = 30)
    private String whatsappNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_contact_method", length = 20)
    private ContactMethod preferredContactMethod;

    // ── Origin ────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private LeadSource source;

    // ── Property preferences ──────────────────────────────────────────────

    @Column(name = "move_in_date")
    private LocalDate moveInDate;

    @Column(name = "budget_min", precision = 12, scale = 2)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 12, scale = 2)
    private BigDecimal budgetMax;

    /**
     * Maps to PostgreSQL TEXT[] using Hibernate 6's native array type support.
     * Stored and read as a plain String array; no extra library required.
     */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "preferred_neighborhoods", columnDefinition = "text[]")
    private String[] preferredNeighborhoods;

    @Column(name = "bedroom_count")
    private Short bedroomCount;

    @Column(name = "bathroom_count")
    private Short bathroomCount;

    @Column(columnDefinition = "TEXT")
    private String message;

    // ── Metadata ──────────────────────────────────────────────────────────

    /**
     * Language the lead prefers for communication (e.g. "es", "en").
     * Distinct from users.language, which is the employee's UI locale.
     */
    @Builder.Default
    @Column(name = "language_preference", nullable = false, length = 10)
    private String languagePreference = "es";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false, length = 20)
    private UrgencyLevel urgencyLevel = UrgencyLevel.MEDIUM;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private LeadStatus status = LeadStatus.NEW;

    // ── Follow-up tracking ────────────────────────────────────────────────

    @Column(name = "last_contact_date")
    private LocalDate lastContactDate;

    @Column(name = "next_follow_up_date")
    private LocalDate nextFollowUpDate;

    // ── Assignment ────────────────────────────────────────────────────────

    /**
     * Current assignee — source of truth for assignment.
     * Nullable: NULL means the lead is unassigned.
     * Full assignment history lives in lead_assignments.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;
}
