package io.openliberty.website;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.List;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import org.junit.Test;

import io.openliberty.website.data.BuildLists;
import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.mock.EmptyVersionsDHEClient;
import io.openliberty.website.mock.MockDHEClient;
import io.openliberty.website.mock.NullDHEClient;

public class BuildsManagerTest {

    @Test
    public void default_initialized_BuildManager() {
        BuildsManager bm = new BuildsManager();

        LastUpdate status = bm.getStatus();
        assertEquals(Constants.NEVER_ATTEMPTED, status.getLastUpdateAttempt());
        assertEquals(Constants.NEVER_UPDATED, status.getLastSuccessfulUpdate());
    }

    @Test
    public void isAllowedToRun() {
        BuildsManager bm = new BuildsManager(new MockDHEClient());

        assertTrue("The first call to isBuildUpdateAllowed should always return true", bm.isBuildUpdateAllowed());
        assertTrue("The second call to isBuildUpdateAllowed should return true if no update has been attempted",
                bm.isBuildUpdateAllowed());

        bm.updateBuilds();

        assertFalse("Calls to isBuildUpdateAllowed should return false if a successful update recently occurred",
                bm.isBuildUpdateAllowed());
    }

    @Test
    public void validate_state_of_BuildManager_after_failed_update() {
        BuildsManager bm = new BuildsManager(new NullDHEClient());
        LastUpdate status = bm.updateBuilds();

        assertEquals(status, bm.getStatus());

        assertFalse(Constants.NEVER_ATTEMPTED.equals(status.getLastUpdateAttempt()));
        assertEquals(Constants.NEVER_UPDATED, status.getLastSuccessfulUpdate());

        BuildLists builds = bm.getBuilds();
        assertTrue(builds.getRuntimeReleases().isEmpty());
        assertTrue(builds.getRuntimeNightlyBuilds().isEmpty());
        assertTrue(builds.getToolsReleases().isEmpty());
        assertTrue(builds.getToolsNightlyBuilds().isEmpty());

        assertEquals("{}", bm.getLatestReleases().asJsonObject().toString());
    }

	@Test
	public void validate_state_of_BuildManager_with_no_releases() {
		BuildsManager bm = new BuildsManager(new EmptyVersionsDHEClient());
		LastUpdate status = bm.updateBuilds();

		assertEquals(status, bm.getStatus());

		assertFalse(Constants.NEVER_ATTEMPTED.equals(status.getLastUpdateAttempt()));
		assertEquals(Constants.NEVER_UPDATED, status.getLastSuccessfulUpdate());

        BuildLists builds = bm.getBuilds();
        assertTrue(builds.getRuntimeReleases().isEmpty());
        assertTrue(builds.getRuntimeNightlyBuilds().isEmpty());
        assertTrue(builds.getToolsReleases().isEmpty());
        assertTrue(builds.getToolsNightlyBuilds().isEmpty());

		assertEquals("{}", bm.getLatestReleases().asJsonObject().toString());
	}

    private JsonObject getExpectedBuilds() {
        JsonObjectBuilder expected = Json.createObjectBuilder();
        expected.add("runtime_releases", Json.createArrayBuilder().add(createTestRelease("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release", "runtime-release-v1")).build());
        expected.add("runtime_nightly_builds", Json.createArrayBuilder().add(createTestRelease("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly", "runtime-nightly-v1")).build());
        expected.add("tools_releases", Json.createArrayBuilder().add(createTestRelease("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/release", "tools-release-v1")).build());
        expected.add("tools_nightly_builds", Json.createArrayBuilder().add(createTestRelease("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly", "tools-nightly-v1")).build());
        return expected.build();
    }

    private JsonObject createTestRelease(String urlPath, String date_time) {
        JsonObjectBuilder releaseInfo = Json.createObjectBuilder();
        releaseInfo.add(Constants.VERSION, "v1");
        releaseInfo.add(Constants.BUILD_LOG, urlPath+"/"+date_time+"/build-log-path");
        releaseInfo.add(Constants.TESTS_LOG, urlPath+"/"+date_time+"/test-log-path");
        releaseInfo.add(Constants.DRIVER_LOCATION, urlPath+"/"+date_time+"/driver-location");
        releaseInfo.add(Constants.PACKAGE_LOCATIONS, Json.createArrayBuilder().add(Json.createValue("package="+urlPath+"/"+date_time+"/my-package-v1")).build());
        releaseInfo.add(Constants.TESTS_PASSED, "8500");
        releaseInfo.add(Constants.TOTAL_TESTS, "8501");
        releaseInfo.add("date_time", Json.createValue(date_time));
        releaseInfo.add("size_in_bytes", Json.createValue("1234"));
        return releaseInfo.build();
    }

    @Test
    public void validate_state_of_BuildManager_after_successful_update() {
        BuildsManager bm = new BuildsManager(new MockDHEClient());
        LastUpdate status = bm.updateBuilds();

        assertEquals(status, bm.getStatus());

        assertFalse(Constants.NEVER_ATTEMPTED.equals(status.getLastUpdateAttempt()));
        assertFalse(Constants.NEVER_UPDATED.equals(status.getLastSuccessfulUpdate()));

        JsonObject expectedReleases = getExpectedReleases();
        assertEquals(expectedReleases, bm.getLatestReleases().asJsonObject());

        JsonObject expectedBuilds = getExpectedBuilds();
        assertEquals(expectedBuilds, bm.getBuilds().asJsonObject());

        BuildLists all = bm.getBuilds();
        validBuildsList(all.getRuntimeReleases(), "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release", "runtime-release-v1");
        validBuildsList(all.getRuntimeNightlyBuilds(), "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly", "runtime-nightly-v1");
        validBuildsList(all.getToolsReleases(), "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/release", "tools-release-v1");
        validBuildsList(all.getToolsNightlyBuilds(), "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly", "tools-nightly-v1");
    }

	private void validBuildsList(List<BuildInfo> list, String urlPath, String date_time) {
		assertEquals(1, list.size());
        BuildInfo info = list.get(0);
        assertEquals(urlPath+"/"+date_time+"/build-log-path", info.getBuildLog());
        assertEquals(date_time, info.getDateTime());
        assertEquals(urlPath+"/"+date_time+"/driver-location", info.getDriverLocation());
        assertEquals("1234", info.getSizeInBytes());
        assertEquals(urlPath+"/"+date_time+"/test-log-path", info.getTestLog());
        assertEquals("8500", info.getTestPassed());
        assertEquals("8501", info.getTotalTests());
        assertEquals("v1", info.getVersion());
	}

    private JsonObject getExpectedReleases() {
        JsonObjectBuilder expected = Json.createObjectBuilder();
        expected.add("runtime", createTestRelease("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release", "runtime-release-v1"));
        expected.add("tools", createTestRelease("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/release", "tools-release-v1"));
        return expected.build();
    }

    @Test
    public void getData_after_failed_update() {
        BuildsManager bm = new BuildsManager(new NullDHEClient());
        BuildData data = bm.getData();
        assertEquals("{\"latest_releases\":{},\"builds\":{}}", data.asJsonObject().toString());
    }

}


