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
package io.openliberty.guides.frontend.client;

import jakarta.enterprise.context.RequestScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.HeaderParam;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

// tag::systemClient[]
@RegisterRestClient(baseUri = "https://localhost:8443/system")
@Path("/properties")
@RequestScoped
public interface SystemClient extends AutoCloseable {

    @GET
    @Path("/os")
    @Produces(MediaType.APPLICATION_JSON)
    // tag::headerParam1[]
    String getOS(@HeaderParam("Authorization") String authHeader);
    // end::headerParam1[]

    @GET
    @Path("/username")
    @Produces(MediaType.APPLICATION_JSON)
    // tag::headerParam2[]
    String getUsername(@HeaderParam("Authorization") String authHeader);
    // end::headerParam2[]

    @GET
    @Path("/jwtroles")
    @Produces(MediaType.APPLICATION_JSON)
    // tag::headerParam3[]
    String getJwtRoles(@HeaderParam("Authorization") String authHeader);
    // end::headerParam3[]
}
// end::systemClient[]
