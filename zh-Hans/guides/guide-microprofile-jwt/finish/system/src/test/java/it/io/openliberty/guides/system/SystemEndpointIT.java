// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.system;

import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Invocation.Builder;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import static org.junit.jupiter.api.Assertions.assertEquals;

import it.io.openliberty.guides.system.util.JwtBuilder;

public class SystemEndpointIT {

    static String authHeaderAdmin;
    static String authHeaderUser;
    static String urlOS;
    static String urlUsername;
    static String urlRoles;

    @BeforeAll
    public static void setup() throws Exception {
        String urlBase = "http://" + System.getProperty("hostname")
                 + ":" + System.getProperty("http.port")
                 + "/system/properties";
        urlOS = urlBase + "/os";
        urlUsername = urlBase + "/username";
        urlRoles = urlBase + "/jwtroles";

        authHeaderAdmin = "Bearer " + new JwtBuilder().createAdminJwt("testUser");
        authHeaderUser = "Bearer " + new JwtBuilder().createUserJwt("testUser");
    }

    @Test
    // tag::os[]
    public void testOSEndpoint() {
        // tag::adminRequest1[]
        Response response = makeRequest(urlOS, authHeaderAdmin);
        // end::adminRequest1[]
        assertEquals(200, response.getStatus(),
                    "Incorrect response code from " + urlOS);
        assertEquals(System.getProperty("os.name"), response.readEntity(String.class),
                "The system property for the local and remote JVM should match");

        // tag::userRequest1[]
        response = makeRequest(urlOS, authHeaderUser);
        // end::userRequest1[]
        assertEquals(403, response.getStatus(),
                    "Incorrect response code from " + urlOS);

        // tag::nojwtRequest1[]
        response = makeRequest(urlOS, null);
        // end::nojwtRequest1[]
        assertEquals(401, response.getStatus(),
                    "Incorrect response code from " + urlOS);

        response.close();
    }
    // end::os[]

    @Test
    // tag::username[]
    public void testUsernameEndpoint() {
        // tag::adminRequest2[]
        Response response = makeRequest(urlUsername, authHeaderAdmin);
        // end::adminRequest2[]
        assertEquals(200, response.getStatus(),
                "Incorrect response code from " + urlUsername);

        // tag::userRequest2[]
        response = makeRequest(urlUsername, authHeaderUser);
        // end::userRequest2[]
        assertEquals(200, response.getStatus(),
                "Incorrect response code from " + urlUsername);

        // tag::nojwtRequest2[]
        response = makeRequest(urlUsername, null);
        // end::nojwtRequest2[]
        assertEquals(401, response.getStatus(),
                "Incorrect response code from " + urlUsername);

        response.close();
    }
    // end::username[]

    @Test
    // tag::roles[]
    public void testRolesEndpoint() {
        // tag::adminRequest3[]
        Response response = makeRequest(urlRoles, authHeaderAdmin);
        // end::adminRequest3[]
        assertEquals(200, response.getStatus(),
                "Incorrect response code from " + urlRoles);
        assertEquals("[\"admin\",\"user\"]", response.readEntity(String.class),
                "Incorrect groups claim in token " + urlRoles);

        // tag::userRequest3[]
        response = makeRequest(urlRoles, authHeaderUser);
        // end::userRequest3[]
        assertEquals(200, response.getStatus(),
                "Incorrect response code from " + urlRoles);
        assertEquals("[\"user\"]", response.readEntity(String.class),
                "Incorrect groups claim in token " + urlRoles);

        // tag::nojwtRequest3[]
        response = makeRequest(urlRoles, null);
        // end::nojwtRequest3[]
        assertEquals(401, response.getStatus(),
                "Incorrect response code from " + urlRoles);

        response.close();
    }
    // end::roles[]

    private Response makeRequest(String url, String authHeader) {
        try (Client client = ClientBuilder.newClient()) {
            Builder builder = client.target(url).request();
            builder.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON);
            if (authHeader != null) {
            builder.header(HttpHeaders.AUTHORIZATION, authHeader);
            }
            Response response = builder.get();
            return response;
        }
    }

}
