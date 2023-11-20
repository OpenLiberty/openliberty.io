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
package it.io.openliberty.guides.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import jakarta.json.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@TestMethodOrder(OrderAnnotation.class)
public class InventoryEndpointIT {

    private static String sysUrl;
    private static String invUrl;

    private Client client;

    private static final String INVENTORY_SYSTEMS = "inventory/systems";
    private static final String SYSTEM_PROPERTIES = "system/properties";

    @BeforeAll
    public static void oneTimeSetup() throws ServletException {
        String sysPort = System.getProperty("sys.http.port");
        sysUrl = "http://localhost:" + sysPort + "/";
        String invPort = System.getProperty("inv.http.port");
        invUrl = "http://localhost:" + invPort + "/";

        Response clearResponse = ClientBuilder.newClient()
                .target(invUrl + INVENTORY_SYSTEMS)
                .request()
                .delete();

        if (clearResponse.getStatus() != Response.Status.OK.getStatusCode()
            && clearResponse.getStatus()
            != Response.Status.NOT_MODIFIED.getStatusCode()) {
            throw new ServletException("Could not clear inventory manager.");
        }
    }

    @BeforeEach
    public void setup() {
        client = ClientBuilder.newClient();
    }

    @AfterEach
    public void teardown() {
        client.close();
    }

    @Test
    @Order(1)
    public void testEmptyInventory() {
        Response response = this.getResponse(invUrl + INVENTORY_SYSTEMS);
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
        this.visitLocalhost();

        Response response = this.getResponse(invUrl + INVENTORY_SYSTEMS);
        this.assertResponse(invUrl, response);

        JsonObject obj = response.readEntity(JsonObject.class);

        int expected = 1;
        int actual = obj.getInt("total");
        assertEquals(expected, actual,
                "The inventory should have one entry for localhost");

        boolean localhostExists = obj.getJsonArray("systems").getJsonObject(0)
                                                             .get("hostname").toString()
                                                             .contains("localhost");
        assertTrue(localhostExists,
                "A host was registered, but it was not localhost");

        response.close();
    }

    @Test
    @Order(3)
    public void testSystemPropertiesMatch() {
        Response invResponse = this.getResponse(invUrl + INVENTORY_SYSTEMS);
        Response sysResponse = this.getResponse(sysUrl + SYSTEM_PROPERTIES);

        this.assertResponse(invUrl, invResponse);
        this.assertResponse(sysUrl, sysResponse);

        JsonObject jsonFromInventory = (JsonObject)
                                        invResponse.readEntity(JsonObject.class)
                                        .getJsonArray("systems")
                                        .getJsonObject(0)
                                        .get("properties");

        JsonObject jsonFromSystem = sysResponse.readEntity(JsonObject.class);

        String osNameFromInventory = jsonFromInventory.getString("os.name");
        String osNameFromSystem = jsonFromSystem.getString("os.name");
        this.assertProperty("os.name", "localhost",
                            osNameFromSystem, osNameFromInventory);

        String userNameFromInventory = jsonFromInventory.getString("user.name");
        String userNameFromSystem = jsonFromSystem.getString("user.name");
        this.assertProperty("user.name", "localhost",
                            userNameFromSystem, userNameFromInventory);

        invResponse.close();
        sysResponse.close();
    }

    @Test
    @Order(4)
    public void testUnknownHost() {
        Response response = this.getResponse(invUrl + INVENTORY_SYSTEMS);
        this.assertResponse(invUrl, response);

        Response badResponse = client.target(invUrl + INVENTORY_SYSTEMS + "/"
                               + "badhostname").request(MediaType.APPLICATION_JSON)
                               .get();

        assertEquals(404, badResponse.getStatus(),
                "BadResponse expected status: 404. Response code not as expected.");

        String stringObj = badResponse.readEntity(String.class);
        assertTrue(stringObj.contains("error"),
                "badhostname is not a valid host but it didn't raise an error");

        response.close();
        badResponse.close();
   }

    private Response getResponse(String url) {
        return client.target(url).request().get();
    }

    private void assertResponse(String url, Response response) {
        assertEquals(200, response.getStatus(),
                "Incorrect response code from " + url);
    }

    private void assertProperty(String propertyName, String hostname,
            String expected, String actual) {
        assertEquals(expected, actual,
                "JVM system property [" + propertyName + "] "
                        + "in the system service does not match the one stored in "
                        + "the inventory service for " + hostname);
    }

    private void visitLocalhost() {
        Response response = this.getResponse(sysUrl + SYSTEM_PROPERTIES);
        this.assertResponse(sysUrl, response);
        response.close();

        Response targetResponse = client.target(invUrl
                                               + INVENTORY_SYSTEMS + "/localhost")
                                               .request()
                                               .get();
        targetResponse.close();
    }
}
