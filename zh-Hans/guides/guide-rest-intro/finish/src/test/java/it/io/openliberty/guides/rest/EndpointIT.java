// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Properties;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.Test;

public class EndpointIT {
    private static final Jsonb JSONB = JsonbBuilder.create();
    // tag::test[]
    @Test
    // end::test[]
    public void testGetProperties() {
        // tag::systemProperties[]
        String port = System.getProperty("http.port");
        String context = System.getProperty("context.root");
        // end::systemProperties[]
        String url = "http://localhost:" + port + "/" + context + "/";

        // tag::clientSetup[]
        Client client = ClientBuilder.newClient();
        // end::clientSetup[]

        // tag::target[]
        WebTarget target = client.target(url + "system/properties");
        // end::target[]
        // tag::requestget[]
        Response response = target.request().get();
        // end::requestget[]

        // tag::assertequals[]
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus(),
                     "Incorrect response code from " + url);
        // end::assertequals[]

        // tag::body[]
        String json = response.readEntity(String.class);
        Properties sysProps = JSONB.fromJson(json, Properties.class);

        // tag::assertosname[]
        assertEquals(System.getProperty("os.name"), sysProps.getProperty("os.name"),
                     "The system property for the local and remote JVM should match");
        // end::assertosname[]
        // end::body[]
        response.close();
        client.close();
    }
}
