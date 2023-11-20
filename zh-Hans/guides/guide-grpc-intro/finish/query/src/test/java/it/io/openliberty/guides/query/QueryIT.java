// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.query;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.net.MalformedURLException;

import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

public class QueryIT {

    private static final String PORT = System.getProperty("http.port", "9081");
    private static final String URL = "http://localhost:" + PORT + "/";
    private static Client client;

    @BeforeAll
    public static void setup() {
        client = ClientBuilder.newClient();
    }

    @AfterAll
    public static void teardown() {
        client.close();
    }

    @Test
    // tag::getPropertiesString[]
    public void testGetPropertiesString() throws MalformedURLException {
        WebTarget target = client.target(URL + "query/properties/os.name");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());
        assertFalse(response.readEntity(String.class).isEmpty(),
                    "response should not be empty.");
        response.close();
    }
    // end::getPropertiesString[]

    @Test
    // tag::getOSProperties[]
    public void testGetOSProperties() throws MalformedURLException {
        WebTarget target = client.target(URL + "query/properties/os");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());
        JsonObject obj = response.readEntity(JsonObject.class);
        assertFalse(obj.getString("os.name").isEmpty(),
                    "os.name should not be empty.");
        response.close();
    }
    // end::getOSProperties[]

    @Test
    // tag::getUserProperties[]
    public void testGetUserProperties() throws MalformedURLException {
        WebTarget target = client.target(URL + "query/properties/user");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());
        JsonObject obj = response.readEntity(JsonObject.class);
        assertFalse(obj.getString("user.name").isEmpty(),
                    "user.name should not be empty.");
        response.close();
    }
    // end::getUserProperties[]

    @Test
    // tag::getJavaProperties[]
    public void testGetJavaProperties() throws MalformedURLException {
        WebTarget target = client.target(URL + "query/properties/java");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());
        JsonObject obj = response.readEntity(JsonObject.class);
        assertFalse(obj.getString("java.home").isEmpty(),
                    "java.home should not be empty.");
        response.close();
    }
    // end::getJavaProperties[]
}
