// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.query;

import java.util.List;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import io.openliberty.guides.graphql.models.SystemInfo;
import io.openliberty.guides.graphql.models.SystemLoad;
import io.openliberty.guides.graphql.models.NoteInfo;

@ApplicationScoped
@Path("query")
public interface QueryResourceClient {

    // tag::querySystem[]
    @GET
    @Path("system/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    SystemInfo querySystem(@PathParam("hostname") String hostname);
    // end::querySystem[]

    // tag::querySystemLoad[]
    @GET
    @Path("systemLoad/{hostnames}")
    @Produces(MediaType.APPLICATION_JSON)
    List<SystemLoad> querySystemLoad(@PathParam("hostnames") String hostnames);
    // end::querySystemLoad[]

    // tag::editNote[]
    @POST
    @Path("mutation/system/note")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response editNote(NoteInfo text);
    // end::editNote[]
}
