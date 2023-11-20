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
package io.openliberty.guides.inventory;

import java.util.Properties;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import io.openliberty.guides.inventory.model.InventoryList;
import io.openliberty.guides.inventory.client.SystemClient;

// tag::ApplicationScoped[]
@ApplicationScoped
// end::ApplicationScoped[]
// tag::endpoint[]
@Path("/systems")
// end::endpoint[]
// tag::InventoryResource[]
public class InventoryResource {

  // tag::inject[]
  @Inject
  // end::inject[]
  InventoryManager manager;

  // tag::inject2[]
  @Inject
  // end::inject2[]
  SystemClient systemClient;

  @GET
  @Path("/{hostname}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getPropertiesForHost(@PathParam("hostname") String hostname) {
    // Get properties for host
    // tag::properties[]
    Properties props = systemClient.getProperties(hostname);
    // end::properties[]
    if (props == null) {
      return Response.status(Response.Status.NOT_FOUND)
                     .entity("{ \"error\" : \"Unknown hostname " + hostname
                             + " or the inventory service may not be running "
                             + "on the host machine \" }")
                     .build();
    }

    // Add to inventory
    // tag::managerAdd[]
    manager.add(hostname, props);
    // end::managerAdd[]
    return Response.ok(props).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public InventoryList listContents() {
    // tag::managerList[]
    return manager.list();
    // end::managerList[]
  }
}
// tag::InventoryResource[]
