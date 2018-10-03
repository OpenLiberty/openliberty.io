package io.openliberty.website.data;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import org.junit.Test;

public class BuildDataTest {

	@Test
	public void null_data() {
		BuildData data = new BuildData(null, null);

		assertEquals("{\"latest_releases\":{},\"builds\":{}}", data.asJsonObject().toString());

		assertNull(data.getLatestReleases());
		assertNull(data.getBuilds());
	}

	@Test
	public void empty_data() {
		LatestReleases latest = new LatestReleases();
		BuildLists builds = new BuildLists();
		BuildData data = new BuildData(latest, builds);

		assertEquals("{\"latest_releases\":{},\"builds\":{}}", data.asJsonObject().toString());

		assertEquals(latest, data.getLatestReleases());
		assertEquals(builds, data.getBuilds());
	}

}
