package io.openliberty.website.data;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import java.util.Date;

import javax.json.Json;
import javax.json.JsonObject;

import org.junit.Test;

import io.openliberty.website.Constants;

public class LastUpdateTest {

	@Test
	public void ctor() {
		LastUpdate lastUpdate = new LastUpdate();
		assertEquals(Constants.NEVER_ATTEMPTED, lastUpdate.getLastUpdateAttempt());
		assertEquals(Constants.NEVER_UPDATED, lastUpdate.getLastSuccessfulUpdate());
		assertNull(lastUpdate.lastSuccessfulUpdate());
	}

	@Test
	public void set_last_attempt() {
		LastUpdate lastUpdate = new LastUpdate();
		lastUpdate.setLastUpdateAttempt(new Date(1000));
		assertEquals("Thu Jan 01 00:00:01 UTC 1970", lastUpdate.getLastUpdateAttempt());
	}

	@Test
	public void set_last_success() {
		LastUpdate lastUpdate = new LastUpdate();
		lastUpdate.setLastUpdateAttempt(new Date(2000));
		lastUpdate.markSuccessfulUpdate();
		assertEquals("Thu Jan 01 00:00:02 UTC 1970", lastUpdate.getLastSuccessfulUpdate());
		assertEquals(new Date(2000), lastUpdate.lastSuccessfulUpdate());
	}

	@Test
	public void asJson_never_attempted() {
		LastUpdate lastUpdate = new LastUpdate();

		JsonObject expected = Json.createObjectBuilder().add(Constants.LAST_UPDATE_ATTEMPT, Constants.NEVER_ATTEMPTED)
				.add(Constants.LAST_SUCCESSFULL_UPDATE, Constants.NEVER_UPDATED).build();
		assertEquals(expected, lastUpdate.asJsonObject());

	}

}
