package io.openliberty.website.dheclient;

import static org.junit.Assert.assertNotNull;

import org.junit.Test;

import io.openliberty.website.data.BuildData;

public class DHEBuildsParserTest {

	@Test
	public void constructor() {
		DHEBuildParser parser = new DHEBuildParser();
		BuildData data = parser.getBuildData();
		assertNotNull(data.getLatestReleases());
		assertNotNull(data.getBuilds());
	}

}
