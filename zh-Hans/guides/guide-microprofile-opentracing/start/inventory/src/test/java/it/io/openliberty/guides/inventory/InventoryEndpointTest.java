// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2018, 2020 IBM Corporation and others.
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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import javax.json.JsonObject;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.provider.jsrjsonp.JsrJsonpProvider;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

public class InventoryEndpointTest {

    private static String sysPort;
    private static String invPort;
    private static String sysUrl;
    private static String invUrl;

    private Client client;

    private final String SYSTEM_PROPERTIES = "system/properties";
    private final String INVENTORY_SYSTEMS = "inventory/systems";

    @BeforeClass
    public static void oneTimeSetup() {
        sysPort = System.getProperty("sys.http.port");
        sysUrl = "http://localhost:" + sysPort + "/";
        invPort = System.getProperty("inv.http.port");
        invUrl = "http://localhost:" + invPort + "/";
    }

    @Before
    public void setup() {
        client = ClientBuilder.newClient();
        client.register(JsrJsonpProvider.class);
    }

    @After
    public void teardown() {
        client.close();
    }

    @Test
    public void testSuite() {
        this.testEmptyInventory();
        this.testHostRegistration();
        this.testSystemPropertiesMatch();
        this.testUnknownHost();
    }

    public void testEmptyInventory() {
        Response response = this.getResponse(invUrl + INVENTORY_SYSTEMS);
        this.assertResponse(invUrl, response);

        JsonObject obj = response.readEntity(JsonObject.class);

        int expected = 0;
        int actual = obj.getInt("total");
        assertEquals("The inventory should be empty on application start but it wasn't", 
                     expected, actual);

        response.close();
    }

    public void testHostRegistration() {
        this.visitLocalhost();

        Response response = this.getResponse(invUrl + INVENTORY_SYSTEMS);
        this.assertResponse(invUrl, response);

        JsonObject obj = response.readEntity(JsonObject.class);

        int expected = 1;
        int actual = obj.getInt("total");
        assertEquals("The inventory should have one entry for localhost", 
                     expected, actual);

        boolean localhostExists = obj.getJsonArray("systems").getJsonObject(0)
                                                             .get("hostname").toString()
                                                             .contains("localhost");
        assertTrue("A host was registered, but it was not localhost", 
                   localhostExists);

        response.close();
    }

    public void testSystemPropertiesMatch() {
        Response invResponse = this.getResponse(invUrl + INVENTORY_SYSTEMS);
        Response sysResponse = this.getResponse(sysUrl + SYSTEM_PROPERTIES);

        this.assertResponse(invUrl, invResponse);
        this.assertResponse(sysUrl, sysResponse);

        JsonObject jsonFromInventory = (JsonObject) invResponse.readEntity(JsonObject.class)
                                                               .getJsonArray("systems")
                                                               .getJsonObject(0)
                                                               .get("properties");

        JsonObject jsonFromSystem = sysResponse.readEntity(JsonObject.class);

        String osNameFromInventory = jsonFromInventory.getString("os.name");
        String osNameFromSystem = jsonFromSystem.getString("os.name");
        this.assertProperty("os.name", "localhost", osNameFromSystem, osNameFromInventory);

        String userNameFromInventory = jsonFromInventory.getString("user.name");
        String userNameFromSystem = jsonFromSystem.getString("user.name");
        this.assertProperty("user.name", "localhost", userNameFromSystem, userNameFromInventory);

        invResponse.close();
        sysResponse.close();
    }

    public void testUnknownHost() {
        Response response = this.getResponse(invUrl + INVENTORY_SYSTEMS);
        this.assertResponse(invUrl, response);

        Response badResponse = client.target(invUrl + INVENTORY_SYSTEMS + "/" 
                               + "badhostname").request(MediaType.APPLICATION_JSON).get();

        assertEquals("BadResponse expected status: 404. Response code not as expected.", 
                                                            404, badResponse.getStatus());

        String stringObj = badResponse.readEntity(String.class);
        assertTrue("badhostname is not a valid host but it didn't raise an error", 
                                                            stringObj.contains("error"));

        response.close();
        badResponse.close();
   }

    /**
     * <p>
     * Returns response information from the specified URL.
     * </p>
     * 
     * @param url
     *          - target URL.
     * @return Response object with the response from the specified URL.
     */
    private Response getResponse(String url) {
        return client.target(url).request().get();
    }

    /**
     * <p>
     * Asserts that the given URL has the correct response code of 200.
     * </p>
     * 
     * @param url
     *          - target URL.
     * @param response
     *          - response received from the target URL.
     */
    private void assertResponse(String url, Response response) {
        assertEquals("Incorrect response code from " + url, 200, response.getStatus());
    }

    /**
     * Asserts that the specified JVM system property is equivalent in both the
     * system and inventory services.
     * 
     * @param propertyName
     *          - name of the system property to check.
     * @param hostname
     *          - name of JVM's host.
     * @param expected
     *          - expected name.
     * @param actual
     *          - actual name.
     */
    private void assertProperty(String propertyName, String hostname,
            String expected, String actual) {
        assertEquals("JVM system property [" + propertyName + "] "
                + "in the system service does not match the one stored in "
                + "the inventory service for " + hostname, expected, actual);
    }

    /**
     * Makes a simple GET request to inventory/systems/localhost.
     */
    private void visitLocalhost() {
        Response response = this.getResponse(sysUrl + SYSTEM_PROPERTIES);
        this.assertResponse(sysUrl, response);
        response.close();

        Response targetResponse = client.target(invUrl + INVENTORY_SYSTEMS + "/localhost").request().get();
        targetResponse.close();
    }
}
