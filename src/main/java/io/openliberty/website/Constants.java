/*******************************************************************************
 * Copyright (c) 2017, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website;

public final class Constants {

    private Constants() {
        // no one should be instantiating this class
    }

    // URL
    public static final String DHE_URL = "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/";
    public static final String DHE_RUNTIME_PATH_SEGMENT = "runtime";
    public static final String DHE_TOOLS_PATH_SEGMENT = "tools";
    public static final String DHE_RELEASE_PATH_SEGMENT = "release";
    public static final String DHE_NIGHTLY_PATH_SEGMENT = "nightly";
    public static final String DHE_BETA_PATH_SEGMENT = "beta";
    public static final String DHE_INFO_JSON_FILE_NAME = "info.json";

    // JSON
    public static final String LAST_UPDATE_ATTEMPT = "last_update_attempt";
    public static final String LAST_SUCCESSFULL_UPDATE = "last_successful_update";
    public static final String NEVER_ATTEMPTED = "never_attempted";
    public static final String NEVER_UPDATED = "never_updated";
    public static final String TESTS_PASSED = "test_passed";
    public static final String TOTAL_TESTS = "total_tests";
    public static final String BUILD_LOG = "build_log";
    public static final String TESTS_LOG = "tests_log";
    public static final String DRIVER_LOCATION = "driver_location";
    public static final String PACKAGE_LOCATIONS = "package_locations";
    public static final String PACKAGE_SIGNATURE_LOCATIONS = "package_signature_locations";
    public static final String RUNTIME_RELEASES = "runtime_releases";
    public static final String RUNTIME_NIGHTLY_BUILDS = "runtime_nightly_builds";
    public static final String RUNTIME_BETAS = "runtime_betas";
    public static final String TOOLS_RELEASES = "tools_releases";
    public static final String TOOLS_NIGHTLY_BUILDS = "tools_nightly_builds";
    public static final String DATE = "date_time";
    public static final String VERSION = "version";
    public static final String VERSIONS = "versions";
    public static final String SIZE_IN_BYTES = "size_in_bytes";
    public static final String RUNTIME = "runtime";
    public static final String TOOLS = "tools";
    public static final String BUILDS = "builds";
    public static final String LATEST_RELEASES = "latest_releases";

    // HTTP
    public static final String CONTENT_LENGTH = "Content-Length";
    public static final String API_SERVLET_PATH = "/api";

    // GITHUB
    public static final String GITHUB_ISSUES_URL = "https://api.github.com/repos/OpenLiberty/open-liberty/issues?sort=update";
    public static final String PAT_ENV_VARIABLE_NAME = "PAT";

    // BLUEMIX
    public static final String OPEN_LIBERTY_GREEN_APP_HOST = "openliberty-green.mybluemix.net";
    public static final String OPEN_LIBERTY_BLUE_APP_HOST = "openliberty-blue.mybluemix.net";
}
