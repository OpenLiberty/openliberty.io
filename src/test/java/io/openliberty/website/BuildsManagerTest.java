package io.openliberty.website;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;

import io.openliberty.website.data.BuildType;
import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.data.LatestReleases;
import io.openliberty.website.dheclient.DHEBuildParser;
import io.openliberty.website.mock.EmptyVersionsBuildStore;
import io.openliberty.website.mock.MockBuildStore;
import io.openliberty.website.mock.NullBuildStore;

public class BuildsManagerTest {

    @Test
    public void validate_state_of_BuildManager_after_failed_update() {
        BuildsManager bm = new BuildsManager(new DHEBuildParser(new NullBuildStore()));

        Map<BuildType, Set<BuildInfo>> builds = bm.getBuilds();
        assertTrue(builds.get(BuildType.runtime_releases).isEmpty());
        assertTrue(builds.get(BuildType.runtime_betas).isEmpty());        
        assertTrue(builds.get(BuildType.runtime_nightly_builds).isEmpty());
        assertTrue(builds.get(BuildType.tools_releases).isEmpty());
        assertTrue(builds.get(BuildType.tools_nightly_builds).isEmpty());
    }

    @Test
    public void validate_state_of_BuildManager_with_no_releases() {
        BuildsManager bm = new BuildsManager(new DHEBuildParser(new EmptyVersionsBuildStore()));

        Map<BuildType, Set<BuildInfo>> builds = bm.getBuilds();
        assertTrue(builds.get(BuildType.runtime_releases).isEmpty());
        assertTrue(builds.get(BuildType.runtime_betas).isEmpty());        
        assertTrue(builds.get(BuildType.runtime_nightly_builds).isEmpty());
        assertTrue(builds.get(BuildType.tools_releases).isEmpty());
        assertTrue(builds.get(BuildType.tools_nightly_builds).isEmpty());
    }

    @Test
    public void validate_state_of_BuildManager_after_successful_update() {
        BuildsManager bm = new BuildsManager(new DHEBuildParser(new MockBuildStore()));
        bm.getStatus().awaitSuccessfulUpdate();
        
        LastUpdate status = bm.getStatus();

        assertFalse(Constants.NEVER_ATTEMPTED.equals(status.getLastUpdateAttempt()));
        assertFalse(Constants.NEVER_UPDATED.equals(status.getLastSuccessfulUpdate()));

        LatestReleases lr = bm.getLatestReleases();

        assertEquals("The most recent runtime release should be 20.0.0.3", "20.0.0.3", lr.runtime.version);
        assertEquals("The most recent runtime release should be 20.0.0.3", "20.0.0.3", lr.tools.version);
        assertEquals("The date and time for the most recent release is not right", "2020-03-05_1433", lr.runtime.dateTime);

        assertEquals("The driver location is not resolved", "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2020-03-05_1433/openliberty-20.0.0.3.zip", lr.runtime.driverLocation);
        assertEquals("The build log is not resolved", "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2020-03-05_1433/gradle.log", lr.runtime.buildLog);
        assertEquals("The test log is not resolved", "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2020-03-05_1433/open-liberty.unitTest.results.zip", lr.runtime.testLog);
        assertEquals("The first package location is not resolved", "javaee8.zip=https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2020-03-05_1433/openliberty-javaee8-20.0.0.3.zip", lr.runtime.packageLocations.get(0));

    }

    @Test
    public void getData_after_failed_update() {
        BuildsManager bm = new BuildsManager(new DHEBuildParser(new NullBuildStore()));
        BuildData data = bm.getData();

        assertNotNull("The build data should not be null", data);
        assertNotNull("The latest releases should not be null", data.getLatestReleases());
        assertNull("The latest runtime release should be null", data.getLatestReleases().runtime);
        assertNull("The latest tools release should be null", data.getLatestReleases().tools);
        assertNotNull("The builds list should be empty", data.getBuilds());
    }

}


