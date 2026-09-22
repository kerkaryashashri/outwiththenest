package com.outwiththenest.core.models;

import javax.annotation.PostConstruct;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;

@Model(
    adaptables = SlingHttpServletRequest.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class PlaceDetailHeroModel {

    @Self
    private SlingHttpServletRequest request;

    private String title;
    private String description;
    private String featuredImage;
    private String location;
    private String environment;
    private String ageGroup;
    private String costType;

    @PostConstruct
    protected void init() {
        Resource pageContent = getCurrentPageContent();

        if (pageContent == null) {
            return;
        }

        ValueMap properties = pageContent.getValueMap();

        title = properties.get("jcr:title", "");
        description = properties.get(
            "shortDescription",
            properties.get("jcr:description", "")
        );
        featuredImage = properties.get("featuredImage", "");
        location = properties.get("location", "");
        environment = properties.get("environment", "");
        ageGroup = properties.get("ageGroup", "");
        costType = properties.get("costType", "");
    }

    private Resource getCurrentPageContent() {
        Resource currentResource = request.getResource();

        while (currentResource != null) {
            if ("jcr:content".equals(currentResource.getName())) {
                return currentResource;
            }

            currentResource = currentResource.getParent();
        }

        return null;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getFeaturedImage() {
        return featuredImage;
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
}