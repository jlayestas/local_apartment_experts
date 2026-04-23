package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.lead.dto.RecommendedPropertyDTO;
import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.property.PropertyRepository;
import com.localapartmentexperts.crm.property.PropertyStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link PropertyRecommendationService}.
 *
 * <p>Repositories are mocked so each test exercises scoring and sorting logic
 * in pure Java — no Spring context or database required.
 *
 * <p>Scoring weights (kept in sync with the service):
 * <ul>
 *   <li>+40  price within lead budget</li>
 *   <li>−20  price above max budget</li>
 *   <li>+25  bedroom count matches</li>
 *   <li>−15  bedroom count does not match</li>
 *   <li>+20  neighborhood in preferred list</li>
 *   <li>+10  availableDate ≤ moveInDate</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
class PropertyRecommendationServiceTest {

    @Mock private LeadRepository leadRepository;
    @Mock private PropertyRepository propertyRepository;
    @InjectMocks private PropertyRecommendationService service;

    // ── Score constants (mirroring the service) ────────────────────────────────

    private static final int BUDGET_IN         =  40;
    private static final int BUDGET_ABOVE_MAX  = -20;
    private static final int BEDROOMS_MATCH    =  25;
    private static final int BEDROOMS_MISMATCH = -15;
    private static final int NEIGHBORHOOD      =  20;
    private static final int DATE_BONUS        =  10;

    // ── Reason string constants (mirroring the service) ───────────────────────

    private static final String REASON_BUDGET_IN         = "Price within budget";
    private static final String REASON_BUDGET_ABOVE_MAX  = "Price above max budget";
    private static final String REASON_BEDROOMS_MATCH    = "Bedrooms match";
    private static final String REASON_BEDROOMS_MISMATCH = "Bedroom count does not match";
    private static final String REASON_NEIGHBORHOOD      = "Neighborhood matches preferences";
    private static final String REASON_DATE              = "Available before move-in date";

    // ── Test fixtures ──────────────────────────────────────────────────────────

    /**
     * A lead with all preference fields populated so every scoring rule can fire.
     * Budget: 2 000 – 3 000 · Bedrooms: 2 · Neighborhood: Brickell · Move-in: 2025-06-01
     */
    private Lead defaultLead() {
        return Lead.builder()
                .id(UUID.randomUUID())
                .firstName("Ana").lastName("García")
                .budgetMin(new BigDecimal("2000"))
                .budgetMax(new BigDecimal("3000"))
                .bedroomCount((short) 2)
                .preferredNeighborhoods(new String[]{"Brickell"})
                .moveInDate(LocalDate.of(2025, 6, 1))
                .build();
    }

    /** Builds a PUBLISHED property — the only status the recommendation engine considers. */
    private Property publishedProperty(String title,
                                       BigDecimal price,
                                       short bedrooms,
                                       String neighborhood,
                                       LocalDate availableDate) {
        return Property.builder()
                .id(UUID.randomUUID())
                .title(title)
                .slug(title.toLowerCase().replace(" ", "-"))
                .addressLine1("100 Test Blvd")
                .city("Miami")
                .state("FL")
                .propertyType("APARTMENT")
                .price(price)
                .priceFrequency("MONTHLY")
                .bedrooms(bedrooms)
                .bathrooms((short) 1)
                .neighborhood(neighborhood)
                .availableDate(availableDate)
                .status(PropertyStatus.PUBLISHED)
                .build();
    }

    /** Wires both repository mocks for the common happy-path setup. */
    @SuppressWarnings("unchecked")
    private void givenPublishedProperties(Lead lead, Property... properties) {
        when(leadRepository.findById(lead.getId())).thenReturn(Optional.of(lead));
        when(propertyRepository.findAll(any(Specification.class))).thenReturn(List.of(properties));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. Full match — highest possible score
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    void recommend_allRulesMatch_returnsMaximumScoreWithAllReasons() {
        Lead lead = defaultLead();
        // +40 (budget) +25 (bedrooms) +20 (neighborhood) +10 (date) = 95
        Property perfect = publishedProperty(
                "Perfect Apt",
                new BigDecimal("2500"), (short) 2, "Brickell",
                LocalDate.of(2025, 5, 1)   // before move-in date of 2025-06-01
        );

        givenPublishedProperties(lead, perfect);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results).hasSize(1);
        RecommendedPropertyDTO dto = results.get(0);
        assertThat(dto.score())
                .as("score when all rules fire")
                .isEqualTo(BUDGET_IN + BEDROOMS_MATCH + NEIGHBORHOOD + DATE_BONUS);  // 95
        assertThat(dto.matchReasons()).containsExactlyInAnyOrder(
                REASON_BUDGET_IN,
                REASON_BEDROOMS_MATCH,
                REASON_NEIGHBORHOOD,
                REASON_DATE
        );
        assertThat(dto.property().id()).isEqualTo(perfect.getId());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. Above-budget penalty
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    void recommend_priceAboveMaxBudget_appliesBudgetPenaltyAndRecordsReason() {
        Lead lead = defaultLead();          // max budget = 3 000, bedrooms = 2
        // −20 (above max) + (−15) bedrooms mismatch = −35
        Property overBudget = publishedProperty(
                "Expensive Apt",
                new BigDecimal("4500"), (short) 3, "Wynwood", null
        );

        givenPublishedProperties(lead, overBudget);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results).hasSize(1);
        RecommendedPropertyDTO dto = results.get(0);
        assertThat(dto.score())
                .as("penalty for above-budget + bedroom mismatch")
                .isEqualTo(BUDGET_ABOVE_MAX + BEDROOMS_MISMATCH);  // −35
        assertThat(dto.matchReasons())
                .contains(REASON_BUDGET_ABOVE_MAX)
                .doesNotContain(REASON_BUDGET_IN);
    }

    @Test
    void recommend_priceAtExactMaxBudget_treatedAsWithinBudgetAndNopenalty() {
        Lead lead = defaultLead();          // max budget = 3 000
        Property exactMax = publishedProperty(
                "Exact Max Apt",
                new BigDecimal("3000"), (short) 2, "Wynwood", null
        );

        givenPublishedProperties(lead, exactMax);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        RecommendedPropertyDTO dto = results.get(0);
        assertThat(dto.matchReasons())
                .contains(REASON_BUDGET_IN)
                .doesNotContain(REASON_BUDGET_ABOVE_MAX);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. Bedroom mismatch penalty
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    void recommend_bedroomCountMismatch_appliesPenaltyAndRecordsReason() {
        Lead lead = defaultLead();          // bedrooms = 2, budget 2 000–3 000, neighborhood Brickell
        // +40 (budget) + (−15) bedrooms + +20 neighborhood = 45
        Property wrongBeds = publishedProperty(
                "Wrong Beds Apt",
                new BigDecimal("2500"), (short) 3, "Brickell", null
        );

        givenPublishedProperties(lead, wrongBeds);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results).hasSize(1);
        RecommendedPropertyDTO dto = results.get(0);
        assertThat(dto.score())
                .as("budget bonus - bedroom penalty + neighborhood bonus")
                .isEqualTo(BUDGET_IN + BEDROOMS_MISMATCH + NEIGHBORHOOD);  // 45
        assertThat(dto.matchReasons())
                .contains(REASON_BEDROOMS_MISMATCH)
                .doesNotContain(REASON_BEDROOMS_MATCH);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. Only PUBLISHED properties are included
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Verifies the service delegates status filtering to the repository via a
     * Specification rather than fetching all rows and filtering in memory.
     * The correctness of the Specification's SQL predicate (PUBLISHED only)
     * is covered by the integration test suite with a real database.
     */
    @Test
    @SuppressWarnings("unchecked")
    void recommend_repositoryIsQueriedViaSpecification() {
        Lead lead = defaultLead();
        when(leadRepository.findById(lead.getId())).thenReturn(Optional.of(lead));
        when(propertyRepository.findAll(any(Specification.class))).thenReturn(List.of());

        service.recommend(lead.getId(), 3);

        verify(propertyRepository, times(1)).findAll(any(Specification.class));
    }

    @Test
    void recommend_noPublishedPropertiesExist_returnsEmptyList() {
        Lead lead = defaultLead();
        when(leadRepository.findById(lead.getId())).thenReturn(Optional.of(lead));
        when(propertyRepository.findAll(any(Specification.class))).thenReturn(List.of());

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results).isEmpty();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. Results sorted by score descending
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    void recommend_multipleProperties_returnedInDescendingScoreOrder() {
        Lead lead = defaultLead(); // budget 2 000–3 000, bedrooms 2, neighborhood Brickell

        // Intentionally supplied out of score order to the mock
        Property low  = publishedProperty("Low",  new BigDecimal("4000"), (short) 1, "Other",   null); // −20−15     = −35
        Property mid  = publishedProperty("Mid",  new BigDecimal("2500"), (short) 2, "Wynwood", null); // +40+25     =  65
        Property best = publishedProperty("Best", new BigDecimal("2500"), (short) 2, "Brickell",
                LocalDate.of(2025, 5, 1));                                                              // +40+25+20+10 = 95

        givenPublishedProperties(lead, low, mid, best);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results).hasSize(3);
        assertThat(results.get(0).property().title()).isEqualTo("Best");
        assertThat(results.get(1).property().title()).isEqualTo("Mid");
        assertThat(results.get(2).property().title()).isEqualTo("Low");

        // Strict descending order
        assertThat(results.get(0).score()).isGreaterThan(results.get(1).score());
        assertThat(results.get(1).score()).isGreaterThan(results.get(2).score());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. Limit controls the number of returned results
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    void recommend_limitSmallerThanCandidates_returnsOnlyTopN() {
        Lead lead = defaultLead(); // budget 2 000–3 000, bedrooms 2, neighborhood Brickell

        Property first  = publishedProperty("First",  new BigDecimal("2500"), (short) 2, "Brickell", null); // +40+25+20 = 85
        Property second = publishedProperty("Second", new BigDecimal("2500"), (short) 2, "Wynwood",  null); // +40+25    = 65
        Property third  = publishedProperty("Third",  new BigDecimal("4000"), (short) 1, "Other",    null); // −20−15    = −35

        givenPublishedProperties(lead, third, second, first); // out of order

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 1);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).property().title())
                .as("only the top-scoring property is returned")
                .isEqualTo("First");
    }

    @Test
    void recommend_limitLargerThanCandidates_returnsAllCandidates() {
        Lead lead = defaultLead();
        Property only = publishedProperty("Only", new BigDecimal("2500"), (short) 2, "Brickell", null);

        givenPublishedProperties(lead, only);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 10);

        assertThat(results).hasSize(1);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. Match reasons clearly explain each selection
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    void recommend_noBudgetOnLead_budgetReasonsNeverAppear() {
        Lead lead = Lead.builder()
                .id(UUID.randomUUID())
                .firstName("Jorge").lastName("Pérez")
                // No budgetMin / budgetMax
                .bedroomCount((short) 2)
                .preferredNeighborhoods(new String[]{"Brickell"})
                .build();
        Property prop = publishedProperty("Any Price Apt", new BigDecimal("9999"), (short) 2, "Brickell", null);

        when(leadRepository.findById(lead.getId())).thenReturn(Optional.of(lead));
        when(propertyRepository.findAll(any(Specification.class))).thenReturn(List.of(prop));

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results.get(0).matchReasons())
                .as("budget rules must not fire when lead has no budget")
                .doesNotContain(REASON_BUDGET_IN, REASON_BUDGET_ABOVE_MAX)
                .contains(REASON_BEDROOMS_MATCH, REASON_NEIGHBORHOOD);
    }

    @Test
    void recommend_availableDateAfterMoveIn_dateReasonDoesNotAppear() {
        Lead lead = defaultLead();                           // moveInDate = 2025-06-01
        Property late = publishedProperty(
                "Late Apt",
                new BigDecimal("2500"), (short) 2, "Brickell",
                LocalDate.of(2025, 9, 1)                   // available AFTER move-in
        );

        givenPublishedProperties(lead, late);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results.get(0).matchReasons())
                .as("date bonus must not fire when property is not yet available")
                .doesNotContain(REASON_DATE);
        assertThat(results.get(0).score())
                .as("score without date bonus")
                .isEqualTo(BUDGET_IN + BEDROOMS_MATCH + NEIGHBORHOOD);  // 85
    }

    @Test
    void recommend_availableDateEqualsMovInDate_dateReasonAppearsAndBonusIsGranted() {
        Lead lead = defaultLead();                           // moveInDate = 2025-06-01
        Property ready = publishedProperty(
                "Ready Apt",
                new BigDecimal("2500"), (short) 2, "Brickell",
                LocalDate.of(2025, 6, 1)                   // exact same day → eligible
        );

        givenPublishedProperties(lead, ready);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results.get(0).matchReasons()).contains(REASON_DATE);
        assertThat(results.get(0).score())
                .isEqualTo(BUDGET_IN + BEDROOMS_MATCH + NEIGHBORHOOD + DATE_BONUS);  // 95
    }

    @Test
    void recommend_neighborhoodMatchIsCaseInsensitive() {
        Lead lead = Lead.builder()
                .id(UUID.randomUUID())
                .firstName("Ana").lastName("García")
                .preferredNeighborhoods(new String[]{"brickell"})  // lowercase
                .build();
        Property prop = publishedProperty("Mixed Case Apt", new BigDecimal("2500"), (short) 2, "Brickell", null);

        when(leadRepository.findById(lead.getId())).thenReturn(Optional.of(lead));
        when(propertyRepository.findAll(any(Specification.class))).thenReturn(List.of(prop));

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results.get(0).matchReasons())
                .as("neighborhood comparison must be case-insensitive")
                .contains(REASON_NEIGHBORHOOD);
    }

    @Test
    void recommend_noBedroomPreference_bedroomReasonsNeverAppear() {
        Lead lead = Lead.builder()
                .id(UUID.randomUUID())
                .firstName("Ana").lastName("García")
                .budgetMin(new BigDecimal("2000"))
                .budgetMax(new BigDecimal("3000"))
                // No bedroomCount set
                .build();
        Property prop = publishedProperty("No Pref Apt", new BigDecimal("2500"), (short) 3, "Wynwood", null);

        when(leadRepository.findById(lead.getId())).thenReturn(Optional.of(lead));
        when(propertyRepository.findAll(any(Specification.class))).thenReturn(List.of(prop));

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results.get(0).matchReasons())
                .as("bedroom rules must not fire when lead has no bedroom preference")
                .doesNotContain(REASON_BEDROOMS_MATCH, REASON_BEDROOMS_MISMATCH);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Edge cases
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    void recommend_unknownLeadId_throwsResourceNotFoundException() {
        UUID unknownId = UUID.randomUUID();
        when(leadRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.recommend(unknownId, 3))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Lead");
    }

    @Test
    void recommend_propertyWithNullPrice_budgetRulesDoNotFire() {
        Lead lead = defaultLead();
        Property noPriceProp = publishedProperty("No Price Apt", null, (short) 2, "Brickell", null);

        givenPublishedProperties(lead, noPriceProp);

        List<RecommendedPropertyDTO> results = service.recommend(lead.getId(), 3);

        assertThat(results.get(0).matchReasons())
                .doesNotContain(REASON_BUDGET_IN, REASON_BUDGET_ABOVE_MAX);
    }
}
