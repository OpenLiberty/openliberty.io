// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.application;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.StringReader;
import java.util.ArrayList;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.TestMethodOrder;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.client.Entity;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CrewServiceIT {

    private static Client client;
    private static JsonArray testData;
    private static String rootURL;
    private static ArrayList<String> testIDs = new ArrayList<>(2);

    @BeforeAll
    public static void setup() {
        client = ClientBuilder.newClient();

        String port = System.getProperty("app.http.port");
        String context = System.getProperty("app.context.root");
        rootURL = "http://localhost:" + port + context;

        // test data
        JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();
        JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
        jsonBuilder.add("name", "Member1");
        jsonBuilder.add("crewID", "000001");
        jsonBuilder.add("rank", "Captain");
        arrayBuilder.add(jsonBuilder.build());
        jsonBuilder = Json.createObjectBuilder();
        jsonBuilder.add("name", "Member2");
        jsonBuilder.add("crewID", "000002");
        jsonBuilder.add("rank", "Engineer");
        arrayBuilder.add(jsonBuilder.build());
        testData = arrayBuilder.build();
    }

    @AfterAll
    public static void teardown() {
        client.close();
    }

    // tag::testAddCrewMember[]
    // tag::test1[]
    @Test
    // end::test1[]
    @Order(1)
    public void testAddCrewMember() {
        System.out.println("   === Adding " + testData.size()
                + " crew members to the database. ===");

        for (int i = 0; i < testData.size(); i++) {
            JsonObject member = (JsonObject) testData.get(i);
            String url = rootURL + "/api/crew";
            Response response = client.target(url).request().post(Entity.json(member));
            this.assertResponse(url, response);

            JsonObject newMember = response.readEntity(JsonObject.class);
            testIDs.add(newMember.getJsonObject("_id").getString("$oid"));

            response.close();
        }
        System.out.println("      === Done. ===");
    }
    // end::testAddCrewMember[]

    // tag::testUpdateCrewMember[]
    // tag::test2[]
    @Test
    // end::test2[]
    @Order(2)
    public void testUpdateCrewMember() {
        System.out.println("   === Updating crew member with id " + testIDs.get(0)
                + ". ===");

        JsonObject oldMember = (JsonObject) testData.get(0);

        JsonObjectBuilder newMember = Json.createObjectBuilder();
        newMember.add("name", oldMember.get("name"));
        newMember.add("crewID", oldMember.get("crewID"));
        newMember.add("rank", "Officer");

        String url = rootURL + "/api/crew/" + testIDs.get(0);
        Response response = client.target(url).request()
                .put(Entity.json(newMember.build()));

        this.assertResponse(url, response);

        System.out.println("      === Done. ===");
    }
    // end::testUpdateCrewMember[]

    // tag::testGetCrewMembers[]
    // tag::test3[]
    @Test
    // end::test3[]
    @Order(3)
    public void testGetCrewMembers() {
        System.out.println("   === Listing crew members from the database. ===");

        String url = rootURL + "/api/crew";
        Response response = client.target(url).request().get();

        this.assertResponse(url, response);

        String responseText = response.readEntity(String.class);
        JsonReader reader = Json.createReader(new StringReader(responseText));
        JsonArray crew = reader.readArray();
        reader.close();

        int testMemberCount = 0;
        for (JsonValue value : crew) {
            JsonObject member = (JsonObject) value;
            String id = member.getJsonObject("_id").getString("$oid");
            if (testIDs.contains(id)) {
                testMemberCount++;
            }
        }

        assertEquals(testIDs.size(), testMemberCount,
                "Incorrect number of testing members.");

        System.out.println("      === Done. There are " + crew.size()
                + " crew members. ===");

        response.close();
    }
    // end::testGetCrewMembers[]

    // tag::testDeleteCrewMember[]
    // tag::test4[]
    @Test
    // end::test4[]
    @Order(4)
    public void testDeleteCrewMember() {
        System.out.println("   === Removing " + testIDs.size()
                + " crew members from the database. ===");

        for (String id : testIDs) {
            String url = rootURL + "/api/crew/" + id;
            Response response = client.target(url).request().delete();
            this.assertResponse(url, response);
            response.close();
        }

        System.out.println("      === Done. ===");
    }
    // end::testDeleteCrewMember[]

    private void assertResponse(String url, Response response) {
        assertEquals(200, response.getStatus(), "Incorrect response code from " + url);
    }
}
