package io.openliberty.website.dheclient;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.eclipse.microprofile.rest.client.RestClientBuilder;
import org.junit.jupiter.api.Test;

import io.openliberty.website.Constants;
import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.data.BuildType;
import io.openliberty.website.dheclient.data.BuildInfoMessageBodyReader;
import io.openliberty.website.dheclient.data.BuildListInfo;
import io.openliberty.website.dheclient.data.BuildListInfoMessageBodyReader;
import io.openliberty.website.mock.NullBuildStore;

public class DHEBuildsParserTest {

    @Test
    public void constructor() {
        DHEBuildParser parser = new DHEBuildParser(new NullBuildStore());
        BuildData data = parser.getBuildData();
        assertNotNull(data.getLatestReleases());
        assertNotNull(data.getBuilds());
    }

    // This test is @Ignored because it attempts to run against DHE live which will not return predictable results
    // It is kept in so it can be run for debug purposes.
    public void doRealStuff() {
        RestClientBuilder builder = RestClientBuilder.newBuilder().baseUri(URI.create(Constants.DHE_URL));
        builder.register(BuildInfoMessageBodyReader.class);
        builder.register(BuildListInfoMessageBodyReader.class);
        BuildStore client = builder.build(BuildStore.class);

        assertNotNull("The client is not null", client);

        BuildListInfo buildList = client.getBuildListInfo("runtime", "release");

        assertNotNull("The build list should not be null", buildList);
        assertNotNull("The versions in the build list should not be null", buildList.versions);

        List<String> versions = new ArrayList<>(buildList.versions);

        Collections.sort(versions, Comparator.reverseOrder());

        String version =  versions.iterator().next();
        
        BuildInfo bi = client.getBuildInfo("runtime", "release", version);

        assertNotNull("The build info should not be null", bi);
        assertEquals("The build version is not as expected", "20.0.0.3", bi.version);

        DHEBuildParser parser = new DHEBuildParser(client);
        BuildData data = parser.getBuildData();

        assertNotNull("Build data should be present", data);
        assertNotNull("Latest releases should not be null", data.getLatestReleases());
        assertNotNull("Runtime release should not be null", data.getLatestReleases().runtime);
        assertEquals("The version is wrong", "20.0.0.3", data.getLatestReleases().runtime.version);


        assertNotNull("The nightly tools build should be present", data.getBuilds().get(BuildType.tools_nightly_builds));
        assertFalse("There should be tools nightly builds: " + data.getBuilds().get(BuildType.tools_nightly_builds), data.getBuilds().get(BuildType.tools_nightly_builds).isEmpty());
    }
}
