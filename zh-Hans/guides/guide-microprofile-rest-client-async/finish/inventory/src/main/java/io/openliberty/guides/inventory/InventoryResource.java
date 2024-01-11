// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.inventory;

import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.logging.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.microprofile.reactive.messaging.Incoming;

import io.openliberty.guides.models.SystemLoad;


@ApplicationScoped
//tag::inventoryEndPoint[]
@Path("/inventory")
//end::inventoryEndPoint[]
public class InventoryResource {

    private static Logger logger = Logger.getLogger(InventoryResource.class.getName());

    @Inject
    private InventoryManager manager;
    
    @GET
    @Path("/systems")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> getSystems() {
        return manager.getSystems();
    }

    @GET
    @Path("/systems/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    public Properties getSystem(@PathParam("hostname") String hostname) {
        Optional<Properties> system = manager.getSystem(hostname);
        if (system.isPresent()) {
            return system.get();
        }
        return null;
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response resetSystems() {
        manager.resetSystems();
        return Response
                .status(Response.Status.OK)
                .build();
    }

    @Incoming("systemLoad")
    public void updateStatus(SystemLoad sl)  {
        String hostname = sl.hostname;
        if (manager.getSystem(hostname).isPresent()) {
            manager.updateCpuStatus(hostname, sl.loadAverage);
            logger.info("Host " + hostname + " was updated: " + sl);
        } else {
            manager.addSystem(hostname, sl.loadAverage);
            logger.info("Host " + hostname + " was added: " + sl);
        }
    }
}
