package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.property.dto.PropertySummaryDTO;

import java.util.List;

/**
 * Single entry in a property recommendation response.
 * Score is the sum of rule weights that fired for this lead/property pair.
 * matchReasons lists the human-readable rules that contributed to the score.
 */
public record RecommendedPropertyDTO(
        PropertySummaryDTO property,
        int score,
        List<String> matchReasons
) {}
