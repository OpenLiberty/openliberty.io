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
package io.openliberty.guides.system;

// CDI
import jakarta.enterprise.context.RequestScoped;
import jakarta.ws.rs.GET;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;

// JAX-RS
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@RequestScoped
@Path("properties")
public class SystemResource {

  // tag::config-injection[]
  @Inject
  SystemConfig systemConfig;
  // end::config-injection[]

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getProperties() {
    if (!systemConfig.isInMaintenance()) {
      return Response.ok(System.getProperties()).build();
    } else {
      return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                     .entity("ERROR: Service is currently in maintenance. Contact: "
                         + systemConfig.getEmail().toString())
                     .build();
    }
  }

}
