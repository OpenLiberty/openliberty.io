package io.openliberty.website.data;

import java.util.Date;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;

public class LastUpdate {
	private Date lastAttempt;
	private Date lastSuccess;

	public String getLastUpdateAttempt() {
		return lastAttempt == null ? Constants.NEVER_ATTEMPTED : DateUtil.asUTCString(lastAttempt);
	}

	public void setLastUpdateAttempt(Date date) {
		lastAttempt = date;
	}

	public String getLastSuccessfulUpdate() {
		return lastSuccess == null ? Constants.NEVER_UPDATED : DateUtil.asUTCString(lastSuccess);
	}

	public void markSuccessfulUpdate() {
		lastSuccess = lastAttempt;
	}

	public Date lastSuccessfulUpdate() {
		return lastSuccess;
	}

	public JsonObject asJsonObject() {
		JsonObjectBuilder builder = Json.createObjectBuilder();
		builder.add(Constants.LAST_UPDATE_ATTEMPT, getLastUpdateAttempt());
		builder.add(Constants.LAST_SUCCESSFULL_UPDATE, getLastSuccessfulUpdate());
		return builder.build();
	}
}
