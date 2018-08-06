package io.openliberty.website.dheclient;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.Future;

import javax.inject.Inject;
import javax.json.JsonArray;
import javax.json.JsonNumber;
import javax.json.JsonObject;
import javax.json.JsonString;
import javax.json.JsonValue;

import io.openliberty.website.Constants;
import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.data.BuildLists;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.data.LatestReleases;

public class DHEBuildParser {

	private ExecutorService exec = new ForkJoinPool();

	@Inject
	private DHEClient dheClient;

	private LastUpdate lastUpdate = new LastUpdate();
	private BuildData buildData = new BuildData(new LatestReleases(), new BuildLists());

	/** Defined default constructor */
	public DHEBuildParser() {
	}

	/** Allow for unittest injection */
	public DHEBuildParser(DHEClient client) {
		dheClient = client;
	}

	public BuildData getBuildData() {
		return buildData;
	}

	// Compare the current time with the time the last build request is run. Allow
	// the next
	// build request to go through if the last build request was run an hour ago or
	// more.
	boolean isBuildUpdateAllowed() {
		boolean isBuildUpdateAllowed = true;
		Date lastSuccessfulUpdate = lastUpdate.lastSuccessfulUpdate();
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

	public synchronized LastUpdate updateAsNeeded() {
		if (isBuildUpdateAllowed()) {
			update();
		}
		return lastUpdate;
	}

	public synchronized LastUpdate update() {
		lastUpdate.setLastUpdateAttempt(new Date());

		Future<List<BuildInfo>> runtimeReleases = exec.submit(
				new RetrieveBuildList(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT));
		Future<List<BuildInfo>> runtimeNightly = exec.submit(
				new RetrieveBuildList(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT));
		Future<List<BuildInfo>> toolsReleases = exec.submit(
				new RetrieveBuildList(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT));
		Future<List<BuildInfo>> toolsNightly = exec.submit(
				new RetrieveBuildList(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT));

		List<BuildInfo> updatedRuntimeReleases = getSafe(runtimeReleases);
		List<BuildInfo> updatedRuntimeNightlyBuilds = getSafe(runtimeNightly);
		List<BuildInfo> updatedToolsReleases = getSafe(toolsReleases);
		List<BuildInfo> updatedToolsNightlyBuilds = getSafe(toolsNightly);
		if (!updatedRuntimeReleases.isEmpty() && !updatedToolsReleases.isEmpty()) {
			BuildInfo latestRuntimeRelease = pickLastestBuild(updatedRuntimeReleases);
			BuildInfo latestToolsRelease = pickLastestBuild(updatedToolsReleases);
			if (latestRuntimeRelease != null) {
				LatestReleases latest = new LatestReleases(latestRuntimeRelease, latestToolsRelease);
				BuildLists all = new BuildLists();
				all.setRuntimeReleases(updatedRuntimeReleases);
				all.setRuntimeNightlyBuilds(updatedRuntimeNightlyBuilds);
				all.setToolsReleases(updatedToolsReleases);
				all.setToolsNightlyBuild(updatedToolsNightlyBuilds);

				buildData = new BuildData(latest, all);
				lastUpdate.markSuccessfulUpdate();
			}
		}

		return lastUpdate;
	}

	private List<BuildInfo> getSafe(Future<List<BuildInfo>> future) {
		try {
			return future.get();
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		return null;
	}

	private BuildInfo pickLastestBuild(List<BuildInfo> buildsList) {
		BuildInfo latest = null;

		for (BuildInfo info : buildsList) {
			if (latest == null) {
				latest = info;
			}
			if (info.getDateTime().compareTo(latest.getDateTime()) > 0) {
				latest = info;
			}
		}
		return latest;
	}

	public LastUpdate getLastUpdate() {
		return lastUpdate;
	}

	class RetrieveBuildInfo implements Callable<BuildInfo> {
		private String artifactPath;
		private String buildTypePath;
		private String dateTime;

		RetrieveBuildInfo(String artifactPath, String buildTypePath, String dateTime) {
			this.artifactPath = artifactPath;
			this.buildTypePath = buildTypePath;
			this.dateTime = dateTime;
		}

		@Override
		public BuildInfo call() throws Exception {
			String dateTimePath = dateTime + '/';
			String informationFileURL = Constants.DHE_URL + artifactPath + buildTypePath + dateTimePath
					+ Constants.DHE_INFO_JSON_FILE_NAME;
			JsonObject buildInformationSrc = dheClient.retrieveJSON(informationFileURL);
			if (buildInformationSrc != null) {
				return parseBuildInformation(artifactPath, buildTypePath, dateTime, dateTimePath, buildInformationSrc);
			}
			return null;
		}

		private BuildInfo parseBuildInformation(String artifactPath, String buildTypePath, String dateTime,
				String dateTimePath, JsonObject buildInformationSrc) {
			BuildInfo info = new BuildInfo();
			info.addDateTime(dateTime);

			JsonValue versionObject = buildInformationSrc.get(Constants.VERSION);
			if (versionObject instanceof JsonString) {
				info.addVersion(((JsonString) versionObject).getString());
			}

			JsonValue testsPassedObject = buildInformationSrc.get(Constants.TESTS_PASSED);
			if (testsPassedObject instanceof JsonString) {
				info.addTestPassed(((JsonString) testsPassedObject).getString());
			}
			if (testsPassedObject instanceof JsonNumber) {
				info.addTestPassed(((JsonNumber) testsPassedObject).toString());
			}

			JsonValue totalTestsObject = buildInformationSrc.get(Constants.TOTAL_TESTS);
			if (totalTestsObject instanceof JsonString) {
				info.addTotalTests(((JsonString) totalTestsObject).getString());
			}
			if (totalTestsObject instanceof JsonNumber) {
				info.addTotalTests(((JsonNumber) totalTestsObject).toString());
			}

			JsonValue buildLogObject = buildInformationSrc.get(Constants.BUILD_LOG);
			if (buildLogObject instanceof JsonString) {
				String buildLog = ((JsonString) buildLogObject).getString();
				String newBuildLog = Constants.DHE_URL + artifactPath + buildTypePath + dateTimePath + buildLog;
				info.addBuildLog(newBuildLog);
			}

			JsonValue testLogObject = buildInformationSrc.get(Constants.TESTS_LOG);
			if (testLogObject instanceof JsonString) {
				String testsLog = ((JsonString) testLogObject).getString();
				String newTestsLog = Constants.DHE_URL + artifactPath + buildTypePath + dateTimePath + testsLog;
				info.addTestLog(newTestsLog);
			}

			JsonValue driverLocationObject = buildInformationSrc.get(Constants.DRIVER_LOCATION);
			if (driverLocationObject instanceof JsonString) {
				String driverLocation = ((JsonString) driverLocationObject).getString();
				String newDrvierLocation = Constants.DHE_URL + artifactPath + buildTypePath + dateTimePath + driverLocation;
				info.addDriverLocation(newDrvierLocation);

				String size = dheClient.retrieveSize(newDrvierLocation);
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
						String newLocation = Constants.DHE_URL + artifactPath + buildTypePath + dateTimePath
								+ packageLocation;
						info.addPackageLocation(packageName + extension, newLocation);
					}
				}
			}
			return info;
		}

	}

	class RetrieveBuildList implements Callable<List<BuildInfo>> {
		private String artifactPath;
		private String buildTypePath;

		RetrieveBuildList(String artifactPath, String buildTypePath) {
			this.artifactPath = artifactPath;
			this.buildTypePath = buildTypePath;
		}

		@Override
		public List<BuildInfo> call() throws Exception {
			List<BuildInfo> builds = new ArrayList<BuildInfo>();
			String versionsURL = Constants.DHE_URL + artifactPath + buildTypePath + Constants.DHE_INFO_JSON_FILE_NAME;
			JsonObject versions = dheClient.retrieveJSON(versionsURL);
			if (versions != null) {
				JsonValue versionsObject = versions.get(Constants.VERSIONS);
				if (versionsObject instanceof JsonArray) {

					List<Future<BuildInfo>> buildInfoFutures = new ArrayList<>();
					for (JsonValue value : (JsonArray) versionsObject) {
						if (value instanceof JsonString) {
							buildInfoFutures.add(exec.submit(new RetrieveBuildInfo(artifactPath, buildTypePath,
									((JsonString) value).getString())));
						}
					}

					for (Future<BuildInfo> f : buildInfoFutures) {
						BuildInfo info = getSafe(f);
						if (info != null) {
							builds.add(info);
						}
					}

				}
			}
			return builds;
		}

		private BuildInfo getSafe(Future<BuildInfo> future) {
			try {
				return future.get();
			} catch (InterruptedException e) {
				e.printStackTrace();
			} catch (ExecutionException e) {
				e.printStackTrace();
			}
			return null;
		}
	}
}
