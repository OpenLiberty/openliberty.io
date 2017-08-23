package com.ibm.openliberty;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.Date;
import java.util.Iterator;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.xml.crypto.util.Base64;

public class BuildsManager {
	
	private static BuildsManager instance = null;
	
	private Date lastSuccessfulUpdate = null;
	private Date lastUpdateAttempt = null;
	
	private JSONObject builds = new JSONObject();
	
	private Client client = null;
	
	public static synchronized BuildsManager getInstance() {
		if(instance == null) {
			instance = new BuildsManager();
		}
		return instance;
	}
	
	private BuildsManager() {
		client = ClientBuilder.newClient();
	}
	
	public JSONObject getBuilds() {
		return builds;
	}
	
	public JSONObject updateBuilds() {
		lastUpdateAttempt = new Date();
		
		JSONObject updatedBuilds = new JSONObject();
		
		JSONArray updatedRuntimeReleases = retrieveBuildData(Constants.RUNTIME_BINTRAY_ORGANIZATION, Constants.RUNTIME_BINTRAY_REPOSITORY, Constants.RUNTIME_BINTRAY_PACKAGE_RELEASES, Constants.RUNTIME_BINTRAY_USER, Constants.RUNTIME_BINTRAY_API_KEY);
		JSONArray updatedRuntimeNightlyBuilds = retrieveBuildData(Constants.RUNTIME_BINTRAY_ORGANIZATION, Constants.RUNTIME_BINTRAY_REPOSITORY, Constants.RUNTIME_BINTRAY_PACKAGE_NIGHTLY_BUILDS, Constants.RUNTIME_BINTRAY_USER, Constants.RUNTIME_BINTRAY_API_KEY);
		
		//JSONArray updatedToolsReleases = retrieveBuildData(Constants.TOOLS_BINTRAY_ORGANIZATION, Constants.TOOLS_BINTRAY_REPOSITORY, Constants.TOOLS_BINTRAY_PACKAGE_RELEASES, Constants.TOOLS_BINTRAY_USER, Constants.TOOLS_BINTRAY_API_KEY);
		//JSONArray updatedToolsNightlyBuilds = retrieveBuildData(Constants.TOOLS_BINTRAY_ORGANIZATION, Constants.TOOLS_BINTRAY_REPOSITORY, Constants.TOOLS_BINTRAY_PACKAGE_NIGHTLY_BUILDS, Constants.TOOLS_BINTRAY_USER, Constants.TOOLS_BINTRAY_API_KEY);
		
		//if(updatedRuntimeReleases != null && updatedRuntimeNightlyBuilds != null && updatedToolsReleases != null && updatedToolsNightlyBuilds != null) {
		if(updatedRuntimeReleases != null && updatedRuntimeNightlyBuilds != null) {

			updatedBuilds.put(Constants.RUNTIME_RELEASES, updatedRuntimeReleases);
			updatedBuilds.put(Constants.RUNTIME_NIGHTLY_BUILDS, updatedRuntimeNightlyBuilds);
			
			//updatedBuilds.put(Constants.TOOLS_RELEASES, updatedRuntimeReleases);
			//updatedBuilds.put(Constants.TOOLS_NIGHTLY_BUILDS, updatedRuntimeNightlyBuilds);
			
			lastSuccessfulUpdate = lastUpdateAttempt;
			builds = updatedBuilds;
		}
		
    	return getStatus();
	}
	
	
	public JSONObject getStatus() {
		JSONObject jsonObject = new JSONObject();
  		jsonObject.put(Constants.LAST_UPDATE_ATTEMPT, lastUpdateAttempt != null? lastUpdateAttempt.toString() : Constants.NEVER_ATTEMPTED);
  		jsonObject.put(Constants.LAST_SUCCESSFULL_UPDATE, lastSuccessfulUpdate != null? lastSuccessfulUpdate.toString() : Constants.NEVER_UPDATED);
  		return jsonObject;
	}
	
	
	private JSONArray retrieveBuildData(String organization, String repository, String bintrayPackage, String user, String apiKey) {
		String builds = MessageFormat.format(Constants.BINTRAY_VERSIONS_URL, organization, repository, bintrayPackage);
		JSONObject versionsJSONObject = retrieveData(builds, user, apiKey);
		if(versionsJSONObject != null) {
			JSONArray jsonArray = new JSONArray();
			Object versionsJSONArray = versionsJSONObject.get(Constants.BINTRAY_VERSIONS);
			if(versionsJSONArray instanceof JSONArray) {
				JSONArray buildsArray = (JSONArray) versionsJSONArray;
				Iterator<?> iterator = buildsArray.iterator();
				while(iterator.hasNext()) {
					Object object = iterator.next();
					if(object instanceof String) {
						String version = (String)object;
						String url = MessageFormat.format(Constants.BINTRAY_FILE_URL, organization, repository, bintrayPackage, version, Constants.INFORMATION_JSON_FILE);
						JSONObject versionData = retrieveData(url, user, apiKey);
						versionData.put(Constants.DATE_TIME, version);
						
						Object buildLogObject = versionData.get(Constants.BUILD_LOG);
						if(buildLogObject instanceof String) {
							String buildLog = (String)buildLogObject;
							String newBuildLog = MessageFormat.format(Constants.BINTRAY_FILE_URL, organization, repository, bintrayPackage, version, buildLog);
							versionData.put(Constants.BUILD_LOG, newBuildLog);
						}
						
						Object testLogObject = versionData.get(Constants.TESTS_LOG);
						if(testLogObject instanceof String) {
							String testsLog = (String)testLogObject;
							String newTestsLog = MessageFormat.format(Constants.BINTRAY_FILE_URL, organization, repository, bintrayPackage, version, testsLog);
							versionData.put(Constants.TESTS_LOG, newTestsLog);
						}
						
						Object driverLocationObject = versionData.get(Constants.DRIVER_LOCATION);
						if(driverLocationObject != null) {
							String driverLocation = (String)driverLocationObject;
							String newDrvierLocation = MessageFormat.format(Constants.BINTRAY_FILE_URL, organization, repository, bintrayPackage, version, driverLocation);
							versionData.put(Constants.DRIVER_LOCATION, newDrvierLocation);
						}

						jsonArray.add(versionData);
					}
				}
			} else {
				return null;
			}
			return jsonArray;
		}
		return null;
	}

	
	private JSONObject retrieveData(String url, String user, String password) {
		
		WebTarget target = client.target(url);
    	Builder builder = target.request("application/json");
    	//builder.header("Authorization", "Basic " +  java.util.Base64.getEncoder().encodeToString((user + ':' + password).getBytes()));
    	builder.header("Authorization", "Basic " +  Base64.encode((user + ':' + password).getBytes()));
    	Response response = builder.get();
    	if(response.getStatus() == 200) {
    		String entity = response.readEntity(String.class);
    		if(entity != null) {
    			try {
    				return JSONObject.parse(entity);
    			} catch (IOException exception) {}
    		}
    	}   	
		return null;
	}

}
