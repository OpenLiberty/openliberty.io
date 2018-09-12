package io.openliberty.website.data;

import static org.junit.Assert.*;

import org.junit.Test;

public class LatestReleasesTest {

	@Test
	public void no_releases() {
		LatestReleases latest = new LatestReleases();
		assertEquals("{}", latest.asJsonObject().toString());
	}

	@Test
	public void full_release_info() {
		BuildInfo runtime = new BuildInfo();
		BuildInfo tools = new BuildInfo();
		LatestReleases latest = new LatestReleases(runtime, tools);

		assertEquals("{\"runtime\":{},\"tools\":{}}", latest.asJsonObject().toString());
	}

}
