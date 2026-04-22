package com.localapartmentexperts.crm.property;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

/**
 * Data access for {@link Property}.
 *
 * <p>Extends {@link JpaSpecificationExecutor} so filter/search queries can be
 * built dynamically via {@code PropertySpecification}.
 */
public interface PropertyRepository extends JpaRepository<Property, UUID>,
        JpaSpecificationExecutor<Property> {

    Optional<Property> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
