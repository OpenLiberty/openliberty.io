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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonString;
import javax.json.JsonValue;

import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.data.BuildLists;
import io.openliberty.website.data.BuildInfo;

@ApplicationScoped
public class BuildsManager {
    @Inject private DHEClient dheParser;

    private LastUpdate lastUpdate = new LastUpdate();
    private volatile BuildLists builds = new BuildLists();
    private volatile JsonObject latestReleases = Json.createObjectBuilder().build();

    /** Defined default constructor */
    public BuildsManager() {}

    /** Allow for unittest injection */
    BuildsManager(DHEClient client) {
        dheParser = client;
    }

    public BuildLists getBuilds() {
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

    public LastUpdate getStatus() {
        return lastUpdate;
    }

    public synchronized LastUpdate updateBuilds() {
        lastUpdate.setLastUpdateAttempt(new Date());
        JsonObjectBuilder updatedReleases = Json.createObjectBuilder();
        List<BuildInfo> updatedRuntimeReleases = retrieveBuildData(Constants.DHE_RUNTIME_PATH_SEGMENT,
                Constants.DHE_RELEASE_PATH_SEGMENT);
        List<BuildInfo> updatedRuntimeNightlyBuilds = retrieveBuildData(Constants.DHE_RUNTIME_PATH_SEGMENT,
                Constants.DHE_NIGHTLY_PATH_SEGMENT);
        List<BuildInfo> updatedToolsReleases = retrieveBuildData(Constants.DHE_TOOLS_PATH_SEGMENT,
                Constants.DHE_RELEASE_PATH_SEGMENT);
        List<BuildInfo> updatedToolsNightlyBuilds = retrieveBuildData(Constants.DHE_TOOLS_PATH_SEGMENT,
                Constants.DHE_NIGHTLY_PATH_SEGMENT);
        if (!updatedRuntimeReleases.isEmpty() && !updatedToolsReleases.isEmpty()) {
            JsonObject latestRuntimeRelease = getLatestBuild(updatedRuntimeReleases);
            JsonObject latestToolsRelease = getLatestBuild(updatedToolsReleases);
            // if (latestRuntimeRelease != null && latestToolsRelease != null) {
            if (latestRuntimeRelease != null) {
                updatedReleases.add(Constants.RUNTIME, latestRuntimeRelease);
                updatedReleases.add(Constants.TOOLS, latestToolsRelease);
                BuildLists all = new BuildLists();
                all.setRuntimeReleases(updatedRuntimeReleases);
                all.setRuntimeNightlyBuilds(updatedRuntimeNightlyBuilds);
                all.setToolsReleases(updatedToolsReleases);
                all.setToolsNightlyBuild(updatedToolsNightlyBuilds);
                lastUpdate.markSuccessfulUpdate();
                builds = all;
                latestReleases = updatedReleases.build();
            }
        }
        return getStatus();
    }

	private JsonObject getLatestBuild(List<BuildInfo> buildsList) {
		BuildInfo latest = null;

		for (BuildInfo info : buildsList) {
			if (latest == null) {
				latest = info;
			}
			if (info.getDateTime().compareTo(latest.getDateTime()) > 0) {
				latest = info;
			}
		}
		return latest.asJsonObject();
    }

	private List<BuildInfo> retrieveBuildData(String artifactPath, String buildTypePath) {
		List<BuildInfo> builds = new ArrayList<BuildInfo>();
		String versionsURL = Constants.DHE_URL + artifactPath + buildTypePath + Constants.DHE_INFO_JSON_FILE_NAME;
		JsonObject versions = dheParser.retrieveJSON(versionsURL);
		if (versions != null) {
			JsonArrayBuilder jsonArray = Json.createArrayBuilder();
			JsonValue versionsObject = versions.get(Constants.VERSIONS);
			if (versionsObject instanceof JsonArray) {
				for (JsonValue value : (JsonArray) versionsObject) {
					if (value instanceof JsonString) {
						BuildInfo info = loadBuildVersion(artifactPath, buildTypePath, jsonArray, (JsonString) value);
						if (info != null) {
						builds.add(info);
						}
					}
				}
			}
		}
		return builds;
	}

	private BuildInfo loadBuildVersion(String artifactPath, String buildTypePath, JsonArrayBuilder jsonArray,
			JsonString value) {
		String version = ((JsonString) value).getString();
		String versionPath = version + '/';
		String informationFileURL = Constants.DHE_URL + artifactPath + buildTypePath + versionPath
				+ Constants.DHE_INFO_JSON_FILE_NAME;
		JsonObject buildInformationSrc = dheParser.retrieveJSON(informationFileURL);
		if (buildInformationSrc != null) {
			return parseBuildInformation(artifactPath, buildTypePath, version, versionPath, buildInformationSrc);
		}
		return null;
	}

	private BuildInfo parseBuildInformation(String artifactPath, String buildTypePath, String version,
			String versionPath, JsonObject buildInformationSrc) {
		BuildInfo info = new BuildInfo();
		info.addDateTime(version);

		JsonValue versionObject = buildInformationSrc.get(Constants.VERSION);
		if (versionObject instanceof JsonString) {
			info.addVersion(((JsonString) versionObject).getString());
		}
		JsonValue testsPassedObject = buildInformationSrc.get(Constants.TESTS_PASSED);
		if (testsPassedObject instanceof JsonString) {
			info.addTestPassed(((JsonString) testsPassedObject).getString());
		}
		JsonValue totalTestsObject = buildInformationSrc.get(Constants.TOTAL_TESTS);
		if (totalTestsObject instanceof JsonString) {
			info.addTotalTests(((JsonString) totalTestsObject).getString());
		}

		JsonValue buildLogObject = buildInformationSrc.get(Constants.BUILD_LOG);
		if (buildLogObject instanceof JsonString) {
			String buildLog = ((JsonString) buildLogObject).getString();
			String newBuildLog = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + buildLog;
			info.addBuildLog(newBuildLog);
		}

		JsonValue testLogObject = buildInformationSrc.get(Constants.TESTS_LOG);
		if (testLogObject instanceof JsonString) {
			String testsLog = ((JsonString) testLogObject).getString();
			String newTestsLog = Constants.DHE_URL + artifactPath + buildTypePath + versionPath + testsLog;
			info.addTestLog(newTestsLog);
		}

		JsonValue driverLocationObject = buildInformationSrc.get(Constants.DRIVER_LOCATION);
		if (driverLocationObject instanceof JsonString) {
			String driverLocation = ((JsonString) driverLocationObject).getString();
			String newDrvierLocation = Constants.DHE_URL + artifactPath + buildTypePath + versionPath
					+ driverLocation;
			info.addDriverLocation(newDrvierLocation);

			String size = dheParser.retrieveSize(newDrvierLocation);
			if (size != null) {
				info.addSizeInBytes(size);
			}
		}

		JsonValue packageLocationsObject = buildInformationSrc.get(Constants.PACKAGE_LOCATIONS);
		if (packageLocationsObject instanceof JsonArray) {
			JsonArray packageLocations = (JsonArray) packageLocationsObject;
			// Form an array of packageName=packageLocation
			for (int i = 0; i < packageLocations.size(); i++) {
				String packageLocation = ((JsonString) packageLocations.get(i)).getString();
				String[] parts = packageLocation.split("-");
				if (parts.length == 3) {
					String packageName = parts[1];
					String extension = parts[2];
					String packageVersion = ((JsonString) buildInformationSrc.get(Constants.VERSION)).getString();
					extension = extension.substring(extension.indexOf(packageVersion) + packageVersion.length());
					String newLocation = Constants.DHE_URL + artifactPath + buildTypePath + versionPath
							+ packageLocation;
					info.addPackageLocation(packageName + extension, newLocation);
				}
			}
		}
		return info;
	}

    // Compare the current time with the time the last build request is run. Allow the next
    // build request to go through if the last build request was run an hour ago or more.
    boolean isBuildUpdateAllowed() {
        boolean isBuildUpdateAllowed = true;
        if (lastUpdate.lastSuccessfulUpdate() != null) {
            long currentTime = new Date().getTime();
            long lastUpdateTime = lastUpdate.lastSuccessfulUpdate().getTime();
            // 1 hour = 3600000 ms
            if (currentTime - lastUpdateTime < 3600000) {
                isBuildUpdateAllowed = false;
            }
        }

        return isBuildUpdateAllowed;
    }

}
