package com.outwiththenest.core.models;

import java.util.Optional;

import javax.annotation.PostConstruct;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;

import com.outwiththenest.core.services.PostcodeLocation;
import com.outwiththenest.core.services.PostcodeLookupService;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class PlaceVisitMapModel {

    @ValueMapValue
    private String postcode;

    @OSGiService
    private PostcodeLookupService postcodeLookupService;

    private PostcodeLocation location;

    @PostConstruct
    protected void init() {
        if (postcodeLookupService == null || postcode == null) {
            return;
        }

        Optional<PostcodeLocation> postcodeLocation =
                postcodeLookupService.lookup(postcode);

        postcodeLocation.ifPresent(value -> location = value);
    }

    public boolean isLocationFound() {
        return location != null;
    }

    public String getResolvedPostcode() {
        return location != null ? location.getPostcode() : postcode;
    }

    public String getRegion() {
        return location != null ? location.getRegion() : "";
    }

    public double getLatitude() {
        return location != null ? location.getLatitude() : 0;
    }

    public double getLongitude() {
        return location != null ? location.getLongitude() : 0;
    }

   public String getDirectionsUrl() {
    if (location == null) {
        return "";
    }

    return "https://www.google.com/maps/dir/?api=1&destination="
            + location.getLatitude()
            + "%2C"
            + location.getLongitude()
            + "&dir_action=navigate";
}
}