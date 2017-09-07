package com.ibm.openliberty;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.core.Application;

@ApplicationPath("api")
@Path("/builds")
public class OpenLibertyEndpoint extends Application {

    @GET
    public String status() {
    	BuildsManager buildsManager = BuildsManager.getInstance();
    	return buildsManager.getStatus().toString();
    }
    
    @GET
    @Path("data")
    public String builds() {
    	BuildsManager buildsManager = BuildsManager.getInstance();
    	return buildsManager.getBuilds().toString().replaceAll("\\\\", "");
    }
    
    @PUT
    public String update() {
    	BuildsManager buildsManager = BuildsManager.getInstance();    	
    	return buildsManager.updateBuilds().toString();
    }

    @GET
    @Path("/github/issues")
    public String githubIssues() {
    	return GitHubManager.getInstance().getIssues();
    }

}