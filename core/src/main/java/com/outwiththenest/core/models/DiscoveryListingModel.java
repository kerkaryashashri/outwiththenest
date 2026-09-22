package com.outwiththenest.core.models;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.PostConstruct;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class DiscoveryListingModel {

    @SlingObject
    private Resource resource;

    @ValueMapValue
    private String sourcePage;

    @ValueMapValue
    private int maxItems;

    @ValueMapValue
    private boolean showCount;

    private final List<DiscoveryCard> cards = new ArrayList<>();

    @PostConstruct
    protected void init() {
        Resource listingPage = getListingPage();

        if (listingPage == null) {
            return;
        }

        int limit = maxItems > 0 ? maxItems : Integer.MAX_VALUE;

        for (Resource childPage : listingPage.getChildren()) {
            if (cards.size() >= limit) {
                break;
            }

            Resource pageContent = childPage.getChild("jcr:content");

            if (pageContent == null) {
                continue;
            }

            ValueMap pageProperties = pageContent.getValueMap();

            if (pageProperties.get("hideInDiscovery", false)) {
                continue;
            }

            cards.add(new DiscoveryCard(
                pageProperties.get("jcr:title", childPage.getName()),
                childPage.getPath() + ".html",
                pageProperties.get("featuredImage", ""),
                pageProperties.get("shortDescription", ""),
                pageProperties.get("location", ""),
                pageProperties.get("environment", ""),
                pageProperties.get("ageGroup", ""),
                pageProperties.get("costType", ""),
                pageProperties.get("price", "")
            ));
        }
    }

    private Resource getListingPage() {
        if (sourcePage != null && !sourcePage.trim().isEmpty()) {
            Resource configuredPage =
                resource.getResourceResolver().getResource(sourcePage);

            if (configuredPage != null) {
                return configuredPage;
            }
        }

        Resource currentResource = resource;

        while (currentResource != null) {
            if ("jcr:content".equals(currentResource.getName())
                && currentResource.getParent() != null) {
                return currentResource.getParent();
            }

            currentResource = currentResource.getParent();
        }

        return null;
    }

    public List<DiscoveryCard> getCards() {
        return Collections.unmodifiableList(cards);
    }

    public int getCount() {
        return cards.size();
    }

    public boolean isShowCount() {
        return showCount;
    }

    public static class DiscoveryCard {

        private final String title;
        private final String url;
        private final String featuredImage;
        private final String shortDescription;
        private final String location;
        private final String environment;
        private final String ageGroup;
        private final String costType;
        private final String price;

        public DiscoveryCard(
            String title,
            String url,
            String featuredImage,
            String shortDescription,
            String location,
            String environment,
            String ageGroup,
            String costType,
            String price
        ) {
            this.title = title;
            this.url = url;
            this.featuredImage = featuredImage;
            this.shortDescription = shortDescription;
            this.location = location;
            this.environment = environment;
            this.ageGroup = ageGroup;
            this.costType = costType;
            this.price = price;
        }

        public String getTitle() {
            return title;
        }

        public String getUrl() {
            return url;
        }

        public String getFeaturedImage() {
            return featuredImage;
        }

        public String getShortDescription() {
            return shortDescription;
        }

        public String getLocation() {
            return location;
        }

        public String getEnvironment() {
            return environment;
        }

        public String getAgeGroup() {
            return ageGroup;
        }

        public String getCostType() {
            return costType;
        }

        public String getPrice() {
            return price;
        }
    }
}