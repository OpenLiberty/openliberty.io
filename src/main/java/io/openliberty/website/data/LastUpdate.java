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

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.json.bind.annotation.JsonbProperty;
import javax.json.bind.annotation.JsonbTransient;

import io.openliberty.website.Constants;

public class LastUpdate {
	private ZonedDateTime lastAttempt;
	private ZonedDateTime lastSuccess;

	private static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss z yyyy", Locale.US);
	public static ZoneId UTC = ZoneId.of("UTC");

	private static final Logger logger = Logger.getLogger(LastUpdate.class.getName());

	@JsonbProperty(Constants.LAST_UPDATE_ATTEMPT)
	public String getLastUpdateAttempt() {
		String result = lastAttempt == null ? Constants.NEVER_ATTEMPTED : lastAttempt.format(formatter);
		if (logger.isLoggable(Level.FINER)) {
			logger.log(Level.FINE, "getLastUpdateAttempt()", result);
		}
		return result;
	}

	/** Used by unit tests */
	void setLastUpdateAttempt(ZonedDateTime date) {
		lastAttempt = date;
	}

	@JsonbProperty(Constants.LAST_SUCCESSFULL_UPDATE)
	public String getLastSuccessfulUpdate() {
		String result = lastSuccess == null ? Constants.NEVER_UPDATED : lastSuccess.format(formatter);
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("getLastSuccessfulUpdate() " + result);
		}
		return result;
	}

	public void markUpdateAttempt() {
		lastAttempt = ZonedDateTime.now(UTC);
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("markUpdateAttempt() " + lastAttempt);
		}
	}

	public synchronized void markSuccessfulUpdate() {
		lastSuccess = lastAttempt;
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("markSuccessfulUpdate() " + lastSuccess);
		}
		notifyAll();
	}

	public boolean hasNeverSuccessfullyUpdated() {
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("hasNeverSuccessfullyUpdated() " + (lastSuccess == null));
		}
		return lastSuccess == null;
	}

	/**
	 * Compare the current time with the time the last successful update completed.
	 * An update is needed if the last successful update was more than an hour ago.
	 */
	@JsonbTransient
	public boolean isUpdateNeeded() {
		boolean isBuildUpdateAllowed = true;

		if (lastSuccess != null) {
			ZonedDateTime hourBeforeNow = ZonedDateTime.now(UTC).minusHours(1);
			ZonedDateTime lastUpdate = lastSuccess;

			isBuildUpdateAllowed = hourBeforeNow.isAfter(lastUpdate);

		}
		if (logger.isLoggable(Level.FINER)) {
			logger.fine("isUpdateNeeded() " + isBuildUpdateAllowed);
		}

		return isBuildUpdateAllowed;
	}

	public synchronized void awaitSuccessfulUpdate() {
		while (lastSuccess == null) {
			try {
				wait(5000);
			} catch (InterruptedException e) {
			}
		}
	}
}
