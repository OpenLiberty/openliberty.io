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
package io.openliberty.guides.query;

import io.openliberty.guides.graphql.models.NoteInfo;
import io.openliberty.guides.graphql.models.SystemInfo;
import io.openliberty.guides.graphql.models.SystemLoad;
import io.openliberty.guides.query.client.GraphQlClient;
import io.smallrye.graphql.client.typesafe.api.TypesafeGraphQLClientBuilder;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("query")
public class QueryResource {

    // tag::clientBuilder[]
    private GraphQlClient gc = TypesafeGraphQLClientBuilder.newBuilder()
                                                   .build(GraphQlClient.class);
    // end::clientBuilder[]

    @GET
    @Path("system/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    public SystemInfo querySystem(@PathParam("hostname") String hostname) {
        // tag::clientUsed1[]
        return gc.system(hostname);
        // end::clientUsed1[]
    }

    @GET
    @Path("systemLoad/{hostnames}")
    @Produces(MediaType.APPLICATION_JSON)
    public SystemLoad[] querySystemLoad(@PathParam("hostnames") String hostnames) {
        String[] hostnameArray = hostnames.split(",");
        // tag::clientUsed2[]
        return gc.getSystemLoad(hostnameArray);
        // end::clientUsed2[]
    }

    @POST
    @Path("mutation/system/note")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response editNote(NoteInfo text) {
        // tag::clientUsed3[]
        if (gc.editNote(text.getHostname(), text.getText())) {
        // end::clientUsed3[]
            return Response.ok().build();
        } else {
            return Response.serverError().build();
        }
    }
}
