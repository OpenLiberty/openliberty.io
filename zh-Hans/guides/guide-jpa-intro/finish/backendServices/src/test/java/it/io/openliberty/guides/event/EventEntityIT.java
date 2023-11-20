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
package it.io.openliberty.guides.event;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.HashMap;
import jakarta.json.JsonObject;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.Response.Status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Test;
import io.openliberty.guides.event.models.Event;

public class EventEntityIT extends EventIT {

    private static final String JSONFIELD_LOCATION = "location";
    private static final String JSONFIELD_NAME = "name";
    private static final String JSONFIELD_TIME = "time";
    private static final String EVENT_TIME = "12:00 PM, January 1 2018";
    private static final String EVENT_LOCATION = "IBM";
    private static final String EVENT_NAME = "JPA Guide";
    private static final String UPDATE_EVENT_TIME = "12:00 PM, February 1 2018";
    private static final String UPDATE_EVENT_LOCATION = "IBM Updated";
    private static final String UPDATE_EVENT_NAME = "JPA Guide Updated";

    private static final int NO_CONTENT_CODE = Status.NO_CONTENT.getStatusCode();
    private static final int NOT_FOUND_CODE = Status.NOT_FOUND.getStatusCode();

    @BeforeAll
    public static void oneTimeSetup() {
        port = System.getProperty("backend.http.port");
        baseUrl = "http://localhost:" + port + "/";
    }

    @BeforeEach
    public void setup() {
        form = new Form();
        client = ClientBuilder.newClient();

        eventForm = new HashMap<String, String>();

        eventForm.put(JSONFIELD_NAME, EVENT_NAME);
        eventForm.put(JSONFIELD_LOCATION, EVENT_LOCATION);
        eventForm.put(JSONFIELD_TIME, EVENT_TIME);
    }

    @Test
    // tag::testInvalidRead[]
    public void testInvalidRead() {
        assertEquals(true, getIndividualEvent(-1).isEmpty(),
          "Reading an event that does not exist should return an empty list");
    }
    // end::testInvalidRead[]

    @Test
    // tag::testInvalidDelete[]
    public void testInvalidDelete() {
        int deleteResponse = deleteRequest(-1);
        assertEquals(NOT_FOUND_CODE, deleteResponse,
          "Trying to delete an event that does not exist should return the "
          + "HTTP response code " + NOT_FOUND_CODE);
    }
    // end::testInvalidDelete[]

    @Test
    // tag::testInvalidUpdate[]
    public void testInvalidUpdate() {
        int updateResponse = updateRequest(eventForm, -1);
        assertEquals(NOT_FOUND_CODE, updateResponse,
          "Trying to update an event that does not exist should return the "
          + "HTTP response code " + NOT_FOUND_CODE);
    }
    // end::testInvalidUpdate[]

    @Test
    // tag::testReadIndividualEvent[]
    public void testReadIndividualEvent() {
        int postResponse = postRequest(eventForm);
        assertEquals(NO_CONTENT_CODE, postResponse,
          "Creating an event should return the HTTP reponse code " + NO_CONTENT_CODE);

        Event e = new Event(EVENT_NAME, EVENT_LOCATION, EVENT_TIME);
        JsonObject event = findEvent(e);
        event = getIndividualEvent(event.getInt("id"));
        assertData(event, EVENT_NAME, EVENT_LOCATION, EVENT_TIME);

        int deleteResponse = deleteRequest(event.getInt("id"));
        assertEquals(NO_CONTENT_CODE, deleteResponse,
          "Deleting an event should return the HTTP response code " + NO_CONTENT_CODE);
    }
    // end::testReadIndividualEvent[]

    @Test
    // tag::testCURD[]
    public void testCRUD() {
        int eventCount = getRequest().size();
        int postResponse = postRequest(eventForm);
        assertEquals(NO_CONTENT_CODE, postResponse,
          "Creating an event should return the HTTP reponse code " + NO_CONTENT_CODE);

        Event e = new Event(EVENT_NAME, EVENT_LOCATION, EVENT_TIME);
        JsonObject event = findEvent(e);
        assertData(event, EVENT_NAME, EVENT_LOCATION, EVENT_TIME);

        eventForm.put(JSONFIELD_NAME, UPDATE_EVENT_NAME);
        eventForm.put(JSONFIELD_LOCATION, UPDATE_EVENT_LOCATION);
        eventForm.put(JSONFIELD_TIME, UPDATE_EVENT_TIME);
        int updateResponse = updateRequest(eventForm, event.getInt("id"));
        assertEquals(NO_CONTENT_CODE, updateResponse,
          "Updating an event should return the HTTP response code " + NO_CONTENT_CODE);

        e = new Event(UPDATE_EVENT_NAME, UPDATE_EVENT_LOCATION, UPDATE_EVENT_TIME);
        event = findEvent(e);
        assertData(event, UPDATE_EVENT_NAME, UPDATE_EVENT_LOCATION, UPDATE_EVENT_TIME);

        int deleteResponse = deleteRequest(event.getInt("id"));
        assertEquals(NO_CONTENT_CODE, deleteResponse,
          "Deleting an event should return the HTTP response code " + NO_CONTENT_CODE);
        assertEquals(eventCount, getRequest().size(),
          "Total number of events stored should be the same after testing "
          + "CRUD operations.");
    }
    // end::testCURD[]

    @AfterEach
    public void teardown() {
        response.close();
        client.close();
    }

}
