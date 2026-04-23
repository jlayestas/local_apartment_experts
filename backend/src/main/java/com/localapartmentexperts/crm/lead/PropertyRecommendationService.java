package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.lead.dto.RecommendedPropertyDTO;
import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.property.PropertyRepository;
import com.localapartmentexperts.crm.property.PropertyStatus;
import com.localapartmentexperts.crm.property.dto.PropertySummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyRecommendationService {

    private final LeadRepository leadRepository;
    private final PropertyRepository propertyRepository;

    public List<RecommendedPropertyDTO> recommend(UUID leadId, int limit) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", leadId));

        List<Property> published = propertyRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("status"), PropertyStatus.PUBLISHED));

        return published.stream()
                .map(p -> score(lead, p))
                .sorted(Comparator.comparingInt(RecommendedPropertyDTO::score).reversed())
                .limit(limit)
                .toList();
    }

    // ── Scoring ───────────────────────────────────────────────────────────────

    private RecommendedPropertyDTO score(Lead lead, Property property) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        score += scoreBudget(lead, property, reasons);
        score += scoreBedrooms(lead, property, reasons);
        score += scoreNeighborhood(lead, property, reasons);
        score += scoreAvailableDate(lead, property, reasons);

        return new RecommendedPropertyDTO(PropertySummaryDTO.from(property), score, reasons);
    }

    private int scoreBudget(Lead lead, Property property, List<String> reasons) {
        if (property.getPrice() == null) return 0;

        BigDecimal price = property.getPrice();
        BigDecimal min = lead.getBudgetMin();
        BigDecimal max = lead.getBudgetMax();

        if (min == null && max == null) return 0;

        boolean aboveMin = (min == null || price.compareTo(min) >= 0);
        boolean belowMax = (max == null || price.compareTo(max) <= 0);

        if (aboveMin && belowMax) {
            reasons.add("Price within budget");
            return 40;
        }
        if (max != null && price.compareTo(max) > 0) {
            reasons.add("Price above max budget");
            return -20;
        }
        return 0;
    }

    private int scoreBedrooms(Lead lead, Property property, List<String> reasons) {
        if (lead.getBedroomCount() == null || property.getBedrooms() == null) return 0;

        if (lead.getBedroomCount().equals(property.getBedrooms())) {
            reasons.add("Bedrooms match");
            return 25;
        }
        reasons.add("Bedroom count does not match");
        return -15;
    }

    private int scoreNeighborhood(Lead lead, Property property, List<String> reasons) {
        if (lead.getPreferredNeighborhoods() == null
                || lead.getPreferredNeighborhoods().length == 0
                || property.getNeighborhood() == null) {
            return 0;
        }

        boolean matches = Arrays.stream(lead.getPreferredNeighborhoods())
                .anyMatch(n -> n.equalsIgnoreCase(property.getNeighborhood()));

        if (matches) {
            reasons.add("Neighborhood matches preferences");
            return 20;
        }
        return 0;
    }

    private int scoreAvailableDate(Lead lead, Property property, List<String> reasons) {
        if (lead.getMoveInDate() == null || property.getAvailableDate() == null) return 0;

        if (!property.getAvailableDate().isAfter(lead.getMoveInDate())) {
            reasons.add("Available before move-in date");
            return 10;
        }
        return 0;
    }
}
