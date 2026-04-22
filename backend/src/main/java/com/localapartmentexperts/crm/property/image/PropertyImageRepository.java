package com.localapartmentexperts.crm.property.image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, UUID> {

    /** Gallery for a property, ordered for display. */
    List<PropertyImage> findByPropertyIdOrderBySortOrderAsc(UUID propertyId);

    /** Current cover image for a property, if any. */
    Optional<PropertyImage> findByPropertyIdAndCoverTrue(UUID propertyId);

    /** Cover images for a batch of properties — used to populate list cards in one query. */
    @Query("SELECT i FROM PropertyImage i WHERE i.property.id IN :propertyIds AND i.cover = true")
    List<PropertyImage> findCoversByPropertyIdIn(@Param("propertyIds") Collection<UUID> propertyIds);

    /** Count images for a property (used to auto-assign sortOrder). */
    int countByPropertyId(UUID propertyId);

    /** Clear the cover flag for all images of a property in a single UPDATE. */
    @Modifying
    @Query("UPDATE PropertyImage i SET i.cover = false WHERE i.property.id = :propertyId")
    void clearCoverForProperty(@Param("propertyId") UUID propertyId);
}
