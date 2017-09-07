package com.ibm.openliberty;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.core.Application;

@ApplicationPath("api")
@Path("/")
public class OpenLibertyEndpoint extends Application {

    @GET
    @Path("builds")
    public String status() {
    	BuildsManager buildsManager = BuildsManager.getInstance();
    	return buildsManager.getStatus().toString();
    }
    
    @GET
    @Path("builds/data")
    public String builds() {
    	BuildsManager buildsManager = BuildsManager.getInstance();
    	return buildsManager.getBuilds().toString().replaceAll("\\\\", "");
    }
    
    @PUT
    @Path("builds")
    public String update() {
    	BuildsManager buildsManager = BuildsManager.getInstance();    	
    	return buildsManager.updateBuilds().toString();
    }

    @GET
    @Path("github/issues")
    public String githubIssues() {
    	return GitHubManager.getInstance().getIssues();
    }

}