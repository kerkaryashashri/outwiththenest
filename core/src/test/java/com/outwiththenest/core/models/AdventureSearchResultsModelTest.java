package com.outwiththenest.core.models;

import static org.junit.jupiter.api.Assertions.*;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;

@ExtendWith(AemContextExtension.class)
class AdventureSearchResultsModelTest {
    private static final String ROOT = "/content/outwiththenest/gb/en";
    private final AemContext context = new AemContext();

    @BeforeEach
    void setUp() {
        context.addModelsForClasses(AdventureSearchResultsModel.class);
        context.create().page(ROOT);
        context.create().page(ROOT + "/search");
        context.create().page(ROOT + "/things-to-do");
        context.create().page(ROOT + "/things-to-do/parks");
        place("parks/coast", "Coastal Walks", "Clevedon", "All ages", "Outdoors", "Free", false);
        place("parks/woodland", "Woodland Trails", "Bristol", "5–8 years", "Outdoors", "Paid", false);
        place("museum", "Museum", "Bristol", "Teens", "Indoors", "Free", false);
        place("mixed", "Mixed adventure", "Clevedon", "0–4 years", "Indoor & Outdoor", "Free & paid options", false);
        place("hidden", "Hidden place", "Clevedon", "All ages", "Outdoors", "Free", true);
        context.create().resource(ROOT + "/search/jcr:content/results",
            "sling:resourceType", "outwiththenest/components/adventuresearchresults", "sourcePage", ROOT);
        context.currentResource(ROOT + "/search/jcr:content/results");
    }

    private void place(String slug, String title, String location, String age, String setting, String cost, boolean hidden) {
        Map<String, Object> properties = new HashMap<>();
        properties.put("jcr:title", title);
        properties.put("location", location);
        properties.put("ageGroup", age);
        properties.put("environment", setting);
        properties.put("costType", cost);
        properties.put("hideInDiscovery", hidden);
        properties.put("shortDescription", "A family adventure");
        context.create().page(ROOT + "/things-to-do/" + slug, null, properties);
    }

    private AdventureSearchResultsModel search(String... pairs) {
        Map<String, Object> params = new HashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            params.put(pairs[i], pairs[i + 1]);
        }
        context.request().setParameterMap(params);
        AdventureSearchResultsModel model = context.request().adaptTo(AdventureSearchResultsModel.class);
        assertNotNull(model);
        return model;
    }

    @Test
    void findsNestedPlacesButNotCategoriesOrHiddenPagesAndSortsResults() {
        AdventureSearchResultsModel model = search();
        assertEquals(4, model.getCount());
        assertEquals("Coastal Walks,Mixed adventure,Museum,Woodland Trails",
            model.getCards().stream().map(DiscoveryListingModel.DiscoveryCard::getTitle).collect(Collectors.joining(",")));
        assertEquals(ROOT + "/things-to-do/parks/coast.html", model.getCards().get(0).getUrl());
        assertEquals(ROOT + "/search.html", model.getResultsUrl());
    }

    @Test
    void combinesFiltersAndIncludesAllAgesAndMixedSettingAndCost() {
        AdventureSearchResultsModel model = search("location", "Clevedon", "ageGroup", "0-4", "environment", "Outdoors", "costType", "Free");
        assertEquals(2, model.getCount());
        assertTrue(model.getAgeOptions().stream().anyMatch(option -> option.isSelected() && "0-4".equals(option.getValue())));
        assertEquals(1, search("location", "Clevedon", "ageGroup", "0-4", "environment", "Indoors", "costType", "Paid").getCount());
    }

    @Test
    void finderAgeValuesMatchAuthoredRangesAndTeens() {
        assertEquals("Woodland Trails", search("location", "Bristol", "ageGroup", "5-8").getCards().get(0).getTitle());
        assertEquals("Museum", search("location", "Bristol", "ageGroup", "13-17").getCards().get(0).getTitle());
        assertEquals(0, search("location", "Bristol", "ageGroup", "0-4").getCount());
    }

    @Test
    void supportsLegacyFilterLabelsAndBothSettingOption() {
        assertEquals(1, search("ageGroup", "0–4 years", "environment", "Indoor & Outdoor").getCount());
        assertEquals(1, search("environment", "Indoor and outdoor").getCount());
    }

    @Test
    void matchesKeywordsCaseInsensitivelyAndReportsNoMatches() {
        assertEquals(1, search("q", "  COASTAL ").getCount());
        assertEquals(4, search("q", "family adventure").getCount());
        assertEquals(0, search("q", "no such place").getCount());
        assertEquals(0, search("location", "North Somerset").getCount());
    }

    @Test
    void unsupportedFilterDoesNotSilentlyReturnAllPlaces() {
        AdventureSearchResultsModel model = search("location", "Unknown");
        assertTrue(model.isInvalidFilters());
        assertEquals(0, model.getCount());
        assertTrue(search("q", "a".repeat(121)).isInvalidFilters());
        assertEquals(0, search("q", "<script>alert(1)</script>").getCount());
    }

    @Test
    void respectsConfiguredSubtreeAndIgnoresVisitorSourceOverrides() {
        context.currentResource().adaptTo(org.apache.sling.api.resource.ModifiableValueMap.class)
            .put("sourcePage", ROOT + "/things-to-do/parks");
        assertEquals(2, search("sourcePage", "/content").getCount());
    }

    @Test
    void invalidOrMissingSourceProducesEmptyResults() {
        org.apache.sling.api.resource.ModifiableValueMap properties = context.currentResource()
            .adaptTo(org.apache.sling.api.resource.ModifiableValueMap.class);
        properties.put("sourcePage", "/content/another-site");
        assertEquals(0, search().getCount());
        properties.put("sourcePage", ROOT + "/missing");
        assertEquals(0, search().getCount());
        properties.put("sourcePage", "");
        assertEquals(4, search().getCount());
    }

    @Test
    void clearedFiltersRestoreAllResultsAndDefaultSelections() {
        assertEquals(0, search("location", "North Somerset").getCount());
        AdventureSearchResultsModel model = search();
        assertEquals(4, model.getCount());
        assertTrue(model.getLocationOptions().get(0).isSelected());
        assertTrue(model.getAgeOptions().get(0).isSelected());
        assertTrue(model.getEnvironmentOptions().get(0).isSelected());
        assertTrue(model.getCostOptions().get(0).isSelected());
    }
}
