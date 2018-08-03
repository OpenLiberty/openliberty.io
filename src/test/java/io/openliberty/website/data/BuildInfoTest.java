package io.openliberty.website.data;

import static org.junit.Assert.*;

import org.junit.Test;

public class BuildInfoTest {

	@Test
	public void emptyReleaseInfo() {
		BuildInfo info = new BuildInfo();
		assertEquals("{}", info.asJsonObject().toString());
		assertNull(info.getDateTime());
	}

	@Test
	public void driverInfo() {
		BuildInfo info = new BuildInfo();
		info.addDriverLocation("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/openliberty-18.0.0.2.zip");
		assertEquals("{\"driver_location\":\"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/openliberty-18.0.0.2.zip\"}", info.asJsonObject().toString());
		assertNull(info.getDateTime());
	}

	@Test
	public void allInfo() {
		BuildInfo info = new BuildInfo();
		info.addDriverLocation("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/openliberty-18.0.0.2.zip");
		info.addVersion("18.0.0.2");
		info.addDateTime("2018-06-20_1913");
		info.addSizeInBytes("6050953");
		info.addTotalTests("8500");
		info.addTestPassed("8500");
		info.addBuildLog("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/gradle.log");
		info.addTestLog("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/open-liberty.unitTest.results.zip");
		info.addPackageLocation("javaee8.zip", "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/openliberty-javaee8-18.0.0.2.zip");
		info.addPackageLocation("webProfile8.zip", "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/openliberty-webProfile8-18.0.0.2.zip");
		assertEquals("{\"version\":\"18.0.0.2\",\"date_time\":\"2018-06-20_1913\",\"driver_location\":\"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/openliberty-18.0.0.2.zip\",\"size_in_bytes\":\"6050953\",\"total_tests\":\"8500\",\"test_passed\":\"8500\",\"build_log\":\"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/gradle.log\",\"tests_log\":\"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/open-liberty.unitTest.results.zip\",\"package_locations\":[\"javaee8.zip=https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/openliberty-javaee8-18.0.0.2.zip\",\"webProfile8.zip=https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2018-06-19_0502/openliberty-webProfile8-18.0.0.2.zip\"]}", info.asJsonObject().toString());

		assertEquals("2018-06-20_1913", info.getDateTime());
	}
}
