/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.json.JsonObject;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Application;

@ApplicationPath("api")
@Path("/")
@RequestScoped
public class OpenLibertyEndpoint extends Application {

    @Inject private BuildsManager buildsManager;
    @Inject private GitHubManager githubManager;
    
    @GET
    @Path("builds")
    @Produces({ "application/json" })
    public JsonObject status() {
        return buildsManager.getStatus().asJsonObject();
    }

    @GET
    @Path("builds/data")
    @Produces({ "application/json" })
    public JsonObject builds() {
        return buildsManager.getData().asJsonObject();
    }

    @GET
    @Path("builds/latest")
    @Produces({ "application/json" })
    public JsonObject latestsReleases() {
        return buildsManager.getLatestReleases().asJsonObject();
    }

    @PUT
    @Path("builds")
    @Produces({ "application/json" })
    public JsonObject update() {
        return buildsManager.updateBuilds().asJsonObject();
    }

    @GET
    @Path("github/issues")
    @Produces({ "application/json" })
    public String githubIssues() {
        return githubManager.getIssues();
    }

}
