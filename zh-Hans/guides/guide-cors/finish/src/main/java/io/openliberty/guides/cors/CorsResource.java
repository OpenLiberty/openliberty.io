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
package io.openliberty.guides.cors;

import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("/configurations")
public class CorsResource {

    @GET
    @Path("/simple")
    @Produces(MediaType.TEXT_PLAIN)
    public Response getSimple() {
        return getResponse();
    }

    @DELETE
    @Path("/preflight")
    @Produces(MediaType.TEXT_PLAIN)
    public Response getPreflight(@Context HttpHeaders headers) {
        return getResponse();
    }

    private Response getResponse() {
        return Response.status(Status.OK).entity("Successfully responded").build();
    }

}
