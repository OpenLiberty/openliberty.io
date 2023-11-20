// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2021, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.system;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.net.MalformedURLException;

import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;

public class SystemEndpointIT {

    private static final String PORT = System.getProperty("http.port");
    private static final String URL = "http://localhost:" + PORT + "/";
    private static final String NOTE = "test edit note";

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
    @Order(1)
    public void testEditNote() throws MalformedURLException {
        WebTarget target = client.target(URL + "system/properties/note");
        Response response = target.request().post(Entity.text("test edit note"));
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());
        response.close();
    }

    @Test
    @Order(2)
    public void testGetProperties() throws MalformedURLException {
        WebTarget target = client.target(URL + "system/properties/note");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());
        assertEquals(NOTE,
                     response.readEntity(String.class),
                     "The note was not set correctly");
        response.close();
    }

    @Test
    public void testGetProperty() throws MalformedURLException {
        WebTarget target = client.target(URL + "system/properties/user.name");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());
        assertEquals(System.getProperty("user.name"),
                     response.readEntity(String.class),
                     "user name should match");
        response.close();
    }

    @Test
    public void testGetJava() throws MalformedURLException {
        WebTarget target = client.target(URL + "system/properties/java");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());

        JsonObject java = response.readEntity(JsonObject.class);
        assertEquals(System.getProperty("java.vendor"),
                     java.getString("vendor"),
                     "java vendor should match");
        response.close();
    }

    @Test
    public void testGetOperatingSystem() throws MalformedURLException {
        WebTarget target = client.target(URL + "system/management/operatingSystem");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());

        JsonObject os = response.readEntity(JsonObject.class);
        assertEquals(System.getProperty("os.name"),
                     os.getString("name"),
                     "OS name should match");
        response.close();
    }

    @Test
    public void testGetSystemLoad() throws MalformedURLException {
        WebTarget target = client.target(URL + "system/management/systemLoad");
        Response response = target.request().get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + target.getUri().getPath());

        JsonObject data = response.readEntity(JsonObject.class);
        assertNotNull(data.getJsonNumber("heapSize"), "heapSize is null");
        assertNotNull(data.getJsonNumber("heapUsed"), "heapUsed is null");
        assertNotNull(data.getJsonNumber("processors"), "processors is null");
        assertNotNull(data.getJsonNumber("loadAverage"), "loadAverage is null");
        response.close();
    }
}
