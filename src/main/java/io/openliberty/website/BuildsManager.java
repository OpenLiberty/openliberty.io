package io.openliberty.website;

import java.io.IOException;
import java.util.Comparator;
import java.util.Date;
import java.util.Iterator;
import java.util.Map;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonString;
import javax.json.JsonValue;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

public class BuildsManager {

	private static BuildsManager instance = null;

	private Date lastSuccessfulUpdate = null;
	private Date lastUpdateAttempt = null;

	private JsonObjectBuilder builds = Json.createObjectBuilder();
	private JsonObjectBuilder latestReleases = Json.createObjectBuilder();

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


	public JsonObject getBuilds() {
		if(lastSuccessfulUpdate == null) {
			updateBuilds();
		}
		return builds.build();
	}


	public JsonObject getLatestReleases() {
		if(lastSuccessfulUpdate == null) {
			updateBuilds();
		}
		return latestReleases.build();
	}


	public JsonObject getStatus() {
		JsonObjectBuilder builder = Json.createObjectBuilder();
  		builder.add(Constants.LAST_UPDATE_ATTEMPT, lastUpdateAttempt != null? lastUpdateAttempt.toString() : Constants.NEVER_ATTEMPTED);
  		builder.add(Constants.LAST_SUCCESSFULL_UPDATE, lastSuccessfulUpdate != null? lastSuccessfulUpdate.toString() : Constants.NEVER_UPDATED);
  		return builder.build();
	}


	public synchronized JsonObject updateBuilds() {
		lastUpdateAttempt = new Date();
		JsonObjectBuilder updatedBuilds = Json.createObjectBuilder();
		JsonArray updatedRuntimeReleases = retrieveBuildData(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT);
		JsonArray updatedRuntimeNightlyBuilds = retrieveBuildData(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT);
		JsonArray updatedToolsReleases = retrieveBuildData(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT);
		JsonArray updatedToolsNightlyBuilds = retrieveBuildData(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT);
		if(updatedRuntimeReleases != null && updatedRuntimeNightlyBuilds != null && updatedToolsReleases != null && updatedToolsNightlyBuilds != null) {
			JsonObject latestRuntimeRelease = getLatestBuild(updatedRuntimeReleases);
			JsonObject latestToolsRelease = getLatestBuild(updatedToolsReleases);
			if(latestRuntimeRelease != null &&  latestToolsRelease != null) {
				latestReleases.add(Constants.RUNTIME, latestRuntimeRelease);
				latestReleases.add(Constants.TOOLS, latestToolsRelease);
				updatedBuilds.add(Constants.RUNTIME_RELEASES, updatedRuntimeReleases);
				updatedBuilds.add(Constants.RUNTIME_NIGHTLY_BUILDS, updatedRuntimeNightlyBuilds);
				updatedBuilds.add(Constants.TOOLS_RELEASES, updatedToolsReleases);
				updatedBuilds.add(Constants.TOOLS_NIGHTLY_BUILDS, updatedToolsNightlyBuilds);
				lastSuccessfulUpdate = lastUpdateAttempt;
				builds = updatedBuilds;
			}
		}
		return getStatus();
	}


	private JsonObject getLatestBuild(JsonArray buildsArray) {
		JsonObject latest = null;

		for(JsonValue releaseObject : buildsArray) {
			if(releaseObject instanceof JsonObject) {
				JsonObject releaseJSONObject = (JsonObject) releaseObject;
				Object dateObject = releaseJSONObject.get(Constants.DATE);
				if(dateObject instanceof String) {
					String dateString = (String) dateObject;
					if(latest == null || dateString.compareTo(latest.getString(Constants.DATE)) > 0) {
						latest = releaseJSONObject;
					}
				}
			}
		}
		return latest;
	}


	private JsonArray retrieveBuildData(String artifactPath, String buildTypePath) {
		JsonObject versions = retrieveJSON(Constants.DHE_URL + artifactPath + buildTypePath + Constants.DHE_INFO_JSON_FILE_NAME);
		if(versions != null) {
			JsonArrayBuilder jsonArray = Json.createArrayBuilder();
			JsonValue versionsObject = versions.get(Constants.VERSIONS);
			if(versionsObject instanceof JsonArray) {
				for(JsonValue value : (JsonArray) versionsObject) {
					if(value instanceof JsonString) {
						String version = ((JsonString)value).getString();
						String versionPath = version + '/';
						String informationFileURL = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + Constants.DHE_INFO_JSON_FILE_NAME;
						JsonObject buildInformationSrc = retrieveJSON(informationFileURL);
						JsonObjectBuilder buildInformation = toJsonObjectBuilder(buildInformationSrc);
						if(buildInformationSrc != null) {
							buildInformation.add(Constants.DATE, version);

							Object buildLogObject = buildInformationSrc.get(Constants.BUILD_LOG);
							if(buildLogObject instanceof String) {
								String buildLog = (String)buildLogObject;
								String newBuildLog = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + buildLog;
								buildInformation.add(Constants.BUILD_LOG, newBuildLog);
							}

							Object testLogObject = buildInformationSrc.get(Constants.TESTS_LOG);
							if(testLogObject instanceof String) {
								String testsLog = (String)testLogObject;
								String newTestsLog = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + testsLog;
								buildInformation.add(Constants.TESTS_LOG, newTestsLog);
							}

							Object driverLocationObject = buildInformationSrc.get(Constants.DRIVER_LOCATION);
							if(driverLocationObject != null) {
								String driverLocation = (String)driverLocationObject;
								String newDrvierLocation = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + driverLocation;
								buildInformation.add(Constants.DRIVER_LOCATION, newDrvierLocation);

								String size = retrieveSize(newDrvierLocation);
								if(size != null) {
									buildInformation.add(Constants.SIZE_IN_BYTES, size);
								}
							}

							jsonArray.add(buildInformation);
						}
					}
				}
			}
			return jsonArray.build();
		}
		return null;
	}

	private JsonObjectBuilder toJsonObjectBuilder(JsonObject obj) {
		JsonObjectBuilder builder = Json.createObjectBuilder();

		for (Map.Entry<String,JsonValue> entry : obj.entrySet()) {
			builder.add(entry.getKey(), entry.getValue());
		}

		return builder;
	}

	private JsonObject retrieveJSON(String url) {
		WebTarget target = client.target(url);
    	Builder builder = target.request("application/json");
    	Response response = builder.get();
    	if(response.getStatus() == 200) {
    		return response.readEntity(JsonObject.class);
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
