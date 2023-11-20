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
package it.io.openliberty.guides.system;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Base64;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;

public class SystemEndpointIT {

    private static String clusterUrl;
    private static String authHeader;

    @BeforeAll
    public static void setup() {
        String systemRootPath = System.getProperty("system.service", "localhost:9080");
        String contextRoot = System.getProperty("system.context", "system");
        clusterUrl = "http://" + systemRootPath + "/" + contextRoot + "/property/";

        String userPassword = System.getProperty("system.user", "admin") + ":"
                              + System.getProperty("system.pwd", "adminpwd");
        authHeader = "Basic "
            + Base64.getEncoder().encodeToString(userPassword .getBytes());
    }

    @Test
    public void testGetProperty() {
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target(clusterUrl + "os.name");
        Response response = target
            .request()
            .header("Authorization", authHeader)
            .get();
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + clusterUrl  + "os.name");
        response.close();
        client.close();
    }

}
