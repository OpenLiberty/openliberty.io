package io.openliberty.website.data;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;

public class LatestReleases {
	private BuildInfo runtime;
	private BuildInfo tools;

	public LatestReleases() {
	}

	public LatestReleases(BuildInfo runtime, BuildInfo tools) {
		this.runtime = runtime;
		this.tools = tools;
	}

	public JsonObject asJsonObject() {
		JsonObjectBuilder json = Json.createObjectBuilder();
		if (runtime != null) {
			json.add(Constants.RUNTIME, runtime.asJsonObject());
		}
		if (tools != null) {
			json.add(Constants.TOOLS, tools.asJsonObject());
		}
		return json.build();
	}

}
