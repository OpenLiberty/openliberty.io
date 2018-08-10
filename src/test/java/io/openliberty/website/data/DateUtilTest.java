package io.openliberty.website.data;

import static org.junit.Assert.*;

import java.util.Date;

import org.junit.Test;

public class DateUtilTest {

	@Test
	public void asUTC_null() {
		assertNull(DateUtil.asUTCString(null));
	}

	@Test
	public void asUTC_date_object() {
		assertEquals("Thu Jan 01 00:00:00 UTC 1970", DateUtil.asUTCString(new Date(0)));
	}
}
