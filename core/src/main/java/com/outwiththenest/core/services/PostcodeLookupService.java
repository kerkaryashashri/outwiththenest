package com.outwiththenest.core.services;

import java.util.Optional;

public interface PostcodeLookupService {

    Optional<PostcodeLocation> lookup(String postcode);
}