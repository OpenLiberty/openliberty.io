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
package it.io.openliberty.guides.inventory;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;


@ApplicationScoped
@Path("/systems")
public interface SystemResourceClient {

    // tag::listContents[]
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    List<SystemData> listContents();
    // end::listContents[]

    // tag::getSystem[]
    @GET
    @Path("/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    SystemData getSystem(
        @PathParam("hostname") String hostname);
    // end::getSystem[]

    // tag::addSystem[]
    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    Response addSystem(
        @QueryParam("hostname") String hostname,
        @QueryParam("osName") String osName,
        @QueryParam("javaVersion") String javaVersion,
        @QueryParam("heapSize") Long heapSize);
    // end::addSystem[]

    // tag::updateSystem[]
    @PUT
    @Path("/{hostname}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    Response updateSystem(
        @PathParam("hostname") String hostname,
        @QueryParam("osName") String osName,
        @QueryParam("javaVersion") String javaVersion,
        @QueryParam("heapSize") Long heapSize);
    // end::updateSystem[]

    // tag::removeSystem[]
    @DELETE
    @Path("/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    Response removeSystem(
        @PathParam("hostname") String hostname);
    // end::removeSystem[]
}

