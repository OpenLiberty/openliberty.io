// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import javax.json.JsonObject;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.provider.jsrjsonp.JsrJsonpProvider;
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
        String clusterIp = System.getProperty("cluster.ip");
        String invNodePort = System.getProperty("inventory.node.port");
        String sysNodePort = System.getProperty("system.node.port");

        sysKubeService = System.getProperty("system.kube.service");

        invUrl = "http://" + clusterIp + ":" + invNodePort + "/inventory/systems/";
        sysUrl = "http://" + clusterIp + ":" + sysNodePort + "/system/properties/";

        client = ClientBuilder.newBuilder()
                    .hostnameVerifier(new HostnameVerifier() {
                        public boolean verify(String hostname, SSLSession session) {
                            return true;
                        }
                    })
                    .build();

        client.register(JsrJsonpProvider.class);
        client.target(invUrl + "reset").request().post(null);
    }

    @AfterAll
    public static void teardown() {
        client.close();
    }

    @Test
    @Order(1)
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

    @Test
    @Order(2)
    public void testHostRegistration() {
        this.visitSystemService();

        Response response = this.getResponse(invUrl);
        this.assertResponse(invUrl, response);

        JsonObject obj = response.readEntity(JsonObject.class);

        int expected = 1;
        int actual = obj.getInt("total");
        assertEquals(expected, actual,
                "The inventory should have one entry for the system service:"
                    + sysKubeService);

        boolean serviceExists = obj.getJsonArray("systems").getJsonObject(0)
                                    .get("hostname").toString()
                                    .contains(sysKubeService);
        assertTrue(serviceExists,
                "A host was registered, but it was not " + sysKubeService);

        response.close();
    }

    @Test
    @Order(3)
    public void testSystemPropertiesMatch() {
        Response invResponse = this.getResponse(invUrl);
        Response sysResponse = this.getResponse(sysUrl);

        this.assertResponse(invUrl, invResponse);
        this.assertResponse(sysUrl, sysResponse);

        JsonObject jsonFromInventory = (JsonObject) invResponse
                                                            .readEntity(JsonObject.class)
                                                            .getJsonArray("systems")
                                                            .getJsonObject(0)
                                                            .get("properties");

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

    @Test
    @Order(4)
    public void testUnknownHost() {
        Response response = this.getResponse(invUrl);
        this.assertResponse(invUrl, response);

        Response badResponse = client.target(invUrl + "badhostname")
            .request(MediaType.APPLICATION_JSON)
            .get();

        String obj = badResponse.readEntity(String.class);

        boolean isError = obj.contains("error");
        assertTrue(isError,
                "badhostname is not a valid host but it didn't raise an error");

        response.close();
        badResponse.close();
    }


    // Returns response information from the specified URL.
    private Response getResponse(String url) {
        return client.target(url).request().get();
    }

    // Asserts that the given URL has the correct response code of 200.
    private void assertResponse(String url, Response response) {
        assertEquals(200, response.getStatus(), "Incorrect response code from " + url);
    }

    // Asserts that the specified JVM system property is equivalent in both the
    // system and inventory services.
    private void assertProperty(String propertyName, String hostname,
        String expected, String actual) {
        assertEquals(expected, actual, "JVM system property [" + propertyName + "] "
            + "in the system service does not match the one stored in "
            + "the inventory service for " + hostname);
    }

    // Makes a simple GET request to inventory/localhost.
    private void visitSystemService() {
        Response response = this.getResponse(sysUrl);
        this.assertResponse(sysUrl, response);
        response.close();

        Response targetResponse = client
            .target(invUrl + sysKubeService)
            .request()
            .get();

        targetResponse.close();
    }

}