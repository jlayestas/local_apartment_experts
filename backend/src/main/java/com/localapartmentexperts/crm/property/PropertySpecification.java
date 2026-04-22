package com.localapartmentexperts.crm.property;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Static factory for building {@link Specification<Property>} predicates.
 *
 * <p>Each filter is optional — null means "no constraint". All active predicates
 * are AND-ed together. Passed to
 * {@link PropertyRepository#findAll(Specification, org.springframework.data.domain.Pageable)}.
 */
public final class PropertySpecification {

    private PropertySpecification() {}

    /**
     * Builds a dynamic specification from the given filter values.
     *
     * @param search       case-insensitive substring across title, description, city, neighborhood
     * @param status       exact status match
     * @param featured     when {@code true}: only featured=true rows
     * @param city         exact city match (case-insensitive)
     * @param neighborhood exact neighborhood match (case-insensitive)
     * @param minPrice     inclusive lower bound on price
     * @param maxPrice     inclusive upper bound on price
     * @param bedrooms     exact bedroom count
     * @param propertyType exact property type string (e.g. "APARTMENT")
     */
    public static Specification<Property> withFilters(
            String search,
            PropertyStatus status,
            Boolean featured,
            String city,
            String neighborhood,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Short bedrooms,
            String propertyType,
            List<String> amenities) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ── Text search ───────────────────────────────────────────────────
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("city")), pattern),
                        cb.like(cb.lower(root.get("neighborhood")), pattern),
                        cb.like(cb.lower(root.get("addressLine1")), pattern)
                ));
            }

            // ── Status ────────────────────────────────────────────────────────
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // ── Featured ──────────────────────────────────────────────────────
            if (Boolean.TRUE.equals(featured)) {
                predicates.add(cb.isTrue(root.get("featured")));
            }

            // ── City ─────────────────────────────────────────────────────────
            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }

            // ── Neighborhood ──────────────────────────────────────────────────
            if (neighborhood != null && !neighborhood.isBlank()) {
                predicates.add(cb.equal(
                        cb.lower(root.get("neighborhood")),
                        neighborhood.trim().toLowerCase()
                ));
            }

            // ── Price range ───────────────────────────────────────────────────
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // ── Bedrooms ──────────────────────────────────────────────────────
            if (bedrooms != null) {
                predicates.add(cb.equal(root.get("bedrooms"), bedrooms));
            }

            // ── Property type ─────────────────────────────────────────────────
            if (propertyType != null && !propertyType.isBlank()) {
                predicates.add(cb.equal(root.get("propertyType"), propertyType.trim().toUpperCase()));
            }

            // ── Amenities ─────────────────────────────────────────────────────
            // For each required amenity, check that the TEXT[] column contains it.
            // We wrap the comma-joined array with leading/trailing commas so that
            // ',WASHER,' never matches inside 'DISHWASHER'.
            if (amenities != null && !amenities.isEmpty()) {
                for (String amenity : amenities) {
                    String key = amenity.trim().toUpperCase();
                    Expression<String> joined = cb.function(
                            "array_to_string", String.class,
                            root.get("amenities"), cb.literal(","));
                    Expression<String> bounded = cb.concat(cb.concat(cb.literal(","), joined), cb.literal(","));
                    predicates.add(cb.like(bounded, "%," + key + ",%"));
                }
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
