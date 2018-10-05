package io.openliberty.website.mock;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;
import io.openliberty.website.DHEClient;

public class EmptyVersionsDHEClient extends DHEClient {

	@Override
	public JsonObject retrieveJSON(String url) {
		if (url.equals("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/info.json")) {
			JsonObjectBuilder runtimeReleaseVersions = Json.createObjectBuilder();
			runtimeReleaseVersions.add(Constants.VERSIONS, Json.createArrayBuilder().build());
			return runtimeReleaseVersions.build();
		}
		if (url.equals("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/info.json")) {
			JsonObjectBuilder runtimeReleaseVersions = Json.createObjectBuilder();
			runtimeReleaseVersions.add(Constants.VERSIONS, Json.createArrayBuilder().build());
			return runtimeReleaseVersions.build();
		}
		if (url.equals("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/release/info.json")) {
			JsonObjectBuilder runtimeReleaseVersions = Json.createObjectBuilder();
			runtimeReleaseVersions.add(Constants.VERSIONS, Json.createArrayBuilder().build());
			return runtimeReleaseVersions.build();
		}
		if (url.equals("https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/info.json")) {
			JsonObjectBuilder runtimeReleaseVersions = Json.createObjectBuilder();
			runtimeReleaseVersions.add(Constants.VERSIONS, Json.createArrayBuilder().build());
			return runtimeReleaseVersions.build();
		}
		return null;
	}

	@Override
	public String retrieveSize(String url) {
		return "1234";
	}
}
