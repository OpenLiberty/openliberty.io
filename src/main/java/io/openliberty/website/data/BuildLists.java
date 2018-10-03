package io.openliberty.website.data;

import java.util.ArrayList;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;

public class BuildLists {
	List<BuildInfo> runtimeReleases = new ArrayList<BuildInfo>();
	List<BuildInfo> runtimeNightlyBuilds = new ArrayList<BuildInfo>();
	List<BuildInfo> toolsReleases = new ArrayList<BuildInfo>();
	List<BuildInfo> toolsNightlyBuilds = new ArrayList<BuildInfo>();

	public List<BuildInfo> getRuntimeReleases() {
		return runtimeReleases;
	}

	public void addRuntimeRelease(BuildInfo info) {
		runtimeReleases.add(info);
	}

	public void setRuntimeReleases(List<BuildInfo> list) {
		this.runtimeReleases = list;
	}

	public List<BuildInfo> getRuntimeNightlyBuilds() {
		return runtimeNightlyBuilds;
	}

	public void addRuntimeNightlyBuild(BuildInfo info) {
		runtimeNightlyBuilds.add(info);
	}

	public void setRuntimeNightlyBuilds(List<BuildInfo> list) {
		this.runtimeNightlyBuilds = list;
	}

	public List<BuildInfo> getToolsReleases() {
		return toolsReleases;
	}

	public void addToolsRelease(BuildInfo info) {
		toolsReleases.add(info);
	}

	public void setToolsReleases(List<BuildInfo> list) {
		this.toolsReleases = list;
	}

	public List<BuildInfo> getToolsNightlyBuilds() {
		return toolsNightlyBuilds;
	}

	public void addToolsNightlyBuild(BuildInfo info) {
		toolsNightlyBuilds.add(info);
	}

	public void setToolsNightlyBuild(List<BuildInfo> list) {
		this.toolsNightlyBuilds = list;
	}

	private JsonArray asJsonArray(List<BuildInfo> buildList) {
		JsonArrayBuilder array = Json.createArrayBuilder();
		for (BuildInfo info : buildList) {
			array.add(info.asJsonObject());
		}
		return array.build();
	}

	public JsonObject asJsonObject() {
		JsonObjectBuilder json = Json.createObjectBuilder();
		if (!runtimeReleases.isEmpty()) {
			json.add(Constants.RUNTIME_RELEASES, asJsonArray(runtimeReleases));
		}
		if (!runtimeNightlyBuilds.isEmpty()) {
			json.add(Constants.RUNTIME_NIGHTLY_BUILDS, asJsonArray(runtimeNightlyBuilds));
		}
		if (!toolsReleases.isEmpty()) {
			json.add(Constants.TOOLS_RELEASES, asJsonArray(toolsReleases));
		}
		if (!toolsNightlyBuilds.isEmpty()) {
			json.add(Constants.TOOLS_NIGHTLY_BUILDS, asJsonArray(toolsNightlyBuilds));
		}
		return json.build();
	}

}
