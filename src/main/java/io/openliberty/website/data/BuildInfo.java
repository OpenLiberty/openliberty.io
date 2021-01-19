/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.data;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.json.bind.JsonbBuilder;
import javax.json.bind.annotation.JsonbProperty;

import io.openliberty.website.Constants;

/**
 * A JSON-B class representing a build. This is suitable for parsing the info.json from DHE, but also
 * returning directly from the Open Liberty REST API. Not all fields are mandatory. The DHE usage of this
 * has all locations relative, but from the Open Liberty REST API they are all absolute.
 * 
 * <p>At this time the size_in_bytes field is present, but does not appear used. The package_locations may not
 * be present. If present this is a list of alternative package locations. The format of this differs between
 * the DHE version of this and the Open Liberty REST API version. In DHE each entry is a simple file name, in
 * the Open Liberty REST API each entry in the array is a name = url format.</p>
 * 
 * <p>This can be used as a key in Map, if it is not set then a NPE will occur. The resolveLocations method is 
 * the primary method used prior to using this in this way, this is because the equals/hashcode uses dateTime
 * field for identity.</p>
 * 
 * <pre>
 * {
 *     "test_passed": 13064,
 *     "total_tests": 13064,
 *     "tests_log": "open-liberty.unitTest.results.zip",
 *     "build_log": "gradle.log",
 *     "driver_location": "openliberty-20.0.0.4.zip",
 *     "package_locations": ["openliberty-javaee8-20.0.0.4.zip","openliberty-webProfile8-20.0.0.4.zip","openliberty-microProfile3-20.0.0.4.zip", "openliberty-kernel-20.0.0.4.zip"],
 *     "version": "20.0.0.4",
 *     "date_time": "2017-09-27_1951",
 *     "size_in_bytes": 12345
 * }
 * </pre>
 */
public class BuildInfo {
    @JsonbProperty(Constants.VERSION)
    public String version;
    @JsonbProperty(Constants.DATE)
    public String dateTime;
    @JsonbProperty(Constants.DRIVER_LOCATION)
    public String driverLocation;
    @JsonbProperty(Constants.SIZE_IN_BYTES)
    public int sizeInBytes;
    @JsonbProperty(Constants.TESTS_PASSED)
    public int testPassed;
    @JsonbProperty(Constants.TOTAL_TESTS)
    public int totalTests;
    @JsonbProperty(Constants.BUILD_LOG)
    public String buildLog;
    @JsonbProperty(Constants.TESTS_LOG)
    public String testLog;
    @JsonbProperty(Constants.PACKAGE_LOCATIONS)
    public List<String> packageLocations = new ArrayList<>();


    public BuildInfo(String buildLog, String driverLocation, int testPassed, int totalTests, String testLog) {
        this.buildLog = buildLog;
        this.driverLocation = driverLocation;
        this.testPassed = testPassed;
        this.totalTests = totalTests;
        this.testLog = testLog;
    }

    public BuildInfo(String driverLocation, String version) {
        this.driverLocation = driverLocation;
        this.version = version;
    }

    public BuildInfo(String buildLog, String driverLocation, int testPassed, int totalTests, String testLog, String version, String ... driverLocations) {
        this.buildLog = buildLog;
        this.driverLocation = driverLocation;
        this.testPassed = testPassed;
        this.totalTests = totalTests;
        this.testLog = testLog;
        this.version = version;
        packageLocations.addAll(Arrays.asList(driverLocations));
    }

    public BuildInfo() { }

    public String toString() {
        return JsonbBuilder.create().toJson(this);
    }

    /**
     * This method must be called prior to this being returned on the Open Liberty REST API.
     * This is because it handles converting from relative DHE urls to absolute ones. It also 
     * sets the DateTime which is important before storing in a sorted set.
     * 
     * @param url The DHE url
     * @param type The type of the build
     * @param dateTime the date/time of publication
     * @return This date time.
     */
    public void resolveLocations(String url, BuildType type, String dateTime) {
        // first set date time if it isn't already set. This field isn't stored in
        // DHE, but is returned by the Open Liberty REST API so this is really important
        if (this.dateTime == null) this.dateTime = dateTime;

        // Setup the url prefix for the build logs and driver location
        String prefix = url + type.getURISegment() + '/' + dateTime + '/';

        if (driverLocation != null) {
            if (packageLocations != null) {
                // add driver location to arraylist of package locations
                packageLocations.add(driverLocation);
            }

            driverLocation = prefix + driverLocation;
        }

        if (buildLog != null) {
            buildLog = prefix + buildLog;
        }

        if (testLog != null) {
            testLog = prefix + testLog;
        }

        // This is historic and not ideal. Ideally the package Locations would be an Object
        // but at some point it was an array of name = value and this requires rework on the front
        // end, it isn't a compatible change so for now stick with it. DHE stores a simple list
        // of packages, but the Open Liberty REST API returns key=url and the key is derived
        // from the package name, so this code extracts the key from the package name and 
        // resolves the url for each entry. Package Locations may be null so in that case we
        // need to cope.
        if (packageLocations != null && !packageLocations.isEmpty()) {
            List<String> fixedPackageLocations = new ArrayList<>();
            for (String packageLoc : packageLocations) {
                int index = packageLoc.indexOf("-") + 1;
                int endIndex = packageLoc.indexOf("-", index);
                if (endIndex == -1) {
                    endIndex = index - 1;
                    index = 0;
                }
                String name = packageLoc.substring(index, endIndex);
                index = packageLoc.lastIndexOf(".");
                String extension = packageLoc.substring(index);
                fixedPackageLocations.add(name + extension + '=' + prefix + packageLoc);
            }
            packageLocations = fixedPackageLocations;
        }
    }

    public String getDateTime() {
        return dateTime;
    }

    public int hashCode() {
        return dateTime.hashCode();
    }

    public boolean equals(BuildInfo other) {
        if (this == other) return true;
        if (other == null) return false;
        if (this.dateTime.equals(other.dateTime)) return true;
        return false;
    }
}