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
// tag::config-methods[]
package io.openliberty.guides.inventory;

import java.util.Properties;

// CDI
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;



@RequestScoped
@Path("systems")
public class InventoryResource {

  @Inject
  InventoryManager manager;

  // tag::config-injection[]
  @Inject
  InventoryConfig inventoryConfig;
  // end::config-injection[]

  @GET
  @Path("{hostname}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getPropertiesForHost(@PathParam("hostname") String hostname) {

    if (!inventoryConfig.isInMaintenance()) {
      // tag::config-port[]
      Properties props = manager.get(hostname, inventoryConfig.getPortNumber());
      // end::config-port[]
      if (props == null) {
        return Response.status(Response.Status.NOT_FOUND)
                       .entity("{ \"error\" : \"Unknown hostname or the system service "
                       + "may not be running on " + hostname + "\" }")
                       .build();
      }

      // Add to inventory
      manager.add(hostname, props);
      return Response.ok(props).build();
    } else {
      // tag::email[]
      return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                     .entity("{ \"error\" : \"Service is currently in maintenance. "
                     + "Contact: " + inventoryConfig.getEmail().toString() + "\" }")
                     .build();
      // end::email[]
    }
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response listContents() {
    // tag::isInMaintenance[]
    if (!inventoryConfig.isInMaintenance()) {
    // end::isInMaintenance[]
      return Response.ok(manager.list()).build();
    } else {
      // tag::email[]
      return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                     .entity("{ \"error\" : \"Service is currently in maintenance. "
                     + "Contact: " + inventoryConfig.getEmail().toString() + "\" }")
                     .build();
      // end::getEmail[]
    }
  }

}

// end::config-methods[]
