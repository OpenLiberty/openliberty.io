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
import jakarta.json.JsonObject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

// tag::header[]
// tag::cdi-scope[]
@ApplicationScoped
// end::cdi-scope[]
@Path("hosts")
public class InventoryResource {
// end::header[]

    // tag::injection[]
    @Inject
    InventoryManager manager;
    // end::injection[]

    // tag::getPropertiesForHost[]
    @GET
    @Path("{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    public JsonObject getPropertiesForHost(@PathParam("hostname") String hostname) {
        // tag::method-contents[]
        return manager.get(hostname);
        // end::method-contents[]
    }
    // end::getPropertiesForHost[]

    // tag::listContents[]
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public JsonObject listContents() {
        // tag::method-contents[]
        return manager.list();
        // end::method-contents[]
    }
    // end::listContents[]

}
