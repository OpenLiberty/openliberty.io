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

// tag::fault_tolerance[]
package io.openliberty.guides.inventory;

import java.net.UnknownHostException;
import java.util.Properties;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import io.openliberty.guides.inventory.model.InventoryList;

@RequestScoped
@Path("systems")
public class InventoryResource {

  @Inject
  InventoryManager manager;

  @GET
  @Path("{hostname}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getPropertiesForHost(@PathParam("hostname") String hostname)
      throws Exception {
    // Get properties
    try {
      Properties props = manager.get(hostname);

      // Add properties to inventory
      manager.add(hostname, props);
      return Response.ok(props).build();
    } catch (UnknownHostException e) {
      return Response.status(Response.Status.NOT_FOUND)
                     .entity("{ \"error\" : "
                             + "\"Unknown hostname " + hostname
                             + " or the resource may not be "
                             + "running on the host machine\" }")
                     .build();
    }
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public InventoryList listContents() {
    return manager.list();
  }
}
// tag::fault_tolerance[]
