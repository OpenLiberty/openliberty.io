// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2023 IBM Corporation and others.
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Response;

public class QueryEndpointIT {

    private static String port = System.getProperty("http.port");
    private static String baseUrl = "http://localhost:" + port + "/query";
    private static String systemHost = System.getProperty("system.host");

    private static Client client;

    @BeforeEach
    public void setup() {
      client = ClientBuilder.newClient();
    }

    @AfterEach
    public void teardown() {
        client.close();
    }

    // tag::testQuerySystem[]
    @Test
    public void testQuerySystem() {

        Response response = this.getResponse(baseUrl + "/systems/" + systemHost);
        this.assertResponse(baseUrl, response);

        JsonObject jsonObj = response.readEntity(JsonObject.class);
        assertNotNull(jsonObj.getString("os.name"), "os.name is null");
        assertNotNull(jsonObj.getString("java.version"), "java.version is null");

        response.close();
    }
    // end::testQuerySystem[]

    // tag::testUnknownHost[]
    @Test
    public void testUnknownHost() {
        Response response = this.getResponse(baseUrl + "/systems/unknown");
        this.assertResponse(baseUrl, response);

        JsonObject json = response.readEntity(JsonObject.class);
        assertEquals("Failed to reach the client unknown.", json.getString("fail"),
            "Fail message is wrong.");
        response.close();
    }
    // end::testUnknownHost[]

    private Response getResponse(String url) {
        return client.target(url).request().get();
    }

    private void assertResponse(String url, Response response) {
        assertEquals(200, response.getStatus(), "Incorrect response code from " + url);
    }

}
