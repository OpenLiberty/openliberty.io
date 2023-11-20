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
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.Response;

import io.openliberty.guides.event.models.Event;

public abstract class EventIT {

    private WebTarget webTarget;

    protected Form form;
    protected Client client;
    protected Response response;
    protected HashMap<String, String> eventForm;

    protected static String baseUrl;
    protected static String port;
    protected static final String EVENTS = "events";

    /**
     *  Makes a POST request to the /events endpoint
     */
    protected int postRequest(HashMap<String, String> formDataMap) {
        formDataMap.forEach((formField, data) -> {
            form.param(formField, data);
        });
        webTarget = client.target(baseUrl + EVENTS);
        response = webTarget.request().post(Entity.form(form));
        form = new Form();
        return response.getStatus();
    }

    /**
     *  Makes a PUT request to the /events/{eventId} endpoint
     */
    protected int updateRequest(HashMap<String, String> formDataMap, int eventId) {
        formDataMap.forEach((formField, data) -> {
            form.param(formField, data);
        });
        webTarget = client.target(baseUrl + EVENTS + "/" + eventId);
        response = webTarget.request().put(Entity.form(form));
        form = new Form();
        return response.getStatus();
    }

    /**
     *  Makes a DELETE request to /events/{eventId} endpoint and return the response
     *  code
     */
    protected int deleteRequest(int eventId) {
        webTarget = client.target(baseUrl + EVENTS + "/" + eventId);
        response = webTarget.request().delete();
        return response.getStatus();
    }

    /**
     *  Makes a GET request to the /events endpoint and returns result in a JsonArray
     */
    protected JsonArray getRequest() {
        webTarget = client.target(baseUrl + EVENTS);
        response = webTarget.request().get();
        return response.readEntity(JsonArray.class);
    }

    /**
     *  Makes a GET request to the /events/{eventId} endpoint and returns a JsonObject
     */
    protected JsonObject getIndividualEvent(int eventId) {
        webTarget = client.target(baseUrl + EVENTS + "/" + eventId);
        response = webTarget.request().get();
        return response.readEntity(JsonObject.class);
    }

    /**
     *  Makes a GET request to the /events endpoint and returns the event provided
     *  if it exists.
     */
    protected JsonObject findEvent(Event e) {
        JsonArray events = getRequest();
        for (int i = 0; i < events.size(); i++) {
            JsonObject testEvent = events.getJsonObject(i);
            Event test = new Event(testEvent.getString("name"),
                    testEvent.getString("location"), testEvent.getString("time"));
            if (test.equals(e)) {
                return testEvent;
            }
        }
        return null;
    }

    /**
     *  Asserts event fields (name, location, time) equal the provided name, location
     *  and date
     */
    protected void assertData(JsonObject event, String name, String loc, String date) {
        assertEquals(event.getString("name"), name);
        assertEquals(event.getString("location"), loc);
        assertEquals(event.getString("time"), date);
    }

}
