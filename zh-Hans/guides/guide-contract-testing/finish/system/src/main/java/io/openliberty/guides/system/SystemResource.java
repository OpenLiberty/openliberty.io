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

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

import jakarta.enterprise.context.RequestScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.metrics.annotation.Counted;
import org.eclipse.microprofile.metrics.annotation.Timed;

@RequestScoped
@Path("/properties")
public class SystemResource {

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Timed(name = "getPropertiesTime",
    description = "Time needed to get the JVM system properties")
  @Counted(absolute = true,
    description = "Number of times the JVM system properties are requested")

  public Response getProperties() {
    return Response.ok(System.getProperties()).build();
  }

  @GET
  @Path("/key/{key}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getPropertiesByKey(@PathParam("key") String key) {
    try {
      JsonArray response = Json.createArrayBuilder()
        .add(Json.createObjectBuilder()
          .add(key, System.getProperties().get(key).toString()))
        .build();
      return Response.ok(response, MediaType.APPLICATION_JSON).build();
    } catch (java.lang.NullPointerException exception) {
        return Response.status(Response.Status.NOT_FOUND).build();
    }
  }

  @GET
  @Path("/version")
  @Produces(MediaType.APPLICATION_JSON)
  public JsonObject getVersion() {
    // tag::decimal[]
    JsonObject response = Json.createObjectBuilder()
                          .add("system.properties.version", 1.1)
                          .build();
    // end::decimal[]
    return response;
  }
}
