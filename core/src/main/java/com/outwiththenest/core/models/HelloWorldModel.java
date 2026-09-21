package com.outwiththenest.core.models;

import javax.annotation.PostConstruct;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;

@Model(
    adaptables = SlingHttpServletRequest.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class HelloWorldModel {

    @Self
    private SlingHttpServletRequest request;

    private String message;

    @PostConstruct
    protected void init() {
        String resourceType = request != null
            ? request.getResource().getResourceType()
            : "";

        message = "Hello World! Resource type is: " + resourceType;
    }

    public String getMessage() {
        return message;
    }
}