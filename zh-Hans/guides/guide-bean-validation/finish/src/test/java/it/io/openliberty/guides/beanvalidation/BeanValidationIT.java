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
package it.io.openliberty.guides.beanvalidation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.openliberty.guides.beanvalidation.Astronaut;
import io.openliberty.guides.beanvalidation.Spacecraft;

import java.util.HashMap;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class BeanValidationIT {

    private Client client;
    private static String port;

    // tag::BeforeEach[]
    @BeforeEach
    // end::BeforeEach[]
    // tag::setup[]
    public void setup() {
        // tag::Client[]
        client = ClientBuilder.newClient();
        // end::Client[]
        port = System.getProperty("http.port");
    }
    // end::setup[]

    @AfterEach
    public void teardown() {
        client.close();
    }

    @Test
    // tag::testNoFieldLevelConstraintViolations[]
    public void testNoFieldLevelConstraintViolations() throws Exception {
        // tag::Astronaut[]
        Astronaut astronaut = new Astronaut();
        astronaut.setAge(25);
        astronaut.setEmailAddress("libby@openliberty.io");
        astronaut.setName("Libby");
        // end::Astronaut[]
        // tag::Spacecraft[]
        Spacecraft spacecraft = new Spacecraft();
        spacecraft.setAstronaut(astronaut);
        spacecraft.setSerialNumber("Liberty1001");
        // end::Spacecraft[]
        HashMap<String, Integer> destinations = new HashMap<String, Integer>();
        destinations.put("Mars", 1500);
        destinations.put("Pluto", 10000);
        spacecraft.setDestinations(destinations);

        Jsonb jsonb = JsonbBuilder.create();
        String spacecraftJSON = jsonb.toJson(spacecraft);
        Response response = postResponse(getURL(port, "validatespacecraft"),
                spacecraftJSON, false);
        String actualResponse = response.readEntity(String.class);
        String expectedResponse = "No Constraint Violations";

        assertEquals(expectedResponse, actualResponse,
                "Unexpected response when validating beans.");
    }
    // end::testNoFieldLevelConstraintViolations[]

    @Test
    // tag::testFieldLevelConstraintViolation[]
    public void testFieldLevelConstraintViolation() throws Exception {
        Astronaut astronaut = new Astronaut();
        astronaut.setAge(25);
        astronaut.setEmailAddress("libby");
        astronaut.setName("Libby");

        Spacecraft spacecraft = new Spacecraft();
        spacecraft.setAstronaut(astronaut);
        spacecraft.setSerialNumber("Liberty123");

        HashMap<String, Integer> destinations = new HashMap<String, Integer>();
        destinations.put("Mars", -100);
        spacecraft.setDestinations(destinations);

        Jsonb jsonb = JsonbBuilder.create();
        String spacecraftJSON = jsonb.toJson(spacecraft);
        // tag::Response[]
        Response response = postResponse(getURL(port, "validatespacecraft"),
                spacecraftJSON, false);
        // end::Response[]
        String actualResponse = response.readEntity(String.class);
        // tag::expectedDestinationResponse[]
        String expectedDestinationResponse = "must be greater than 0";
        // end::expectedDestinationResponse[]
        assertTrue(actualResponse.contains(expectedDestinationResponse),
                "Expected response to contain: " + expectedDestinationResponse);
        // tag::expectedEmailResponse[]
        String expectedEmailResponse = "must be a well-formed email address";
        // end::expectedEmailResponse[]
        assertTrue(actualResponse.contains(expectedEmailResponse),
                "Expected response to contain: " + expectedEmailResponse);
        // tag::expectedSerialNumberResponse[]
        String expectedSerialNumberResponse = "serial number is not valid";
        // end::expectedSerialNumberResponse[]
        assertTrue(actualResponse.contains(expectedSerialNumberResponse),
                "Expected response to contain: " + expectedSerialNumberResponse);
    }
    // end::testFieldLevelConstraintViolation[]

    @Test
    // tag::testNoMethodLevelConstraintViolations[]
    public void testNoMethodLevelConstraintViolations() throws Exception {
        // tag::OpenLiberty[]
        String launchCode = "OpenLiberty";
        // end::OpenLiberty[]
        // tag::launchSpacecraft[]
        Response response = postResponse(getURL(port, "launchspacecraft"),
                launchCode, true);
        // end::launchSpacecraft[]

        String actualResponse = response.readEntity(String.class);
        String expectedResponse = "launched";

        assertEquals(expectedResponse, actualResponse,
                "Unexpected response from call to launchSpacecraft");

    }
    // end::testNoMethodLevelConstraintViolations[]

    // tag::testMethodLevelConstraintViolation[]
    @Test
    public void testMethodLevelConstraintViolation() throws Exception {
        // tag::incorrectCode[]
        String launchCode = "incorrectCode";
        // end::incorrectCode[]
        Response response = postResponse(getURL(port, "launchspacecraft"),
                launchCode, true);

        String actualResponse = response.readEntity(String.class);
        assertTrue(
                // tag::actualResponse[]
                actualResponse.contains("must be true"),
                // end::actualResponse[]
                "Unexpected response from call to launchSpacecraft");
    }
    // end::testMethodLevelConstraintViolation[]

    private Response postResponse(String url, String value,
                                  boolean isMethodLevel) {
        if (isMethodLevel) {
                return client.target(url).request().post(Entity.text(value));
        } else {
                return client.target(url).request().post(Entity.entity(value,
                MediaType.APPLICATION_JSON));
        }
    }

    private String getURL(String port, String function) {
        return "http://localhost:" + port + "/Spacecraft/beanvalidation/"
                + function;
    }
}
