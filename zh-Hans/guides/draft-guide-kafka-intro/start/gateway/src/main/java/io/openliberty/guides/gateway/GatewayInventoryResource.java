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
package io.openliberty.guides.gateway;

import java.util.Properties;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.rest.client.inject.RestClient;

import io.openliberty.guides.gateway.client.InventoryClient;
import io.openliberty.guides.models.InventoryList;
import io.openliberty.guides.models.SystemData;

@RequestScoped
@Path("/systems")
public class GatewayInventoryResource {

    @Inject
    @RestClient
    private InventoryClient inventoryClient;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public InventoryList getSystems() {
        return inventoryClient.getInventory();
    }

    @GET
    @Path("{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    public SystemData getSystem(@PathParam("hostname") String hostname) {
        Properties properties = inventoryClient.getProperties(hostname);
        return new SystemData(hostname, properties);
    }

}
