// tag::comment[]
/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 // end::comment[]
package it.io.openliberty.guides.rest;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import javax.json.JsonObject;
import javax.json.JsonArray;
import javax.json.Json;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;
import javax.ws.rs.client.Entity;

import org.apache.cxf.jaxrs.provider.jsrjsonp.JsrJsonpProvider;

public class EndpointTest {

    @Test
    public void testGetProperties() {
        // tag::systemProperties[]
        String port = System.getProperty("liberty.test.port");
        String war = System.getProperty("war.name");
        String url = "http://localhost:" + port + "/" + war + "/";
        // end::systemProperties[]

        // tag::clientSetup[]
        Client client = ClientBuilder.newClient();
        client.register(JsrJsonpProvider.class);
        // end::clientSetup[]

        // tag::request[]
        WebTarget target = client.target(url + "System/properties");
        Response response = target.request().get();
        // end::request[]

        // tag::response[]
        assertEquals("Incorrect response code from " + url, 200, response.getStatus());
        // end::response[]

        // tag::body[]
        JsonObject obj = response.readEntity(JsonObject.class);

        assertEquals("The system property for the local and remote JVM should match",
                     System.getProperty("os.name"),
                     obj.getString("os.name"));
        // end::body[]
        response.close();
    }
}
