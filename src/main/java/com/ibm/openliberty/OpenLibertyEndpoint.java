package com.ibm.openliberty;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Application;

import com.ibm.json.java.JSONObject;

@ApplicationPath("api")
@Path("/")
public class OpenLibertyEndpoint extends Application {

    @GET
    @Path("builds")
    @Produces({"application/json"})
    public String status() {
    	BuildsManager buildsManager = BuildsManager.getInstance();
    	return buildsManager.getStatus().toString();
    }
    
    @GET
    @Path("builds/data")
    @Produces({"application/json"})
    public String builds() {
    	BuildsManager buildsManager = BuildsManager.getInstance();
    	JSONObject data = new JSONObject();
    	data.put(Constants.LATEST_RELEASES, buildsManager.getLatestReleases());
    	data.put(Constants.BUILDS, buildsManager.getBuilds());
    	return data.toString().replaceAll("\\\\", "");
    }
    
    @GET
    @Path("builds/latest")
    @Produces({"application/json"})
    public String latestsReleases() {
    	BuildsManager buildsManager = BuildsManager.getInstance();
    	return buildsManager.getLatestReleases().toString().replaceAll("\\\\", "");
    }
    
    @PUT
    @Path("builds")
    @Produces({"application/json"})
    public String update() {
    	BuildsManager buildsManager = BuildsManager.getInstance();    	
    	return buildsManager.updateBuilds().toString();
    }

    @GET
    @Path("github/issues")
    @Produces({"application/json"})
    public String githubIssues() {
    	return GitHubManager.getInstance().getIssues();
    }

}
