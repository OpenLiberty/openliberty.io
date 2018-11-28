package io.openliberty.website.mock;

import javax.json.JsonObject;

import io.openliberty.website.dheclient.DHEClient;

public class NullDHEClient extends DHEClient {

	@Override
	public JsonObject retrieveJSON(String url) {
		return null;
	}

	@Override
	public String retrieveSize(String url) {
		return null;
	}
}
