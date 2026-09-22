package com.outwiththenest.core.services;

public class PostcodeLocation {

    private final String postcode;
    private final String region;
    private final double latitude;
    private final double longitude;

    public PostcodeLocation(
            String postcode,
            String region,
            double latitude,
            double longitude) {

        this.postcode = postcode;
        this.region = region;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getPostcode() {
        return postcode;
    }

    public String getRegion() {
        return region;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }
}