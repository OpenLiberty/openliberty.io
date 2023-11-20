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
package io.openliberty.guides.rest;

import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

import jakarta.enterprise.context.RequestScoped;

//tag::class[]
@RequestScoped
@Path("properties")
public class PropertiesResource {
// end::class[]

    // tag::getProperties[]
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public JsonObject getProperties() {
        JsonObjectBuilder builder = Json.createObjectBuilder();

        System.getProperties()
              .entrySet()
              .stream()
              .forEach(entry -> builder.add((String) entry.getKey(),
                                            (String) entry.getValue()));

        return builder.build();
    }
    // end::getProperties[]

}
