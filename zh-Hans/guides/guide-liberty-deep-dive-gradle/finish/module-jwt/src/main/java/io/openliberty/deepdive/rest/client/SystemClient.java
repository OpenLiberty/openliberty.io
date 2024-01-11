// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.deepdive.rest.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api")
public interface SystemClient extends AutoCloseable {

    @GET
    @Path("/property/{property}")
    @Produces(MediaType.TEXT_PLAIN)
    String getProperty(@HeaderParam("Authorization") String authHeader,
                       @PathParam("property") String property);

    @GET
    @Path("/heapsize")
    @Produces(MediaType.TEXT_PLAIN)
    Long getHeapSize(@HeaderParam("Authorization") String authHeader);

}
