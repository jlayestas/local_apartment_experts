package com.localapartmentexperts.crm.property.image;

import com.localapartmentexperts.crm.property.Property;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A single image belonging to a property gallery.
 *
 * <p>The schema is defined in {@code V12__create_property_images.sql}.
 * Key constraints enforced by the database:
 * <ul>
 *   <li>At most one image per property may have {@code cover = true}
 *       (partial unique index {@code idx_property_images_cover}).
 *   <li>At least one of {@code storageKey} or {@code imageUrl} must be non-null.
 *   <li>{@code sortOrder} must be ≥ 0.
 * </ul>
 *
 * <p>This entity has no {@code updated_at} column — use {@code createdAt} only.
 */
@Entity
@Table(name = "property_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    /**
     * Internal file path (e.g. {@code "properties/{propertyId}/abc123.jpg"}).
     * Used by {@link StorageService} for lifecycle management; not exposed to clients.
     */
    @Column(name = "storage_key", length = 500)
    private String storageKey;

    /** CDN / public URL served to the frontend and website. */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Accessibility alt-text for screen readers and SEO. */
    @Column(name = "alt_text", length = 300)
    private String altText;

    /** 0-based display order within the gallery.  Lower = appears first. */
    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    /**
     * Whether this is the hero / cover image.
     * The DB partial-unique index ensures at most one cover per property.
     *
     * <p>Named {@code cover} (not {@code isCover}) to avoid Lombok generating
     * {@code isIsCover()} — the column mapping uses {@code @Column(name = "is_cover")}.
     */
    @Builder.Default
    @Column(name = "is_cover", nullable = false)
    private boolean cover = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
