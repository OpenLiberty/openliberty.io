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

	public BuildInfo resolveLocations(String url, BuildType type, String dateTime) {
		if (this.dateTime == null) this.dateTime = dateTime;
		String prefix = url + type.getURISegment() + '/' + dateTime + '/';

		if (driverLocation != null) {
			driverLocation = prefix + driverLocation;
		}
		if (buildLog != null) {
			buildLog = prefix + buildLog;
		}

		if (testLog != null) {
			testLog = prefix + testLog;
		}
		
		if (packageLocations != null && !packageLocations.isEmpty()) {
			List<String> fixedPackageLocations = new ArrayList<>();
			for (String packageLoc : packageLocations) {
				int index = packageLoc.indexOf("-") + 1;
				int endIndex = packageLoc.indexOf("-", index);
				String name = packageLoc.substring(index, endIndex);
				index = packageLoc.lastIndexOf(".");
				String extension = packageLoc.substring(index);
				fixedPackageLocations.add(name + extension + '=' + prefix + packageLoc);
			}
			packageLocations = fixedPackageLocations;
		}
		return this;
	}

	public String getDateTime() {
		return dateTime;
	}
}