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
package io.openliberty.guides.graphql.client;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.eclipse.microprofile.rest.client.annotation.RegisterProvider;

import io.openliberty.guides.graphql.models.JavaInfo;
import io.openliberty.guides.graphql.models.SystemLoadData;
import io.openliberty.guides.graphql.models.SystemMetrics;

@RegisterProvider(UnknownUriExceptionMapper.class)
public interface SystemClient extends AutoCloseable {

    @GET
    @Path("/properties/{property}")
    @Produces(MediaType.TEXT_PLAIN)
    String queryProperty(@PathParam("property") String property)
        throws UnknownUriException, ProcessingException;

    @GET
    @Path("/properties/java")
    @Produces(MediaType.APPLICATION_JSON)
    JavaInfo java()
        throws UnknownUriException, ProcessingException;

    @POST
    @Path("/note")
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.APPLICATION_JSON)
    Response editNote(String text)
        throws UnknownUriException, ProcessingException;

    @GET
    @Path("/metrics")
    @Produces(MediaType.APPLICATION_JSON)
    SystemMetrics getSystemMetrics()
        throws UnknownUriException, ProcessingException;

    @GET
    @Path("/metrics/systemLoad")
    @Produces(MediaType.APPLICATION_JSON)
    SystemLoadData getSystemLoad()
        throws UnknownUriException, ProcessingException;

}
