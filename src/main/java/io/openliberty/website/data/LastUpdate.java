package io.openliberty.website.data;

import java.util.Date;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;

public class LastUpdate {
	private static final int ONE_HOUR_MILLIS = 3600000;

	private Date lastAttempt;
	private Date lastSuccess;

	public String getLastUpdateAttempt() {
		return lastAttempt == null ? Constants.NEVER_ATTEMPTED : DateUtil.asUTCString(lastAttempt);
	}

	void setLastUpdateAttempt(Date date) {
		lastAttempt = date;
	}

	public String getLastSuccessfulUpdate() {
		return lastSuccess == null ? Constants.NEVER_UPDATED : DateUtil.asUTCString(lastSuccess);
	}

	public void markUpdateAttempt() {
		lastAttempt = new Date();
	}

	public void markSuccessfulUpdate() {
		lastSuccess = lastAttempt;
	}

	public JsonObject asJsonObject() {
		JsonObjectBuilder builder = Json.createObjectBuilder();
		builder.add(Constants.LAST_UPDATE_ATTEMPT, getLastUpdateAttempt());
		builder.add(Constants.LAST_SUCCESSFULL_UPDATE, getLastSuccessfulUpdate());
		return builder.build();
	}

	public boolean hasNeverSuccessfullyUpdated() {
		return lastSuccess == null;
	}

	/**
	 * Compare the current time with the time the last successful update completed.
	 * An update is needed if the last successful update was more than an hour ago.
	 */
	public boolean isUpdateNeeded() {
		boolean isBuildUpdateAllowed = true;

		if (lastSuccess != null) {
			long currentTime = new Date().getTime();
			long lastUpdateTime = lastSuccess.getTime();
			if ((currentTime - lastUpdateTime) < ONE_HOUR_MILLIS) {
				isBuildUpdateAllowed = false;
			}
		}

		return isBuildUpdateAllowed;
	}
}
