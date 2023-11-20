// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.hateoas;

import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonValue;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

// tag::class[]
@TestMethodOrder(OrderAnnotation.class)
public class EndpointIT {
    // tag::class-contents[]
    // tag::setup[]
    private String port;
    private String baseUrl;

    private Client client;

    private final String SYSTEM_PROPERTIES = "system/properties";
    private final String INVENTORY_HOSTS = "inventory/hosts";

    // tag::Before[]
    @BeforeEach
    // end::Before[]
    public void setup() {
        // tag::urlCreation[]
        port = System.getProperty("http.port");
        baseUrl = "http://localhost:" + port + "/";
        // end::urlCreation[]

        // tag::clientInit[]
        client = ClientBuilder.newClient();
        // end::clientInit[]
    }

    // tag::After[]
    @AfterEach
    // end::After[]
    public void teardown() {
        client.close();
    }
    // end::setup[]

    /**
     * Checks if the HATEOAS link for the inventory contents (hostname=*)
     * is as expected.
     */
    // tag::Test1[]
    @Test
    // end::Test1[]
    // tag::Order1[]
    @Order(1)
    // end::Order1[]
    // tag::testLinkForInventoryContents[]
    public void testLinkForInventoryContents() {
        Response response = this.getResponse(baseUrl + INVENTORY_HOSTS);
        assertEquals(200, response.getStatus(),
                    "Incorrect response code from " + baseUrl);

        // tag::jsonobj[]
        JsonObject systems = response.readEntity(JsonObject.class);
        // end::jsonobj[]

        // tag::assertAndClose[]
        String expected;
        String actual;
        boolean isFound = false;


        if (!systems.isNull("*")) {
            // mark that the correct host info was found
            isFound = true;
            JsonArray links = systems.getJsonArray("*");

            expected = baseUrl + INVENTORY_HOSTS + "/*";
            actual = links.getJsonObject(0).getString("href");
            assertEquals(expected, actual, "Incorrect href");

            // asserting that rel was correct
            expected = "self";
            actual = links.getJsonObject(0).getString("rel");
            assertEquals(expected, actual, "Incorrect rel");
        }


        // If the hostname '*' was not even found, need to fail the testcase
        assertTrue(isFound, "Could not find system with hostname *");

        response.close();
        // end::assertAndClose[]
    }
    // end::testLinkForInventoryContents[]

    /**
     * Checks that the HATEOAS links, with relationships 'self' and 'properties' for
     * a simple localhost system is as expected.
     */
    // tag::Test2[]
    @Test
    // end::Test2[]
    // tag::Order2[]
    @Order(2)
    // end::Order2[]
    // tag::testLinksForSystem[]
    public void testLinksForSystem() {
        this.visitLocalhost();

        Response response = this.getResponse(baseUrl + INVENTORY_HOSTS);
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + baseUrl);

        JsonObject systems = response.readEntity(JsonObject.class);

        String expected;
        String actual;
        boolean isHostnameFound = false;


        // Try to find the JSON object for hostname localhost
        if (!systems.isNull("localhost")) {
            isHostnameFound = true;
            JsonArray links = systems.getJsonArray("localhost");

            // testing the 'self' link
            expected = baseUrl + INVENTORY_HOSTS + "/localhost";
            actual = links.getJsonObject(0).getString("href");
            assertEquals(expected, actual, "Incorrect href");

            expected = "self";
            actual = links.getJsonObject(0).getString("rel");
            assertEquals(expected, actual, "Incorrect rel");

            // testing the 'properties' link
            expected = baseUrl + SYSTEM_PROPERTIES;
            actual = links.getJsonObject(1).getString("href");
            assertEquals(expected, actual, "Incorrect href");

            expected = "properties";
            actual = links.getJsonObject(1).getString("rel");

            assertEquals(expected, actual, "Incorrect rel");
        }


        // If the hostname 'localhost' was not even found, need to fail the testcase
        assertTrue(isHostnameFound, "Could not find system with hostname *");
        response.close();

    }
    // end::testLinksForSystem[]

    /**
     * Returns a Response object for the specified URL.
     */
    private Response getResponse(String url) {
        return client.target(url).request().get();
    }

    /**
     * Makes a GET request to localhost at the Inventory service.
     */
    private void visitLocalhost() {
        Response response = this.getResponse(baseUrl + SYSTEM_PROPERTIES);
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + baseUrl);
        response.close();
        // tag::targetResponse[]
        Response targetResponse =
        client.target(baseUrl + INVENTORY_HOSTS + "/localhost")
                                        .request()
                                        .get();
        // end::targetResponse[]
        targetResponse.close();
    }
    // end::class-contents[]
}
// end::class[]
