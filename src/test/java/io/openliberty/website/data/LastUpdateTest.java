package io.openliberty.website.data;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.time.ZonedDateTime;
import java.util.Date;

import org.junit.Test;

import io.openliberty.website.Constants;

public class LastUpdateTest {

	@Test
	public void ctor() {
		LastUpdate lastUpdate = new LastUpdate();

		assertEquals(Constants.NEVER_ATTEMPTED, lastUpdate.getLastUpdateAttempt());
		assertEquals(Constants.NEVER_UPDATED, lastUpdate.getLastSuccessfulUpdate());
		assertTrue(lastUpdate.hasNeverSuccessfullyUpdated());
	}

	@Test
	public void setLastUpdateAttempt() {
		LastUpdate lastUpdate = new LastUpdate();
		lastUpdate.setLastUpdateAttempt(ZonedDateTime.of(1970, 1, 1, 0, 0, 1, 0, LastUpdate.UTC));

		assertEquals("Thu Jan 01 00:00:01 UTC 1970", lastUpdate.getLastUpdateAttempt());
		assertEquals(Constants.NEVER_UPDATED, lastUpdate.getLastSuccessfulUpdate());
		assertTrue(lastUpdate.hasNeverSuccessfullyUpdated());
	}

	@Test
	public void markUpdateAttempt() {
		LastUpdate lastUpdate = new LastUpdate();
		lastUpdate.markUpdateAttempt();

		@SuppressWarnings("deprecation")
		Date updated = new Date(lastUpdate.getLastUpdateAttempt());

		assertTrue(updated.getTime() <= new Date().getTime());
	}

	@Test
	public void markSuccessfulUpdate() {
		LastUpdate lastUpdate = new LastUpdate();
		lastUpdate.setLastUpdateAttempt(ZonedDateTime.of(1970, 1, 1, 0, 0, 2, 0, LastUpdate.UTC));
		lastUpdate.markSuccessfulUpdate();

		assertEquals("Thu Jan 01 00:00:02 UTC 1970", lastUpdate.getLastUpdateAttempt());
		assertEquals("Thu Jan 01 00:00:02 UTC 1970", lastUpdate.getLastSuccessfulUpdate());
		assertFalse(lastUpdate.hasNeverSuccessfullyUpdated());
	}

	@Test
	public void isUpdateNeeded_never_attempted() {
		LastUpdate lastUpdate = new LastUpdate();
		assertTrue(lastUpdate.isUpdateNeeded());
	}

	@Test
	public void isUpdateNeeded_never_updated() {
		LastUpdate lastUpdate = new LastUpdate();
		lastUpdate.markUpdateAttempt();
		assertTrue(lastUpdate.isUpdateNeeded());
	}

	@Test
	public void isUpdateNeeded_successfully_updated() {
		LastUpdate lastUpdate = new LastUpdate();
		lastUpdate.markUpdateAttempt();
		lastUpdate.markSuccessfulUpdate();
		assertFalse(lastUpdate.isUpdateNeeded());
	}

	@Test
	public void isUpdateNeeded_updated_over_an_hour_ago() {
		LastUpdate lastUpdate = new LastUpdate();
		lastUpdate.setLastUpdateAttempt(ZonedDateTime.of(1970, 1, 1, 0, 0, 2, 0, LastUpdate.UTC));
		lastUpdate.markSuccessfulUpdate();
		assertTrue(lastUpdate.isUpdateNeeded());
	}
}
