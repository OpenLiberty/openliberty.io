/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.data;

import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;

public class LastUpdate {
	private static final int ONE_HOUR_MILLIS = 3600000;

	private Date lastAttempt;
	private Date lastSuccess;

	private static final Logger logger = Logger.getLogger(LastUpdate.class.getName());

	public String getLastUpdateAttempt() {
		if (logger.isLoggable(Level.FINER)) {
			//logger.info("getLastUpdateAttempt() " + lastAttempt);
			logger.log(Level.FINE, "getLastUpdateAttempt()", lastAttempt);
		}
		return lastAttempt == null ? Constants.NEVER_ATTEMPTED : DateUtil.asUTCString(lastAttempt);
	}

	void setLastUpdateAttempt(Date date) {
		lastAttempt = date;
	}

	public String getLastSuccessfulUpdate() {
		String result = lastSuccess == null ? Constants.NEVER_UPDATED : DateUtil.asUTCString(lastSuccess);
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("getLastSuccessfulUpdate() lastSuccessfulUpdate=" + result);
		}
		//return lastSuccess == null ? Constants.NEVER_UPDATED : DateUtil.asUTCString(lastSuccess);
		return result;
	}

	public void markUpdateAttempt() {	
		lastAttempt = new Date();
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("markUpdateAttempt() lastAttempt=" + lastAttempt);
		}
	}

	public void markSuccessfulUpdate() {	
		lastSuccess = lastAttempt;
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("markSuccessfulUpdate() lastSuccess=" + lastSuccess);
		}
	}

	public JsonObject asJsonObject() {
		JsonObjectBuilder builder = Json.createObjectBuilder();
		builder.add(Constants.LAST_UPDATE_ATTEMPT, getLastUpdateAttempt());
		builder.add(Constants.LAST_SUCCESSFULL_UPDATE, getLastSuccessfulUpdate());
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("asJsonObject() builder=" + builder);
		}
		return builder.build();
	}

	public boolean hasNeverSuccessfullyUpdated() {
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("isUpdateNeeded() " + (lastSuccess == null));
		}
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
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("isUpdateNeeded() " + isBuildUpdateAllowed);
		}

		return isBuildUpdateAllowed;
	}
}
