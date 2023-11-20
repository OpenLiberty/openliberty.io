// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.inventory;

import java.util.Properties;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.microprofile.opentracing.Traced;

import io.openliberty.guides.inventory.model.InventoryList;

@RequestScoped
@Path("/systems")
// tag::InventoryResource[]
public class InventoryResource {

    @Inject InventoryManager manager;

    @GET
    @Path("/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    // tag::getPropertiesForHost[]
    public Response getPropertiesForHost(@PathParam("hostname") String hostname) {
        Properties props = manager.get(hostname);
        if (props == null) {
            return Response.status(Response.Status.NOT_FOUND)
                           .entity("{ \"error\" : \"Unknown hostname or the system service " 
                           + "may not be running on " + hostname + "\" }")
                           .build();
        }
        manager.add(hostname, props);
        return Response.ok(props).build();
    }
    // end::getPropertiesForHost[]
    
    @GET
    // tag::Traced-false[]
    @Traced(false)
    // end::Traced-false[]
    @Produces(MediaType.APPLICATION_JSON)
    // tag::listContents[]
    public InventoryList listContents() {
        return manager.list();
    }
    // end::listContents[]
}
// end::InventoryResource[]
