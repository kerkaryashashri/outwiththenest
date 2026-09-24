package com.outwiththenest.core.models;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Deque;
import java.util.List;
import java.util.Locale;
import javax.annotation.PostConstruct;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import com.outwiththenest.core.models.DiscoveryListingModel.DiscoveryCard;

/** Request-scoped search over the authored activity pages in this site's small content tree. */
@Model(adaptables = SlingHttpServletRequest.class,
    resourceType = "outwiththenest/components/adventuresearchresults",
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class AdventureSearchResultsModel {
    private static final String SITE_ROOT = "/content/outwiththenest/gb/en";
    private static final List<String> LOCATIONS = Arrays.asList("Clevedon", "Bristol", "North Somerset");
    private static final List<String> AGES = Arrays.asList("0-4", "5-8", "9-12", "13-17");
    private static final List<String> ENVIRONMENTS = Arrays.asList("Indoors", "Outdoors", "Indoor and outdoor");
    private static final List<String> COSTS = Arrays.asList("Free", "Paid");

    @Self
    private SlingHttpServletRequest request;

    @ValueMapValue
    private String sourcePage;

    private final List<DiscoveryCard> cards = new ArrayList<>();
    private String location;
    private String ageGroup;
    private String environment;
    private String costType;
    private String query;
    private boolean invalidFilters;

    @PostConstruct
    protected void init() {
        location = parameter("location");
        ageGroup = normalizeAge(parameter("ageGroup"));
        environment = normalizeEnvironment(parameter("environment"));
        costType = parameter("costType");
        query = parameter("q");
        invalidFilters = !valid(location, LOCATIONS) || !valid(ageGroup, AGES)
            || !valid(environment, ENVIRONMENTS) || !valid(costType, COSTS) || query.length() > 120;
        if (invalidFilters) {
            return;
        }

        String path = sourcePage == null || sourcePage.trim().isEmpty() ? SITE_ROOT : sourcePage.trim();
        // The author can narrow the source; visitors cannot expand it via query parameters.
        if (!path.equals(SITE_ROOT) && !path.startsWith(SITE_ROOT + "/")) {
            return;
        }
        Resource source = request.getResourceResolver().getResource(path);
        if (source == null || !isPage(source)) {
            return;
        }
        Deque<Resource> pages = new ArrayDeque<>();
        pages.add(source);
        while (!pages.isEmpty()) {
            Resource page = pages.removeFirst();
            Resource content = page.getChild("jcr:content");
            if (content != null) {
                ValueMap properties = content.getValueMap();
                if (matches(properties)) {
                    cards.add(new DiscoveryCard(
                        properties.get("jcr:title", page.getName()), page.getPath() + ".html",
                        properties.get("featuredImage", ""), properties.get("shortDescription", ""),
                        properties.get("location", ""), properties.get("environment", ""),
                        properties.get("ageGroup", ""), properties.get("costType", ""),
                        properties.get("price", "")));
                }
            }
            for (Resource child : page.getChildren()) {
                if (isPage(child)) {
                    pages.addLast(child);
                }
            }
        }
        cards.sort(Comparator.comparing(DiscoveryCard::getTitle, String.CASE_INSENSITIVE_ORDER)
            .thenComparing(DiscoveryCard::getUrl));
    }

    private boolean matches(ValueMap values) {
        String placeLocation = values.get("location", "").trim();
        String placeEnvironment = normalizeEnvironment(values.get("environment", ""));
        // Ordinary navigation/category pages are not activity results.
        if (values.get("hideInDiscovery", false) || placeLocation.isEmpty() || placeEnvironment.isEmpty()) {
            return false;
        }
        String placeAge = normalizeAge(values.get("ageGroup", ""));
        String placeCost = values.get("costType", "");
        if (!location.isEmpty() && !location.equals(placeLocation)) {
            return false;
        }
        if (!ageGroup.isEmpty() && !"All ages".equals(placeAge) && !ageGroup.equals(placeAge)) {
            return false;
        }
        if (!environment.isEmpty() && !environment.equals(placeEnvironment)
            && !"Indoor and outdoor".equals(placeEnvironment)) {
            return false;
        }
        if (!costType.isEmpty() && !costType.equals(placeCost) && !"Free & paid options".equals(placeCost)) {
            return false;
        }
        String searchable = (values.get("jcr:title", "") + " " + values.get("shortDescription", "")
            + " " + placeLocation).toLowerCase(Locale.ROOT);
        return query.isEmpty() || searchable.contains(query.toLowerCase(Locale.ROOT));
    }

    private static boolean isPage(Resource resource) {
        return "cq:Page".equals(resource.getValueMap().get("jcr:primaryType", ""));
    }

    private String parameter(String name) {
        String value = request.getParameter(name);
        return value == null ? "" : value.trim();
    }

    private static boolean valid(String value, List<String> options) {
        return value.isEmpty() || options.contains(value);
    }

    private static String normalizeAge(String value) {
        String age = value.trim().replace('\u2013', '-').replace('\u2014', '-');
        if ("Teens".equalsIgnoreCase(age)) {
            return "13-17";
        }
        return age.replaceFirst("(?i) years$", "");
    }

    private static String normalizeEnvironment(String value) {
        String setting = value.trim();
        return "Indoor & Outdoor".equalsIgnoreCase(setting) ? "Indoor and outdoor" : setting;
    }

    private List<Option> options(String allLabel, List<String> values, List<String> labels, String selected) {
        List<Option> result = new ArrayList<>();
        result.add(new Option("", allLabel, selected.isEmpty()));
        for (int i = 0; i < values.size(); i++) {
            result.add(new Option(values.get(i), labels.get(i), values.get(i).equals(selected)));
        }
        return Collections.unmodifiableList(result);
    }

    public List<Option> getLocationOptions() { return options("All locations", LOCATIONS, LOCATIONS, location); }
    public List<Option> getAgeOptions() {
        return options("All ages", AGES, Arrays.asList("Under 5s", "5–8 years", "9–12 years", "13–17 years"), ageGroup);
    }
    public List<Option> getEnvironmentOptions() { return options("Any setting", ENVIRONMENTS, ENVIRONMENTS, environment); }
    public List<Option> getCostOptions() { return options("Any cost", COSTS, COSTS, costType); }
    public List<DiscoveryCard> getCards() { return Collections.unmodifiableList(cards); }
    public int getCount() { return cards.size(); }
    public String getQuery() { return query; }
    public boolean isInvalidFilters() { return invalidFilters; }
    public String getResultsUrl() {
        Resource current = request.getResource();
        while (current != null && !isPage(current)) {
            current = current.getParent();
        }
        return (current == null ? SITE_ROOT + "/search" : current.getPath()) + ".html";
    }

    public static final class Option {
        private final String value;
        private final String label;
        private final boolean selected;

        private Option(String value, String label, boolean selected) {
            this.value = value;
            this.label = label;
            this.selected = selected;
        }
        public String getValue() { return value; }
        public String getLabel() { return label; }
        public boolean isSelected() { return selected; }
    }
}
