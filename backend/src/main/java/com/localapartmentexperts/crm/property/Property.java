package com.localapartmentexperts.crm.property;

import com.localapartmentexperts.crm.common.entity.BaseEntity;
import com.localapartmentexperts.crm.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * A rentable or purchasable property listing.
 *
 * <p>Lifecycle: {@code DRAFT} (internal) → {@code PUBLISHED} (public website) → {@code ARCHIVED}.
 * Use {@link PropertyStatus#ARCHIVED} instead of hard delete to preserve history.
 *
 * <p>Persisted to the {@code properties} table (see V11__create_properties.sql).
 */
@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ── Content ───────────────────────────────────────────────────────────────

    @Column(nullable = false, length = 200)
    private String title;

    /** URL-safe identifier for the public listing page. Globally unique. */
    @Column(nullable = false, length = 200, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Private agent notes. Never exposed to the public website or to leads. */
    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    // ── Location ──────────────────────────────────────────────────────────────

    @Column(name = "address_line_1", nullable = false, length = 300)
    private String addressLine1;

    @Column(name = "address_line_2", length = 300)
    private String addressLine2;

    @Column(length = 100)
    private String neighborhood;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    /** WGS-84 decimal degrees. 6 decimal places ≈ 11 cm precision. */
    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    // ── Pricing ───────────────────────────────────────────────────────────────

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    /**
     * How often the price recurs: MONTHLY, WEEKLY, DAILY, ONCE.
     * Null for one-time or unspecified.
     */
    @Column(name = "price_frequency", length = 20)
    private String priceFrequency;

    // ── Property details ──────────────────────────────────────────────────────

    /**
     * APARTMENT | HOUSE | STUDIO | CONDO | TOWNHOUSE | COMMERCIAL | OTHER.
     * Stored as a plain string consistent with enum handling elsewhere in this project.
     */
    @Column(name = "property_type", nullable = false, length = 30)
    private String propertyType;

    @Column
    private Short bedrooms;

    @Column
    private Short bathrooms;

    @Column(name = "square_feet", precision = 8, scale = 1)
    private BigDecimal squareFeet;

    @Column(name = "available_date")
    private LocalDate availableDate;

    // ── Publishing / visibility ───────────────────────────────────────────────

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PropertyStatus status = PropertyStatus.DRAFT;

    @Builder.Default
    @Column(nullable = false)
    private boolean featured = false;

    // ── Features & policies ───────────────────────────────────────────────────

    /**
     * Free-text amenity tags (e.g. "Pool", "Gym", "Rooftop").
     * Uses PostgreSQL {@code TEXT[]} consistent with {@code leads.preferred_neighborhoods}.
     */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] amenities;

    /** ALLOWED | NOT_ALLOWED | NEGOTIABLE. Null if unspecified. */
    @Column(name = "pet_policy", length = 20)
    private String petPolicy;

    @Column(name = "parking_info", columnDefinition = "TEXT")
    private String parkingInfo;

    // ── Sourcing / external sync ──────────────────────────────────────────────

    /** ID from an external MLS or portal. Used for deduplication on import. */
    @Column(name = "external_reference_id", length = 100)
    private String externalReferenceId;

    /** Name of the external company or portal this listing was imported from. */
    @Column(name = "source_company", length = 100)
    private String sourceCompany;

    // ── Contact ───────────────────────────────────────────────────────────────

    /** Internal agent responsible for managing this listing. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_agent_user_id")
    private User listingAgent;

    /** Public-facing contact phone shown on the website (may differ from agent). */
    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "contact_whatsapp", length = 30)
    private String contactWhatsapp;

    // ── Lifecycle timestamps ──────────────────────────────────────────────────
    // created_at and updated_at are inherited from BaseEntity.

    /** Set when status first transitions to PUBLISHED. Never cleared on re-draft. */
    @Column(name = "published_at")
    private Instant publishedAt;

    /** Set when status transitions to ARCHIVED. */
    @Column(name = "archived_at")
    private Instant archivedAt;

    // ── Reference code ────────────────────────────────────────────────────────

    /** Human-readable reference code, e.g. {@code LAE-0001}. Generated by the DB sequence on insert. */
    @Column(name = "reference_code", nullable = false, length = 20, unique = true, updatable = false)
    private String referenceCode;

    // ── Public ordering ───────────────────────────────────────────────────────

    /**
     * Manual sort key for the public listing page.
     * Lower values appear first. Null rows sort after all explicitly-ordered rows,
     * then fall back to publishedAt DESC.
     */
    @Column(name = "public_sort_order")
    private Integer publicSortOrder;
}
