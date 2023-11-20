// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.gateway.client;

import java.util.Properties;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import io.openliberty.guides.models.InventoryList;

@RegisterRestClient(baseUri = "http://inventory-service:9080")
@Path("/inventory")
public interface InventoryClient {

    @GET
    @Path("systems")
    @Produces(MediaType.APPLICATION_JSON)
    public InventoryList getInventory();

    @GET
    @Path("systems/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    public Properties getProperties(@PathParam("hostname") String hostname);

}
