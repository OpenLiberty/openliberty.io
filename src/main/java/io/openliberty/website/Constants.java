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

public interface Constants {

    // URL
    String DHE_URL = "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/";
    String DHE_RUNTIME_PATH_SEGMENT = "runtime/";
    String DHE_TOOLS_PATH_SEGMENT = "tools/";
    String DHE_RELEASE_PATH_SEGMENT = "release/";
    String DHE_NIGHTLY_PATH_SEGMENT = "nightly/";
    String DHE_INFO_JSON_FILE_NAME = "info.json";

    // JSON
    String LAST_UPDATE_ATTEMPT = "last_update_attempt";
    String LAST_SUCCESSFULL_UPDATE = "last_successful_update";
    String NEVER_ATTEMPTED = "never_attempted";
    String NEVER_UPDATED = "never_updated";
    String TESTS_PASSED = "test_passed";
    String TOTAL_TESTS = "total_tests";
    String BUILD_LOG = "build_log";
    String TESTS_LOG = "tests_log";
    String DRIVER_LOCATION = "driver_location";
    String RUNTIME_RELEASES = "runtime_releases";
    String RUNTIME_NIGHTLY_BUILDS = "runtime_nightly_builds";
    String TOOLS_RELEASES = "tools_releases";
    String TOOLS_NIGHTLY_BUILDS = "tools_nightly_builds";
    String DATE = "date_time";
    String VERSIONS = "versions";
    String SIZE_IN_BYTES = "size_in_bytes";
    String RUNTIME = "runtime";
    String TOOLS = "tools";
    String BUILDS = "builds";
    String LATEST_RELEASES = "latest_releases";

    // HTTP
    String CONTENT_LENGTH = "Content-Length";

    // GITHUB
    String GITHUB_ISSUES_URL = "https://api.github.com/repos/OpenLiberty/open-liberty/issues?sort=update";
    String PAT_ENV_VARIABLE_NAME = "PAT";

}
