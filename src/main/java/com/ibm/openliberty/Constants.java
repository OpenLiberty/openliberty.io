package com.ibm.openliberty;

public interface Constants {
	
	// BINTRAY
	
	// RUNTIME
	String RUNTIME_BINTRAY_USER = "jeanlucpicard";
	String RUNTIME_BINTRAY_API_KEY = "83313886df9a977e50332e24f76d89e4727829a0";
	String RUNTIME_BINTRAY_ORGANIZATION = "enterprise-d";
	String RUNTIME_BINTRAY_REPOSITORY = "open-liberty";
	String RUNTIME_BINTRAY_PACKAGE_RELEASES = "release-builds";
	String RUNTIME_BINTRAY_PACKAGE_NIGHTLY_BUILDS = "nightly-builds";
	
	// TOOLS
	String TOOLS_BINTRAY_USER = "";
	String TOOLS_BINTRAY_API_KEY = "";
	String TOOLS_BINTRAY_ORGANIZATION = "tetchell";
	String TOOLS_BINTRAY_REPOSITORY = "olt-sandbox";
	String TOOLS_BINTRAY_PACKAGE_RELEASES = "otc-ci";
	String TOOLS_BINTRAY_PACKAGE_NIGHTLY_BUILDS = "olt-nightly";
	
	// JSON
	String LAST_UPDATE_ATTEMPT = "last_update_attempt";
	String LAST_SUCCESSFULL_UPDATE = "last_successful_update";
	String NEVER_ATTEMPTED = "never_attempted";
	String NEVER_UPDATED = "never_updated";
	String BINTRAY_VERSIONS = "versions";
	String TESTS_PASSED = "test_passed";
	String TOTAL_TESTS = "total_tests";
	String BUILD_LOG = "build_log";
	String TESTS_LOG = "tests_log";
	String DRIVER_LOCATION = "driver_location";
	String RUNTIME_RELEASES = "runtime_releases";
	String RUNTIME_NIGHTLY_BUILDS = "runtime_nightly_builds";
	String TOOLS_RELEASES = "tools_releases";
	String TOOLS_NIGHTLY_BUILDS = "tools_nightly_builds";
	String DATE_TIME = "date_time";
	
	// FILES
	String INFORMATION_JSON_FILE = "info.json";
	
	
	//String TOOLS_BINTRAY_VERSIONS_URL = "https://api.bintray.com/packages/tetchell/olt-sandbox/olt-nightly";
	
	String BINTRAY_VERSIONS_URL = "https://api.bintray.com/packages/{0}/{1}/{2}";
	String BINTRAY_FILE_URL = "https://dl.bintray.com/{0}/{1}/{2}/{3}/{4}";
	
	String GITHUB_ISSUES_URL = "https://api.github.com/repos/OpenLiberty/open-liberty/issues?sort=update";
	String PAT_ENV_VARIABLE_NAME = "PAT";

}
