package io.openliberty.website.data;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

public class BuildListsTest {

	@Test
	public void initial_construction() {
		BuildLists all = new BuildLists();
		assertEquals(0, all.getRuntimeReleases().size());
		assertEquals(0, all.getRuntimeNightlyBuilds().size());
		assertEquals(0, all.getToolsReleases().size());
		assertEquals(0, all.getToolsNightlyBuilds().size());

		assertEquals("{}", all.asJsonObject().toString());

		// It mmight be nice if this was the agreed-to return value
		// assertEquals(
		// "{\"runtime_releases\":[],\"runtime_nightly_builds\":[],\"tools_releases\":[],\"tools_nightly_builds\":[]}",
		// all.asJsonObject().toString());
	}

	@Test
	public void set_builds_info() {
		BuildLists all = new BuildLists();

		BuildInfo info = new BuildInfo();
		List<BuildInfo> list = new ArrayList<BuildInfo>();
		list.add(info);

		all.setRuntimeReleases(list);
		all.setRuntimeNightlyBuilds(list);
		all.setToolsReleases(list);
		all.setToolsNightlyBuild(list);

		assertEquals(1, all.getRuntimeReleases().size());
		assertEquals(info, all.getRuntimeReleases().get(0));

		assertEquals(1, all.getRuntimeNightlyBuilds().size());
		assertEquals(info, all.getRuntimeNightlyBuilds().get(0));

		assertEquals(1, all.getToolsReleases().size());
		assertEquals(info, all.getToolsReleases().get(0));

		assertEquals(1, all.getToolsNightlyBuilds().size());
		assertEquals(info, all.getToolsNightlyBuilds().get(0));
	}

	@Test
	public void populate_builds_info() {
		BuildLists all = new BuildLists();
		BuildInfo info = new BuildInfo();

		all.addRuntimeRelease(info);
		assertEquals(1, all.getRuntimeReleases().size());
		assertEquals(info, all.getRuntimeReleases().get(0));

		all.addRuntimeNightlyBuild(info);
		assertEquals(1, all.getRuntimeNightlyBuilds().size());
		assertEquals(info, all.getRuntimeNightlyBuilds().get(0));

		all.addToolsRelease(info);
		assertEquals(1, all.getToolsReleases().size());
		assertEquals(info, all.getToolsReleases().get(0));

		all.addToolsNightlyBuild(info);
		assertEquals(1, all.getToolsNightlyBuilds().size());
		assertEquals(info, all.getToolsNightlyBuilds().get(0));
	}

}
