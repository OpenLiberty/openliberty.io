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
package io.openliberty.guides.inventory;

import java.util.Properties;

import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.context.Scope;

import io.openliberty.guides.inventory.model.InventoryList;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@RequestScoped
@Path("/systems")
public class InventoryResource {

    // tag::manager[]
    @Inject
    private InventoryManager manager;
    // end::manager[]

    // tag::inject[]
    @Inject
    private Tracer tracer;
    // end::inject[]

    @GET
    @Path("/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPropertiesForHost(@PathParam("hostname") String hostname) {
        // tag::getPropertiesSpan[]
        Span getPropertiesSpan = tracer.spanBuilder("GettingProperties").startSpan();
        // end::getPropertiesSpan[]
        // tag::try[]
        Properties props = null;
        // tag::scope[]
        try (Scope scope = getPropertiesSpan.makeCurrent()) {
        // end::scope[]
            // tag::getSystem[]
            props = manager.get(hostname);
            // end::getSystem[]
            if (props == null) {
                // tag::addEvent1[]
                getPropertiesSpan.addEvent("Cannot get properties");
                // end::addEvent1[]
                return Response.status(Response.Status.NOT_FOUND)
                         .entity("{ \"error\" : \"Unknown hostname or the system "
                               + "service may not be running on " + hostname + "\" }")
                         .build();
            }
            // tag::addEvent2[]
            getPropertiesSpan.addEvent("Received properties");
            // end::addEvent2[]
            manager.add(hostname, props);
        } finally {
            // tag::end[]
            getPropertiesSpan.end();
            // end::end[]
        }
        // end::try[]
        return Response.ok(props).build();

    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public InventoryList listContents() {
        return manager.list();
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response clearContents() {
        int cleared = manager.clear();

        if (cleared == 0) {
            return Response.status(Response.Status.NOT_MODIFIED)
                           .build();
        }
        return Response.status(Response.Status.OK)
                       .build();
    }
}

