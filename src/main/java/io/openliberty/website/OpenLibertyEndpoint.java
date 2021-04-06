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
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Application;

import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.data.LatestReleases;

/**
 * This is the main JAX-RS entry point for the Open Liberty website REST API.
 * The API is defined in the source repo website-api.yml.
 */
@ApplicationPath("/api")
@Path("/")
@RequestScoped
public class OpenLibertyEndpoint extends Application {

    @Inject private BuildsManager buildsManager;
    @Inject private GitHubManager githubManager;
    
    @GET
    @Path("builds")
    @Produces({ "application/json" })
    public LastUpdate status() {
        return buildsManager.getStatus();
    }

    @GET
    @Path("builds/data")
    @Produces({ "application/json" })
    public BuildData builds() {
        return buildsManager.getData();
    }

    @GET
    @Path("builds/latest")
    @Produces({ "application/json" })
    public LatestReleases latestsReleases() {
        return buildsManager.getLatestReleases();
    }

    @GET
    @Path("github/issues")
    @Produces({ "application/json" })
    public String githubIssues() {
        return githubManager.getIssues();
    }
}
