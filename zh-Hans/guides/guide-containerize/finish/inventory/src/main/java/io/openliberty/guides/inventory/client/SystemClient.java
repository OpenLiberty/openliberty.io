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
package io.openliberty.guides.inventory.client;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Invocation.Builder;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import java.util.Properties;
import java.net.URI;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@RequestScoped
public class SystemClient {

    // Constants for building URI to the system service.
    private final String SYSTEM_PROPERTIES = "/system/properties";
    private final String PROTOCOL = "http";

    @Inject
    @ConfigProperty(name = "system.http.port", defaultValue = "9080")
    String systemHttpPort;

    // Wrapper function that gets properties
    public Properties getProperties(String hostname) {
        Properties properties = null;
        Client client = ClientBuilder.newClient();
        try {
            Builder builder = getBuilder(hostname, client);
            properties = getPropertiesHelper(builder);
        } catch (Exception e) {
            System.err.println(
            "Exception thrown while getting properties: " + e.getMessage());
        } finally {
            client.close();
        }
        return properties;
    }

    // Method that creates the client builder
    private Builder getBuilder(String hostname, Client client) throws Exception {
        URI uri = new URI(
                      PROTOCOL, null, hostname, Integer.valueOf(systemHttpPort),
                      SYSTEM_PROPERTIES, null, null);
        String urlString = uri.toString();
        Builder builder = client.target(urlString).request();
        builder.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON);
        return builder;
    }

    // Helper method that processes the request
    private Properties getPropertiesHelper(Builder builder) throws Exception {
        Response response = builder.get();
        if (response.getStatus() == Status.OK.getStatusCode()) {
            return response.readEntity(Properties.class);
        } else {
            System.err.println("Response Status is not OK.");
            return null;
        }
    }
}

