package io.openliberty.website.mock;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;
import io.openliberty.website.dheclient.DHEClient;

public class MockDHEClient extends DHEClient {

	// The following are examples of the kinds of JSON payloads returned in the real
	// world from info.json hosted on DHE

	// https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/info.json
	// {"versions":["2017-09-27_1951","2017-12-06_1606","2018-03-09_2209","2018-06-19_0502"]}

	// https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/info.json
	/*
	 * { "test_passed": "8500", "total_tests": "8500", "tests_log":
	 * "open-liberty.unitTest.results.zip", "build_log": "gradle.log",
	 * "driver_location": "openliberty-18.0.0.2.zip", "package_locations":
	 * ["openliberty-javaee8-18.0.0.2.zip","openliberty-webProfile8-18.0.0.2.zip"],
	 * "version": "18.0.0.2" }
	 */

	// https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2018-07-19_0033/info.json
	// {"build_log":"build.log","driver_location":"openlibertytools-18.0.0.3.v2018-07-19_0033.zip","test_passed":114,"total_tests":114,"tests_log":"test_results.html"}

	@Override
	public JsonObject retrieveJSON(String url) {
		if (url.equals("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/info.json")) {
			JsonObjectBuilder runtimeReleaseVersions = Json.createObjectBuilder();
			JsonArrayBuilder runtimeVersions = Json.createArrayBuilder();
			runtimeVersions.add("runtime-release-v1");
			runtimeReleaseVersions.add(Constants.VERSIONS, runtimeVersions.build());
			return runtimeReleaseVersions.build();
		}
		if (url.equals("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/info.json")) {
			JsonObjectBuilder runtimeReleaseVersions = Json.createObjectBuilder();
			JsonArrayBuilder runtimeVersions = Json.createArrayBuilder();
			runtimeVersions.add("runtime-nightly-v1");
			runtimeReleaseVersions.add(Constants.VERSIONS, runtimeVersions.build());
			return runtimeReleaseVersions.build();
		}
		if (url.equals("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/release/info.json")) {
			JsonObjectBuilder runtimeReleaseVersions = Json.createObjectBuilder();
			JsonArrayBuilder runtimeVersions = Json.createArrayBuilder();
			runtimeVersions.add("tools-release-v1");
			runtimeReleaseVersions.add(Constants.VERSIONS, runtimeVersions.build());
			return runtimeReleaseVersions.build();
		}
		if (url.equals("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/info.json")) {
			JsonObjectBuilder runtimeReleaseVersions = Json.createObjectBuilder();
			JsonArrayBuilder runtimeVersions = Json.createArrayBuilder();
			runtimeVersions.add("tools-nightly-v1");
			runtimeReleaseVersions.add(Constants.VERSIONS, runtimeVersions.build());
			return runtimeReleaseVersions.build();
		}
		if (url.contains("runtime")) {
			JsonObjectBuilder releaseInfo = Json.createObjectBuilder();
			releaseInfo.add(Constants.VERSION, "v1");
			releaseInfo.add(Constants.BUILD_LOG, "build-log-path");
			releaseInfo.add(Constants.TESTS_LOG, "test-log-path");
			releaseInfo.add(Constants.DRIVER_LOCATION, "driver-location");
			releaseInfo.add(Constants.TESTS_PASSED, "8500");
			releaseInfo.add(Constants.TOTAL_TESTS, "8501");
			releaseInfo.add(Constants.PACKAGE_LOCATIONS,
					Json.createArrayBuilder().add("my-package-v1").build());
			return releaseInfo.build();
		}
		// For some reason, the tools info.json has the test data as INT, rather than STRING
		if (url.contains("tools")) {
			JsonObjectBuilder releaseInfo = Json.createObjectBuilder();
			releaseInfo.add(Constants.VERSION, "v1");
			releaseInfo.add(Constants.BUILD_LOG, "build-log-path");
			releaseInfo.add(Constants.TESTS_LOG, "test-log-path");
			releaseInfo.add(Constants.DRIVER_LOCATION, "driver-location");
			releaseInfo.add(Constants.TESTS_PASSED, 114);
			releaseInfo.add(Constants.TOTAL_TESTS, 115);
			releaseInfo.add(Constants.PACKAGE_LOCATIONS,
					Json.createArrayBuilder().add("my-package-v1").build());
			return releaseInfo.build();
		}
		return null;
	}

	@Override
	public String retrieveSize(String url) {
		return "1234";
	}
}
