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

import java.io.StringReader;
import java.util.Date;
import java.util.Map;

import javax.enterprise.context.ApplicationScoped;
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
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@ApplicationScoped
public class BuildsManager {

    private volatile Date lastSuccessfulUpdate = null;
    private volatile Date lastUpdateAttempt = null;

    private volatile JsonObject builds = Json.createObjectBuilder().build();
    private volatile JsonObject latestReleases = Json.createObjectBuilder().build();

    private Client client = null;

    public BuildsManager() {
        client = ClientBuilder.newClient();
    }

    public JsonObject getBuilds() {
        if (isBuildUpdateAllowed()) {
            updateBuilds();
        }
        return builds;
    }

    public JsonObject getLatestReleases() {
        if (isBuildUpdateAllowed()) {
            updateBuilds();
        }
        return latestReleases;
    }

    public JsonObject getStatus() {
        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add(Constants.LAST_UPDATE_ATTEMPT,
                lastUpdateAttempt != null ? lastUpdateAttempt.toString() : Constants.NEVER_ATTEMPTED);
        builder.add(Constants.LAST_SUCCESSFULL_UPDATE,
                lastSuccessfulUpdate != null ? lastSuccessfulUpdate.toString() : Constants.NEVER_UPDATED);
        return builder.build();
    }

    public synchronized JsonObject updateBuilds() {
        lastUpdateAttempt = new Date();
        JsonObjectBuilder updatedBuilds = Json.createObjectBuilder();
        JsonObjectBuilder updatedReleases = Json.createObjectBuilder();
        JsonArray updatedRuntimeReleases = retrieveBuildData(Constants.DHE_RUNTIME_PATH_SEGMENT,
                Constants.DHE_RELEASE_TEST_PATH_SEGMENT);
        JsonArray updatedRuntimeNightlyBuilds = retrieveBuildData(Constants.DHE_RUNTIME_PATH_SEGMENT,
                Constants.DHE_NIGHTLY_PATH_SEGMENT);
        JsonArray updatedToolsReleases = retrieveBuildData(Constants.DHE_TOOLS_PATH_SEGMENT,
                Constants.DHE_RELEASE_PATH_SEGMENT);
        JsonArray updatedToolsNightlyBuilds = retrieveBuildData(Constants.DHE_TOOLS_PATH_SEGMENT,
                Constants.DHE_NIGHTLY_PATH_SEGMENT);
        if (updatedRuntimeReleases != null && updatedRuntimeNightlyBuilds != null && updatedToolsReleases != null
                && updatedToolsNightlyBuilds != null) {
            JsonObject latestRuntimeRelease = getLatestBuild(updatedRuntimeReleases);
            JsonObject latestToolsRelease = getLatestBuild(updatedToolsReleases);
            // if (latestRuntimeRelease != null && latestToolsRelease != null) {
            if (latestRuntimeRelease != null) {
                updatedReleases.add(Constants.RUNTIME, latestRuntimeRelease);
                updatedReleases.add(Constants.TOOLS, latestToolsRelease);
                updatedBuilds.add(Constants.RUNTIME_RELEASES, updatedRuntimeReleases);
                updatedBuilds.add(Constants.RUNTIME_NIGHTLY_BUILDS, updatedRuntimeNightlyBuilds);
                updatedBuilds.add(Constants.TOOLS_RELEASES, updatedToolsReleases);
                updatedBuilds.add(Constants.TOOLS_NIGHTLY_BUILDS, updatedToolsNightlyBuilds);
                lastSuccessfulUpdate = lastUpdateAttempt;
                builds = updatedBuilds.build();
                latestReleases = updatedReleases.build();
            }
        }
        return getStatus();
    }

    private JsonObject getLatestBuild(JsonArray buildsArray) {
        JsonObject latest = null;

        for (JsonValue releaseObject : buildsArray) {
            if (releaseObject instanceof JsonObject) {
                JsonObject releaseJSONObject = (JsonObject) releaseObject;
                JsonValue dateObject = releaseJSONObject.get(Constants.DATE);
                if (dateObject instanceof JsonString) {
                    String dateString = ((JsonString) dateObject).getString();
                    if (latest == null || dateString.compareTo(latest.getString(Constants.DATE)) > 0) {
                        latest = releaseJSONObject;
                    }
                }
            }
        }
        return latest;
    }

    private JsonArray retrieveBuildData(String artifactPath, String buildTypePath) {
        JsonObject versions = retrieveJSON(
                Constants.DHE_URL + artifactPath + buildTypePath + Constants.DHE_INFO_JSON_FILE_NAME);
        if (versions != null) {
            JsonArrayBuilder jsonArray = Json.createArrayBuilder();
            JsonValue versionsObject = versions.get(Constants.VERSIONS);
            if (versionsObject instanceof JsonArray) {
                for (JsonValue value : (JsonArray) versionsObject) {
                    if (value instanceof JsonString) {
                        String version = ((JsonString) value).getString();
                        String versionPath = version + '/';
                        String informationFileURL = Constants.DHE_URL + artifactPath + buildTypePath + versionPath
                                + Constants.DHE_INFO_JSON_FILE_NAME;
                        JsonObject buildInformationSrc = retrieveJSON(informationFileURL);
                        JsonObjectBuilder buildInformation = toJsonObjectBuilder(buildInformationSrc);
                        if (buildInformationSrc != null) {
                            buildInformation.add(Constants.DATE, version);

                            JsonValue buildLogObject = buildInformationSrc.get(Constants.BUILD_LOG);
                            if (buildLogObject instanceof JsonString) {
                                String buildLog = ((JsonString) buildLogObject).getString();
                                String newBuildLog = Constants.DHE_URL + artifactPath + buildTypePath + versionPath
                                        + buildLog;
                                buildInformation.add(Constants.BUILD_LOG, newBuildLog);
                            }

                            JsonValue testLogObject = buildInformationSrc.get(Constants.TESTS_LOG);
                            if (testLogObject instanceof JsonString) {
                                String testsLog = ((JsonString) testLogObject).getString();
                                String newTestsLog = Constants.DHE_URL + artifactPath + buildTypePath + versionPath
                                        + testsLog;
                                buildInformation.add(Constants.TESTS_LOG, newTestsLog);
                            }

                            JsonValue driverLocationObject = buildInformationSrc.get(Constants.DRIVER_LOCATION);
                            if (driverLocationObject instanceof JsonString) {
                                String driverLocation = ((JsonString) driverLocationObject).getString();
                                String newDrvierLocation = Constants.DHE_URL + artifactPath + buildTypePath
                                        + versionPath + driverLocation;
                                buildInformation.add(Constants.DRIVER_LOCATION, newDrvierLocation);

                                String size = retrieveSize(newDrvierLocation);
                                if (size != null) {
                                    buildInformation.add(Constants.SIZE_IN_BYTES, size);
                                }
                            }

                            JsonValue packageLocationsObject = buildInformationSrc.get(Constants.PACKAGE_LOCATIONS);
                            if(packageLocationsObject instanceof JsonArray){
                                JsonArray packageLocations = (JsonArray) packageLocationsObject;
                                // Form an array of packageName=packageLocation
                                JsonArrayBuilder packageArray = Json.createArrayBuilder();
                                for(int i = 0; i < packageLocations.size(); i++){     
                                    String packageLocation = ((JsonString) packageLocations.get(i)).getString();
                                    String[] parts = packageLocation.replaceAll("\"", "").split("-");
                                    if(parts.length == 3){
                                        String packageName = parts[1];
                                        String extension = parts[2];
                                        String packageVersion = ((JsonString) buildInformationSrc.get(Constants.VERSION)).getString();
                                        extension = extension.substring(extension.indexOf(packageVersion) + packageVersion.length());
                                        String newLocation = Constants.DHE_URL + artifactPath + buildTypePath
                                        + versionPath + packageLocation;
                                        // newLocation = newLocation.replaceAll("\"", "");
                                        packageArray.add(packageName + extension + "=" + newLocation);
                                    }                                    
                                }
                                buildInformation.add(Constants.PACKAGE_LOCATIONS, packageArray.build());
                            }
                            jsonArray.add(buildInformation.build());
                        }
                    }
                }
            }
            return jsonArray.build();
        }
        return null;
    }

    private JsonObjectBuilder toJsonObjectBuilder(JsonObject obj) {
        if (obj == null) return null;

        JsonObjectBuilder builder = Json.createObjectBuilder();

        for (Map.Entry<String, JsonValue> entry : obj.entrySet()) {
            builder.add(entry.getKey(), entry.getValue());
        }

        return builder;
    }

    private JsonObject retrieveJSON(String url) {
        WebTarget target = client.target(url);
        Builder builder = target.request("application/json");
        Response response = builder.get();
        if (response.getStatus() == 200) {
            if (MediaType.APPLICATION_JSON_TYPE.equals(response.getMediaType())) {
                return response.readEntity(JsonObject.class);
            } else if (MediaType.TEXT_PLAIN_TYPE.equals(response.getMediaType())) {
                String responseBody = response.readEntity(String.class);
                return Json.createReader(new StringReader(responseBody)).readObject();
            }
        }
        return null;
    }

    private String retrieveSize(String url) {
        WebTarget target = client.target(url);
        Builder builder = target.request();
        Response response = builder.head();
        if (response.getStatus() == 200) {
            return response.getHeaderString(Constants.CONTENT_LENGTH);
        }
        return null;
    }

    // Compare the current time with the time the last build request is run. Allow the next
    // build request to go through if the last build request was run an hour ago or more.
    private boolean isBuildUpdateAllowed() {
        boolean isBuildUpdateAllowed = true;
        if (lastSuccessfulUpdate != null) {
            long currentTime = new Date().getTime();
            long lastUpdateTime = lastSuccessfulUpdate.getTime();
            // 1 hour = 3600000 ms
            if (currentTime - lastUpdateTime < 3600000) {
                isBuildUpdateAllowed = false;
            }
        }

        return isBuildUpdateAllowed;
    }

}
