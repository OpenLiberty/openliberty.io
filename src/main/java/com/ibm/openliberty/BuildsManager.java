package com.ibm.openliberty;

import java.io.IOException;
import java.util.Date;
import java.util.Iterator;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class BuildsManager {
	
	private static BuildsManager instance = null;
	
	private Date lastSuccessfulUpdate = null;
	private Date lastUpdateAttempt = null;
	
	private JSONObject builds = new JSONObject();
	private JSONObject latestReleases = new JSONObject();
	
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
		if(lastSuccessfulUpdate == null) {
			updateBuilds();
		}
		return builds;
	}
	
	
	public JSONObject getLatestReleases() {
		if(lastSuccessfulUpdate == null) {
			updateBuilds();
		}
		return latestReleases;
	}
	
	
	public JSONObject getStatus() {
		JSONObject jsonObject = new JSONObject();
  		jsonObject.put(Constants.LAST_UPDATE_ATTEMPT, lastUpdateAttempt != null? lastUpdateAttempt.toString() : Constants.NEVER_ATTEMPTED);
  		jsonObject.put(Constants.LAST_SUCCESSFULL_UPDATE, lastSuccessfulUpdate != null? lastSuccessfulUpdate.toString() : Constants.NEVER_UPDATED);
  		return jsonObject;
	}
	
	
	public synchronized JSONObject updateBuilds() {
		lastUpdateAttempt = new Date();
		JSONObject updatedBuilds = new JSONObject();
		JSONArray updatedRuntimeReleases = retrieveBuildData(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT);
		JSONArray updatedRuntimeNightlyBuilds = retrieveBuildData(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT);
		JSONArray updatedToolsReleases = retrieveBuildData(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT);
		JSONArray updatedToolsNightlyBuilds = retrieveBuildData(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT);
		if(updatedRuntimeReleases != null && updatedRuntimeNightlyBuilds != null && updatedToolsReleases != null && updatedToolsNightlyBuilds != null) {
			JSONObject latestRuntimeRelease = getLatestBuild(updatedRuntimeReleases);
			JSONObject latestToolsRelease = getLatestBuild(updatedToolsReleases);
			if(latestRuntimeRelease != null &&  latestToolsRelease != null) {
				latestReleases.put(Constants.RUNTIME, latestRuntimeRelease);
				latestReleases.put(Constants.TOOLS, latestToolsRelease);
				updatedBuilds.put(Constants.RUNTIME_RELEASES, updatedRuntimeReleases);
				updatedBuilds.put(Constants.RUNTIME_NIGHTLY_BUILDS, updatedRuntimeNightlyBuilds);
				updatedBuilds.put(Constants.TOOLS_RELEASES, updatedToolsReleases);
				updatedBuilds.put(Constants.TOOLS_NIGHTLY_BUILDS, updatedToolsNightlyBuilds);
				lastSuccessfulUpdate = lastUpdateAttempt;
				builds = updatedBuilds;
			}
		}
		return getStatus();
	}

	
	private JSONObject getLatestBuild(JSONArray buildsArray) {	
		JSONObject latest = null;
		Iterator<?> iterator = buildsArray.iterator();
		while(iterator.hasNext()) {
			Object releaseObject = iterator.next();
			if(releaseObject instanceof JSONObject) {
				JSONObject releaseJSONObject = (JSONObject) releaseObject;
				Object dateObject = releaseJSONObject.get(Constants.DATE);
				if(dateObject instanceof String) {
					String dateString = (String) dateObject;
					if(latest == null || dateString.compareTo((String) latest.get(Constants.DATE)) > 0) {
						latest = releaseJSONObject;
					}
				}
			}
		}		
		return latest;
	}
	
	
	private JSONArray retrieveBuildData(String artifactPath, String buildTypePath) {
		JSONObject versions = retrieveJSON(Constants.DHE_URL + artifactPath + buildTypePath + Constants.DHE_INFO_JSON_FILE_NAME);
		if(versions != null) {
			JSONArray jsonArray = new JSONArray();
			Object versionsObject = versions.get(Constants.VERSIONS);
			if(versionsObject instanceof JSONArray) {
				JSONArray versionsJSONArray = (JSONArray) versionsObject;
				Iterator<?> iterator = versionsJSONArray.iterator();
				while(iterator.hasNext()) {
					Object versionObject = iterator.next();
					if(versionObject instanceof String) {
						String version = (String) versionObject;	
						String versionPath = version + '/';
						String informationFileURL = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + Constants.DHE_INFO_JSON_FILE_NAME;
						JSONObject buildInformation = retrieveJSON(informationFileURL);
						if(buildInformation != null) {
							buildInformation.put(Constants.DATE, version);
							
							Object buildLogObject = buildInformation.get(Constants.BUILD_LOG);
							if(buildLogObject instanceof String) {
								String buildLog = (String)buildLogObject;
								String newBuildLog = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + buildLog;
								buildInformation.put(Constants.BUILD_LOG, newBuildLog);
							}
							
							Object testLogObject = buildInformation.get(Constants.TESTS_LOG);
							if(testLogObject instanceof String) {
								String testsLog = (String)testLogObject;
								String newTestsLog = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + testsLog;
								buildInformation.put(Constants.TESTS_LOG, newTestsLog);
							}
							
							Object driverLocationObject = buildInformation.get(Constants.DRIVER_LOCATION);
							if(driverLocationObject != null) {
								String driverLocation = (String)driverLocationObject;
								String newDrvierLocation = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + driverLocation;
								buildInformation.put(Constants.DRIVER_LOCATION, newDrvierLocation);
								
								String size = retrieveSize(newDrvierLocation);
								if(size != null) {
									buildInformation.put(Constants.SIZE_IN_BYTES, size);
								}
							}
							
							jsonArray.add(buildInformation);
						}
					}
				}
			}
			return jsonArray;
		}
		return null;
	}
	
	
	private JSONObject retrieveJSON(String url) {	
		WebTarget target = client.target(url);
    	Builder builder = target.request("application/json");
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
	
	
	private String retrieveSize(String url) {
		WebTarget target = client.target(url);
    	Builder builder = target.request();
    	Response response = builder.head();
    	if(response.getStatus() == 200) {
    		return response.getHeaderString(Constants.CONTENT_LENGTH);
    	}
    	return null;
	}
	

}
