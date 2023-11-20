// tag::comment[]
/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::comment[]
package io.openliberty.guides.mpconfig.rest;

import javax.json.JsonObject;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import io.openliberty.guides.mpconfig.InventoryConfig;

@Path("carTypes")
public class Producer {

    @Inject
    InventoryConfig config;

    @Context
    UriInfo uriInfo;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public JsonObject getCarTypes() {
        int port = config.getPort();
        
        String appContextRoot = "/carTypes";
        String restPath = "/carTypes";
        String url = "http://" + uriInfo.getBaseUri().getHost() + ":" + port + appContextRoot + restPath;

        JsonObject carTypes = Consumer.retrieveCarTypes(url);

        return carTypes;
    }
}