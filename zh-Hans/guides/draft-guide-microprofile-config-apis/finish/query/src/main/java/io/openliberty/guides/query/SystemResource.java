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
package io.openliberty.guides.query;

import java.net.URI;
import java.util.Base64;
import java.util.List;
import java.util.Properties;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.RestClientBuilder;

import io.openliberty.guides.query.client.SystemClient;
import io.openliberty.guides.query.client.UnknownUriExceptionMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@ApplicationScoped
@Path("/systems")
public class SystemResource {

    @Inject
    @ConfigProperty(name = "system.httpPort")
    private String systemHttpPort;

    @Inject
    @ConfigProperty(name = "system.userPassword")
    private String systemUserPassword;

    @Inject
    @ConfigProperty(name = "system.contextRoot")
    private String systemContextRoot;

    // tag::systemPropertiesInject[]
    @Inject
    // end::systemPropertiesInject[]
    // tag::systemPropertiesProperty[]
    @ConfigProperty(name = "system.properties")
    // end::systemPropertiesProperty[]
    // tag::listStringType[]
    private List<String> systemProperties;
    // end::listStringType[]

    @GET
    @Path("/{hostname}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    // tag::getSystemPropertiesMethod[]
    public Properties getSystemProperties(@PathParam("hostname") String hostname) {

        SystemClient systemClient = null;
        Properties p = new Properties();

        try {
            String uriString = "http://" + hostname + ":" + systemHttpPort
                               + "/" + systemContextRoot;
            URI customURI = URI.create(uriString);
            systemClient = RestClientBuilder.newBuilder()
                .baseUri(customURI)
                .register(UnknownUriExceptionMapper.class)
                .build(SystemClient.class);
        } catch (Exception e) {
            p.put("fail", "Failed to create the client " + hostname + ".");
            return p;
        }

        String authHeader = "Basic "
               + Base64.getEncoder().encodeToString(systemUserPassword.getBytes());

        try {
            // tag::systemProperties[]
            for (String property : systemProperties) {
                p.put(property, systemClient.getProperty(authHeader, property));
            }
            // end::systemProperties[]
        } catch (Exception e) {
            p.put("fail", "Failed to reach the client " + hostname + ".");
            return p;
        } finally {
            try {
                systemClient.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return p;
    }
    // end::getSystemPropertiesMethod[]

}
