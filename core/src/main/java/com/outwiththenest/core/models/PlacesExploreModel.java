package com.outwiththenest.core.models;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.PostConstruct;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class PlacesExploreModel {

    @ValueMapValue
    private String[] selectedPages;

    @SlingObject
    private ResourceResolver resourceResolver;

    private final List<PlaceCard> cards = new ArrayList<>();

    @PostConstruct
    protected void init() {
        if (selectedPages == null || resourceResolver == null) {
            return;
        }

        for (String pagePath : selectedPages) {
            if (pagePath == null || pagePath.trim().isEmpty()) {
                continue;
            }

            Resource page = resourceResolver.getResource(pagePath);
            if (page == null) {
                continue;
            }

            Resource content = page.getChild("jcr:content");
            if (content == null) {
                continue;
            }

            ValueMap values = content.getValueMap();
            cards.add(new PlaceCard(
                    values.get("jcr:title", page.getName()),
                    page.getPath() + ".html",
                    values.get("shortDescription", ""),
                    values.get("featuredImage", ""),
                    values.get("location", ""),
                    values.get("environment", ""),
                    values.get("costType", ""),
                    values.get("price", "")
            ));
        }
    }

    public String[] getSelectedPages() {
        return selectedPages == null ? new String[0] : selectedPages.clone();
    }

    public List<PlaceCard> getCards() {
        return Collections.unmodifiableList(cards);
    }

    public static class PlaceCard {

        private final String title;
        private final String url;
        private final String description;
        private final String image;
        private final String location;
        private final String environment;
        private final String costType;
        private final String price;

        public PlaceCard(
                String title,
                String url,
                String description,
                String image,
                String location,
                String environment,
                String costType,
                String price) {
            this.title = title;
            this.url = url;
            this.description = description;
            this.image = image;
            this.location = location;
            this.environment = environment;
            this.costType = costType;
            this.price = price;
        }

        public String getTitle() { return title; }
        public String getUrl() { return url; }
        public String getDescription() { return description; }
        public String getImage() { return image; }
        public String getLocation() { return location; }
        public String getEnvironment() { return environment; }
        public String getCostType() { return costType; }
        public String getPrice() { return price; }
    }
}
