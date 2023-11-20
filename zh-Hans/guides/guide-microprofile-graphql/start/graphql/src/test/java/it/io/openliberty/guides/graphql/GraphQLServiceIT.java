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
package it.io.openliberty.guides.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.Properties;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;

import org.apache.http.Consts;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class GraphQLServiceIT {

    private static String url;
    private static String hostname;

    private static final Jsonb JSONB = JsonbBuilder.create();

    @BeforeAll
    public static void setUp() {
        String port = System.getProperty("http.port");
        hostname = "localhost";
        url = "http://" + hostname + ":" + port + "/graphql";
    }

    @SuppressWarnings("unchecked")
    @Test
    @Order(1)
    public void testGetSystem() throws ClientProtocolException, IOException {
        HttpClient httpClient = HttpClients.createDefault();
        HttpPost post = new HttpPost(url);
        String request =
            "{ \"query\": "
                + "\"query($hostnameArg:String) { "
                    + "system (hostname: $hostnameArg) { "
                        + "hostname username timezone "
                        + "java { version vendorName } "
                        + "operatingSystem {arch name version} "
                    + "} "
                + "}\","
            + "\"variables\": {\"hostnameArg\": \"" + hostname + "\"} "
            + "}";
        StringEntity entity = new StringEntity(
            request,
            ContentType.create("application/json", Consts.UTF_8));
        post.setEntity(entity);
        HttpResponse response = httpClient.execute(post);
        String responseString = EntityUtils.toString(response.getEntity());
        Map<String, Object> result = JSONB.fromJson(responseString, Map.class);
        assertTrue(
            result.containsKey("data"),
            "No response data received: " + responseString);
        assertFalse(
            result.containsKey("error"),
            "Response has errors");
        Map<String, Object> data = (Map<String, Object>) result.get("data");
        Map<String, Object> system = (Map<String, Object>) data.get("system");
        assertNotNull(
            system,
            "Response is not for system query");
        // Verify fields
        Properties systemProperties = System.getProperties();
        assertEquals(
            systemProperties.getProperty("user.name"),
            (String) system.get("username"),
            "Usernames don't match");
    }

    @SuppressWarnings("unchecked")
    @Test
    @Order(2)
    public void testEditNote() throws ClientProtocolException, IOException {
        String expectedNote = "Time: " + System.currentTimeMillis();

        HttpClient httpClient = HttpClients.createDefault();
        HttpPost mutation = new HttpPost(url);
        StringEntity mutationBody = new StringEntity(
            "{ "
                + "\"query\": \"mutation ($hostnameArg: String!, $noteArg: String!) {"
                    + "editNote(hostname:$hostnameArg, note:$noteArg)}\","
                + "\"variables\": {"
                    + "\"hostnameArg\":\"" + hostname + "\","
                    + "\"noteArg\":\"" + expectedNote + "\"} "
            + "}",
            ContentType.create("application/json", Consts.UTF_8));
        mutation.setEntity(mutationBody);
        HttpResponse mutateResponse = httpClient.execute(mutation);
        String mutateResString = EntityUtils.toString(mutateResponse.getEntity());
        Map<String, Object> mutateJson = JSONB.fromJson(mutateResString, Map.class);
        assertFalse(
            mutateJson.containsKey("error"),
            "Mutation has errors: " + mutateResString);

        HttpPost query = new HttpPost(url);
        StringEntity queryBody = new StringEntity(
            "{ \"query\": "
                + "\"query ($hostnameArg: String!) { "
                    + "system (hostname: $hostnameArg) { note } "
                + "}\","
                + "\"variables\": {\"hostnameArg\": \"" + hostname + "\"} "
            + "}",
            ContentType.create("application/json", Consts.UTF_8));
        query.setEntity(queryBody);
        HttpResponse queryResponse = httpClient.execute(query);
        String queryResponseString = EntityUtils.toString(queryResponse.getEntity());
        Map<String, Object> queryJson = JSONB.fromJson(queryResponseString, Map.class);
        assertTrue(
            queryJson.containsKey("data"),
            "No response data received: " + queryResponseString);
        assertFalse(
            queryJson.containsKey("error"),
            "Response has errors");
        Map<String, Object> data = (Map<String, Object>) queryJson.get("data");
        Map<String, Object> system = (Map<String, Object>) data.get("system");
        assertNotNull(
            system,
            "Response is not for system query");
        assertEquals(
            expectedNote,
            (String) system.get("note"),
            "Response does not contain expected note");
    }

    @SuppressWarnings("unchecked")
    @Test
    @Order(3)
    public void testSystemLoad() throws ClientProtocolException, IOException {
        HttpClient httpClient = HttpClients.createDefault();
        HttpPost query = new HttpPost(url);
        StringEntity queryBody = new StringEntity(
            "{ \"query\": "
                + "\"query ($hostnamesArg: [String!]) { "
                    + "systemLoad (hostnames: $hostnamesArg) { "
                        + "hostname loadData {"
                            + "heapUsed loadAverage processors heapSize"
                        + "} "
                    + "}"
                + "}\","
                + "\"variables\": {\"hostnamesArg\": ["
                    + "\"" + hostname + "\", \"" + hostname + "\""
                + "]} "
            + "}",
            ContentType.create("application/json", Consts.UTF_8));
        query.setEntity(queryBody);
        HttpResponse queryResponse = httpClient.execute(query);
        String queryResponseString = EntityUtils.toString(queryResponse.getEntity());
        Map<String, Object> queryJson = JSONB.fromJson(queryResponseString, Map.class);
        assertTrue(
            queryJson.containsKey("data"),
            "No response data received: " + queryResponseString);
        assertFalse(
            queryJson.containsKey("error"),
            "Response has errors");
        Map<String, Object> data = (Map<String, Object>) queryJson.get("data");
        ArrayList<Object> systemLoadList = (ArrayList<Object>) data.get("systemLoad");
        assertEquals(
            2,
            systemLoadList.size(),
            "List should have one object: " + queryResponseString);
        Map<String, Object> systemLoad = (Map<String, Object>) systemLoadList.get(0);
        assertEquals(
            hostname,
            systemLoad.get("hostname"),
            "systemLoad hostname does not match: " + queryResponseString);
        Map<String, Object> systemLoadData =
            (Map<String, Object>) systemLoad.get("loadData");
        assertTrue(
            systemLoadData.containsKey("heapSize"),
            "systemLoadData should contain heapSize: " + queryResponseString);
        assertTrue(
            systemLoadData.containsKey("heapUsed"),
            "systemLoadData should contain heapUsed: " + queryResponseString);
        assertTrue(
            systemLoadData.containsKey("processors"),
            "systemLoadData should contain processors: " + queryResponseString);
        assertTrue(
            systemLoadData.containsKey("loadAverage"),
            "systemLoadData should contain loadAverage: " + queryResponseString);
    }
}
