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
import javax.ws.rs.core.Response;

import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.data.LatestReleases;

import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;

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

    public String getJsonData(String jsonUrl) throws Exception{
        URL url = new URL(jsonUrl);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");

        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        con.disconnect();
		return parseJsonObject(new JSONObject(response.toString()));
    }

    private String parseJsonObject(JSONObject jsonObject) {
        JSONObject response = jsonObject.getJSONObject("response");
        JSONArray docs = response.getJSONArray("docs");
        JSONObject doc=docs.getJSONObject(0);
        String pluginVersion = doc.getString("v");
        return pluginVersion;
    }
    
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

    String mavenUrl="https://search.maven.org/solrsearch/select?q=g:io.openliberty.tools+AND+a:liberty-maven-plugin&core=gav&rows=20&wt=json";
    String gradleUrl="https://search.maven.org/solrsearch/select?q=g:io.openliberty.tools+AND+a:liberty-gradle-plugin&core=gav&rows=20&wt=json";
    @GET
    @Produces({ "application/json" })
    @Path("start/plugin-versions")
    public Response getVersionFromJson() {
        try {
            String mavenVersion=getJsonData(mavenUrl);
            String gradleVersion=getJsonData(gradleUrl);
			return Response.ok(new JSONObject()
                               .put("mavenVersion", mavenVersion)
                               .put("gradleVersion", gradleVersion)
                               .toString())
                          .build();     
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity(new JSONObject()
                                .put("status", "error")
                                .put("message", "Failed to fetch plugin versions")
                                .toString())
                        .build();
        }
    }
}
