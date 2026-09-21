package com.outwiththenest.core.models;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;

@ExtendWith(AemContextExtension.class)
class HelloWorldModelTest {

    private final AemContext context = new AemContext();

    @Test
    void testGetMessage() {
        context.addModelsForClasses(HelloWorldModel.class);

        context.create().resource(
            "/content/test",
            "sling:resourceType",
            "outwiththenest/components/helloworld"
        );

        context.currentResource("/content/test");

        HelloWorldModel model =
            context.request().adaptTo(HelloWorldModel.class);

        assertEquals(
            "Hello World! Resource type is: outwiththenest/components/helloworld",
            model.getMessage()
        );
    }
}