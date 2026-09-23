package com.outwiththenest.core.models;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.PostConstruct;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables =  Resource.class, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class PlacesExploreModel {
    @ValueMapValue 
    private String[] selectedPages;

    @SlingObject 
    private ResourceResolver resourceResolver;

    private final List<PlaceCard> cards = new ArrayList<>();

    public String[] getSelectedPages()
    {
        return selectedPages == null ? new String[0] : selectedPages.clone();
    }


    public List<PlaceCard> getCards() 
    {
    return Collections.unmodifiableList(cards);
    }

    // place card to get all placecard information
    public static class PlaceCard 
    {

    private final String title;
    private final String url;

    public PlaceCard(String title, String url) {
        this.title = title;
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public String getUrl() {
        return url;
    }
}

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

        String title = content.getValueMap()
                .get("jcr:title", page.getName());

        cards.add(new PlaceCard(title, page.getPath() + ".html"));
    }
}
}
