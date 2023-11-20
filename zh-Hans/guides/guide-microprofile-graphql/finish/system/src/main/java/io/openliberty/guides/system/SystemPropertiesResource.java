// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2021, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import io.openliberty.guides.graphql.models.JavaInfo;

@ApplicationScoped
@Path("/")
public class SystemPropertiesResource {

    // tag::queryProperty[]
    @GET
    @Path("properties/{property}")
    @Produces(MediaType.TEXT_PLAIN)
    public String queryProperty(@PathParam("property") String property) {
        return System.getProperty(property);
    }
    // end::queryProperty[]

    // tag::java[]
    @GET
    @Path("properties/java")
    @Produces(MediaType.APPLICATION_JSON)
    public JavaInfo java() {
        JavaInfo javaInfo = new JavaInfo();
        javaInfo.setVersion(System.getProperty("java.version"));
        javaInfo.setVendor(System.getProperty("java.vendor"));
        return javaInfo;
    }
    // end::java[]

    // tag::note[]
    @POST
    @Path("note")
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.APPLICATION_JSON)
    public Response editNote(String text) {
        System.setProperty("note", text);
        return Response.ok().build();
    }
    // end::note[]

}
