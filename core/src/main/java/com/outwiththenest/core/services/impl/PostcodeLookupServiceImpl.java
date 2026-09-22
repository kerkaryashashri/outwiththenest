package com.outwiththenest.core.services.impl;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.sling.commons.json.JSONObject;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.outwiththenest.core.services.PostcodeLocation;
import com.outwiththenest.core.services.PostcodeLookupService;

@Component(
    service = PostcodeLookupService.class,
    immediate = true
)
public class PostcodeLookupServiceImpl implements PostcodeLookupService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(PostcodeLookupServiceImpl.class);

    private static final String API_URL =
            "https://api.postcodes.io/postcodes/";

    private final ConcurrentMap<String, PostcodeLocation> cache =
            new ConcurrentHashMap<>();

    private final CloseableHttpClient httpClient =
            HttpClients.createDefault();

    @Override
    public Optional<PostcodeLocation> lookup(String postcode) {
        if (postcode == null || postcode.trim().isEmpty()) {
            return Optional.empty();
        }

        String normalizedPostcode = postcode
                .trim()
                .replaceAll("\\s+", "")
                .toUpperCase();

        PostcodeLocation cachedLocation = cache.get(normalizedPostcode);
        if (cachedLocation != null) {
            return Optional.of(cachedLocation);
        }

        try {
            String encodedPostcode = URLEncoder.encode(
                    normalizedPostcode,
                    StandardCharsets.UTF_8.name()
            );

            HttpGet request = new HttpGet(API_URL + encodedPostcode);

            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getStatusLine().getStatusCode();

                if (statusCode != 200) {
                    LOGGER.warn(
                            "Postcode lookup failed for {}. HTTP status: {}",
                            normalizedPostcode,
                            statusCode
                    );
                    return Optional.empty();
                }

                String responseBody = EntityUtils.toString(
                        response.getEntity(),
                        StandardCharsets.UTF_8
                );

                JSONObject root = new JSONObject(responseBody);
                JSONObject result = root.optJSONObject("result");

                if (result == null) {
                    return Optional.empty();
                }

                double latitude = result.optDouble("latitude", Double.NaN);
                double longitude = result.optDouble("longitude", Double.NaN);

                if (Double.isNaN(latitude) || Double.isNaN(longitude)) {
                    return Optional.empty();
                }

                PostcodeLocation location = new PostcodeLocation(
                        result.optString("postcode", postcode),
                        result.optString("region", ""),
                        latitude,
                        longitude
                );

                cache.put(normalizedPostcode, location);

                return Optional.of(location);
            }
        } catch (Exception exception) {
            LOGGER.error(
                    "Unable to look up postcode {} using Postcodes.io",
                    postcode,
                    exception
            );

            return Optional.empty();
        }
    }
}