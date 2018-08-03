package io.openliberty.website;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonString;
import javax.json.JsonValue;
import javax.json.JsonValue.ValueType;

import org.junit.Test;

import io.openliberty.website.mock.MockDHEClient;
import io.openliberty.website.mock.NullDHEClient;

public class BuildsManagerTest {

    private void assertJsonStringEqual(String expectedValue, JsonValue actualJsonValue) {
        assertEquals("JsonValue is not a JsonString type", 0,
                actualJsonValue.getValueType().compareTo(ValueType.STRING));
        assertEquals("JsonString is not of the expected value", expectedValue,
                ((JsonString) actualJsonValue).getString());
    }

    private void assertJsonStringNotEqual(String expectedToNotEqual, JsonValue actualJsonValue) {
        assertEquals("JsonValue is not a JsonString type", 0,
                actualJsonValue.getValueType().compareTo(ValueType.STRING));
        assertFalse("JsonString should not equal the expected value",
                expectedToNotEqual.equals(((JsonString) actualJsonValue).getString()));
    }

    @Test
    public void default_initialized_BuildManager() {
        BuildsManager bm = new BuildsManager();

        JsonObject status = bm.getStatus();
        assertJsonStringEqual(Constants.NEVER_ATTEMPTED, status.get(Constants.LAST_UPDATE_ATTEMPT));
        assertJsonStringEqual(Constants.NEVER_UPDATED, status.get(Constants.LAST_SUCCESSFULL_UPDATE));
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
        JsonObject status = bm.updateBuilds();

        assertEquals(status, bm.getStatus());

        assertJsonStringNotEqual(Constants.NEVER_ATTEMPTED, status.get(Constants.LAST_UPDATE_ATTEMPT));
        assertJsonStringEqual(Constants.NEVER_UPDATED, status.get(Constants.LAST_SUCCESSFULL_UPDATE));

        assertEquals("{}", bm.getBuilds().toString());
        assertEquals("{}", bm.getLatestReleases().toString());
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
        releaseInfo.add("date_time", Json.createValue(date_time));
        releaseInfo.add("size_in_bytes", Json.createValue("1234"));
        return releaseInfo.build();
    }

    @Test
    public void validate_state_of_BuildManager_after_successful_update() {
        BuildsManager bm = new BuildsManager(new MockDHEClient());
        JsonObject status = bm.updateBuilds();

        assertEquals(status, bm.getStatus());

        assertJsonStringNotEqual(Constants.NEVER_ATTEMPTED, status.get(Constants.LAST_UPDATE_ATTEMPT));
        assertJsonStringNotEqual(Constants.NEVER_UPDATED, status.get(Constants.LAST_SUCCESSFULL_UPDATE));

        JsonObject expectedReleases = getExpectedReleases();
        assertEquals(expectedReleases, bm.getLatestReleases());
        
        JsonObject expectedBuilds = getExpectedBuilds();
        assertEquals(expectedBuilds, bm.getBuilds());
        
    }

    private JsonObject getExpectedReleases() {
        JsonObjectBuilder expected = Json.createObjectBuilder();
        expected.add("runtime", createTestRelease("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release", "runtime-release-v1"));
        expected.add("tools", createTestRelease("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/release", "tools-release-v1"));
        return expected.build();
    }

}


