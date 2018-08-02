package io.openliberty.website;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import javax.json.JsonObject;
import javax.json.JsonValue.ValueType;

import org.junit.Test;

public class BuildsManagerTest {

	@Test
	public void testBuildsManager() {
		BuildsManager bm = new BuildsManager();
		JsonObject json = bm.getStatus();
		assertTrue(0 == json.get(Constants.LAST_UPDATE_ATTEMPT).getValueType().compareTo(ValueType.STRING));
		assertEquals("\""+Constants.NEVER_ATTEMPTED+"\"", json.get(Constants.LAST_UPDATE_ATTEMPT).toString());
		assertEquals("\""+Constants.NEVER_UPDATED+"\"", json.get(Constants.LAST_SUCCESSFULL_UPDATE).toString());
	}

}
