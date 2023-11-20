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
package io.openliberty.guides.microprofile;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;

@ApplicationScoped
@Path("hosts")
// tag::InventoryResource[]
public class InventoryResource {

    @Inject
    InventoryManager manager;

    // tag::Context[]
    @Context
    // end::Context[]
    // tag::UriInfo[]
    UriInfo uriInfo;
    // end::UriInfo[]

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    // tag::handler[]
    public JsonObject handler() {
        return manager.getSystems(uriInfo.getAbsolutePath().toString());
    }
    // end::handler[]

    @GET
    @Path("{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    // tag::PropertiesForHost[]
    public JsonObject getPropertiesForHost(@PathParam("hostname") String hostname) {
        return (hostname.equals("*")) ? manager.list() : manager.get(hostname);
    }
    // end::PropertiesForHost[]
}
// end::InventoryResource[]
