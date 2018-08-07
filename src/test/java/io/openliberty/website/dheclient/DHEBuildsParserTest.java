package io.openliberty.website.dheclient;

import static org.junit.Assert.*;

import org.junit.Test;

import io.openliberty.website.data.BuildData;
import io.openliberty.website.dheclient.DHEBuildParser;
import io.openliberty.website.mock.MockDHEClient;
import io.openliberty.website.mock.NullDHEClient;

public class DHEBuildsParserTest {

	@Test
	public void constructor() {
		DHEBuildParser parser = new DHEBuildParser(new NullDHEClient());
		BuildData data = parser.getBuildData();
		assertNotNull(data.getLatestReleases());
		assertNotNull(data.getBuilds());
	}

	@Test
	public void isAllowedToRun() {
		DHEBuildParser parser = new DHEBuildParser(new MockDHEClient());

		assertTrue("The first call to isBuildUpdateAllowed should always return true", parser.isBuildUpdateAllowed());
		assertTrue("The second call to isBuildUpdateAllowed should return true if no update has been attempted",
				parser.isBuildUpdateAllowed());

		parser.getBuildData();

		assertFalse("Calls to isBuildUpdateAllowed should return false if a successful update recently occurred",
				parser.isBuildUpdateAllowed());
	}

}
