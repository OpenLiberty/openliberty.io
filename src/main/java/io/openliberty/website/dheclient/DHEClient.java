package io.openliberty.website.dheclient;

import java.io.StringReader;

import javax.json.Json;
import javax.json.JsonObject;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import io.openliberty.website.Constants;

public class DHEClient {
	private Client client = null;

	public DHEClient() {
		client = ClientBuilder.newClient();
	}

	public JsonObject retrieveJSON(String url) {
		WebTarget target = client.target(url);
		Builder builder = target.request("application/json");
		Response response = builder.get();
		if (response.getStatus() == 200) {
			if (MediaType.APPLICATION_JSON_TYPE.equals(response.getMediaType())) {
				return response.readEntity(JsonObject.class);
			} else if (MediaType.TEXT_PLAIN_TYPE.equals(response.getMediaType())) {
				String responseBody = response.readEntity(String.class);
				return Json.createReader(new StringReader(responseBody)).readObject();
			}
		}
		return null;
	}

	public String retrieveSize(String url) {
		WebTarget target = client.target(url);
		Builder builder = target.request();
		Response response = builder.head();
		if (response.getStatus() == 200) {
			return response.getHeaderString(Constants.CONTENT_LENGTH);
		}
		return null;
	}

}
