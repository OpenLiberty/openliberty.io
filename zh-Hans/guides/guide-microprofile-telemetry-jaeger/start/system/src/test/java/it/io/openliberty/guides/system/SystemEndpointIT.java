// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.system;

import jakarta.json.JsonObject;

import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SystemEndpointIT {

    @Test
    public void testGetProperties() {
        String port = System.getProperty("sys.http.port");
        String url = "http://localhost:" + port + "/";

        Client client = ClientBuilder.newClient();

        WebTarget target = client.target(url + "system/properties");
        Response response = target.request().get();

        assertEquals(200, response.getStatus(),
                "Incorrect response code from " + url);

        JsonObject obj = response.readEntity(JsonObject.class);

        assertEquals(System.getProperty("os.name"), obj.getString("os.name"),
                "The system property for the local and remote JVM should match");

        response.close();
        client.close();
    }
}
