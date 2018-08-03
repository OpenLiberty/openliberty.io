package io.openliberty.website.data;

import java.util.ArrayList;
import java.util.List;

import javax.json.Json;
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

	public void addVersion(String version) {
		this.version = version;
	}

	public void addDriverLocation(String driverLocation) {
		this.driverLocation = driverLocation;
	}

	public void addDateTime(String dateTime) {
		this.dateTime = dateTime;
	}

	public void addSizeInBytes(String sizeInBytes) {
		this.sizeInBytes = sizeInBytes;
	}

	public void addTestPassed(String testPassed) {
		this.testPassed = testPassed;
	}

	public void addTotalTests(String totalTests) {
		this.totalTests = totalTests;
	}

	public void addBuildLog(String buildLog) {
		this.buildLog = buildLog;
	}

	public void addTestLog(String testLog) {
		this.testLog = testLog;
	}

	public void addPackageLocation(String name, String location) {
		if (packageLocations == null) {
			packageLocations = new ArrayList<String>();
		}
		packageLocations.add(name+"="+location);
	}

	public String getDateTime() {
		return dateTime;
	}

}
