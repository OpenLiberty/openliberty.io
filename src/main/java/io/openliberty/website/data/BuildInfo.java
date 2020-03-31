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
import java.util.List;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;

public class BuildInfo {
	private String version;
	private String dateTime;
	private String driverLocation;
	private String sizeInBytes;
	private String testPassed;
	private String totalTests;
	private String buildLog;
	private String testLog;
	private List<String> packageLocations;

	public JsonObject asJsonObject() {
		JsonObjectBuilder obj = Json.createObjectBuilder();
		if (version != null) {
			obj.add(Constants.VERSION, version);
		}
		if (dateTime != null) {
			obj.add(Constants.DATE, dateTime);
		}
		if (driverLocation != null) {
			obj.add(Constants.DRIVER_LOCATION, driverLocation);
		}
		if (sizeInBytes != null) {
			obj.add(Constants.SIZE_IN_BYTES, sizeInBytes);
		}
		if (totalTests != null) {
			obj.add(Constants.TOTAL_TESTS, totalTests);
		}
		if (testPassed != null) {
			obj.add(Constants.TESTS_PASSED, testPassed);
		}
		if (buildLog != null) {
			obj.add(Constants.BUILD_LOG, buildLog);
		}
		if (testLog != null) {
			obj.add(Constants.TESTS_LOG, testLog);
		}
		if (packageLocations != null) {
			obj.add(Constants.PACKAGE_LOCATIONS, Json.createArrayBuilder(packageLocations).build());
		}
		return obj.build();
	}

	public String getVersion() {
		return version;
	}

	public void addVersion(String version) {
		this.version = version;
	}

	public String getDateTime() {
		return dateTime;
	}

	public void addDateTime(String dateTime) {
		this.dateTime = dateTime;
	}

	public String getDriverLocation() {
		return driverLocation;
	}

	public void addDriverLocation(String driverLocation) {
		this.driverLocation = driverLocation;
	}

	public String getSizeInBytes() {
		return sizeInBytes;
	}

	public void addSizeInBytes(String sizeInBytes) {
		this.sizeInBytes = sizeInBytes;
	}

	public String getTestPassed() {
		return testPassed;
	}

	public void addTestPassed(String testPassed) {
		this.testPassed = testPassed;
	}

	public String getTotalTests() {
		return totalTests;
	}

	public void addTotalTests(String totalTests) {
		this.totalTests = totalTests;
	}

	public String getBuildLog() {
		return buildLog;
	}

	public void addBuildLog(String buildLog) {
		this.buildLog = buildLog;
	}

	public String getTestLog() {
		return testLog;
	}

	public void addTestLog(String testLog) {
		this.testLog = testLog;
	}

	public List<String> getPackageLocations() {
		return packageLocations;
	}

	public void addPackageLocation(String name, String location) {
		if (packageLocations == null) {
			packageLocations = new ArrayList<String>();
		}
		packageLocations.add(name + "=" + location);
	}

}
