// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2018, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;

import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@TestMethodOrder(OrderAnnotation.class)
public class InventoryEndpointIT {

    private static String invUrl;
    private static String sysUrl;
    private static String sysKubeService;

    private static Client client;

    @BeforeAll
    public static void oneTimeSetup() {
        String invRootPath = System.getProperty("inventory.service.root");
        String sysRootPath = System.getProperty("system.service.root");

        sysKubeService = System.getProperty("system.kube.service");
        invUrl = "http://" + invRootPath + "/inventory/systems/";
        sysUrl = "http://" + sysRootPath + "/system/properties/";

        client = ClientBuilder.newBuilder().hostnameVerifier(new HostnameVerifier() {
            public boolean verify(String hostname, SSLSession session) {
                return true;
            }
        }).build();

        client.target(invUrl + "reset").request().post(null);
    }

    @AfterAll
    public static void teardown() {
        client.close();
    }

    // tag::tests[]
    @Test
    @Order(1)
    // tag::testEmptyInventory[]
    public void testEmptyInventory() {
        Response response = this.getResponse(invUrl);
        this.assertResponse(invUrl, response);

        JsonObject obj = response.readEntity(JsonObject.class);

        int expected = 0;
        int actual = obj.getInt("total");
        assertEquals(expected, actual,
            "The inventory should be empty on application start but it wasn't");

        response.close();
    }
    // end::testEmptyInventory[]

    @Test
    @Order(2)
    // tag::testHostRegistration[]
    public void testHostRegistration() {
        this.visitSystemService();

        Response response = this.getResponse(invUrl);
        this.assertResponse(invUrl, response);

        JsonObject obj = response.readEntity(JsonObject.class);

        int expected = 1;
        int actual = obj.getInt("total");
        assertEquals(expected, actual,
            "The inventory should have one entry for " + sysKubeService);

        boolean serviceExists = obj.getJsonArray("systems").getJsonObject(0)
                        .get("hostname").toString().contains(sysKubeService);
        assertTrue(serviceExists,
            "A host was registered, but it was not " + sysKubeService);

        response.close();
    }
    // end::testHostRegistration[]

    @Test
    @Order(3)
    // tag::testSystemPropertiesMatch[]
    public void testSystemPropertiesMatch() {
        Response invResponse = this.getResponse(invUrl);
        Response sysResponse = this.getResponse(sysUrl);

        this.assertResponse(invUrl, invResponse);
        this.assertResponse(sysUrl, sysResponse);

        JsonObject jsonFromInventory = (JsonObject) invResponse
                        .readEntity(JsonObject.class).getJsonArray("systems")
                        .getJsonObject(0).get("properties");

        JsonObject jsonFromSystem = sysResponse.readEntity(JsonObject.class);

        String osNameFromInventory = jsonFromInventory.getString("os.name");
        String osNameFromSystem = jsonFromSystem.getString("os.name");
        this.assertProperty("os.name", sysKubeService, osNameFromSystem,
                        osNameFromInventory);

        String userNameFromInventory = jsonFromInventory.getString("user.name");
        String userNameFromSystem = jsonFromSystem.getString("user.name");
        this.assertProperty("user.name", sysKubeService, userNameFromSystem,
                        userNameFromInventory);

        invResponse.close();
        sysResponse.close();
    }
    // end::testSystemPropertiesMatch[]

    @Test
    @Order(4)
    // tag::testUnknownHost[]
    public void testUnknownHost() {
        Response response = this.getResponse(invUrl);
        this.assertResponse(invUrl, response);

        Response badResponse = client.target(invUrl + "badhostname")
                        .request(MediaType.APPLICATION_JSON).get();

        assertEquals(404, badResponse.getStatus(),
                     "BadResponse expected status: 404. "
                     + "Response code not as expected.");

        String obj = badResponse.readEntity(String.class);

        boolean isError = obj.contains("error");
        assertTrue(isError,
                        "badhostname is not a valid host but it didn't raise an error");

        response.close();
        badResponse.close();
    }
    // end::testUnknownHost[]
    // end::tests[]
    // tag::helpers[]
    // tag::javadoc[]
    /**
     * <p>
     * Returns response information from the specified URL.
     * </p>
     *
     * @param url - target URL.
     * @return Response object with the response from the specified URL.
     */
    // end::javadoc[]
    private Response getResponse(String url) {
        return client.target(url).request().get();
    }

    // tag::javadoc[]
    /**
     * <p>
     * Asserts that the given URL has the correct response code of 200.
     * </p>
     *
     * @param url      - target URL.
     * @param response - response received from the target URL.
     */
    // end::javadoc[]
    private void assertResponse(String url, Response response) {
        assertEquals(200, response.getStatus(), "Incorrect response code from " + url);
    }

    // tag::javadoc[]
    /**
     * Asserts that the specified JVM system property is equivalent in both the
     * system and inventory services.
     *
     * @param propertyName - name of the system property to check.
     * @param hostname     - name of JVM's host.
     * @param expected     - expected name.
     * @param actual       - actual name.
     */
    // end::javadoc[]
    private void assertProperty(String propertyName, String hostname, String expected,
                    String actual) {
        assertEquals(expected, actual, "JVM system property [" + propertyName + "] "
                        + "in the system service does not match the one stored in "
                        + "the inventory service for " + hostname);
    }

    // tag::javadoc[]
    /**
     * Makes a simple GET request to inventory/localhost.
     */
    // end::javadoc[]
    private void visitSystemService() {
        Response response = this.getResponse(sysUrl);
        this.assertResponse(sysUrl, response);
        response.close();

        Response targetResponse = client.target(invUrl + sysKubeService).request()
                        .get();

        targetResponse.close();
    }
}
