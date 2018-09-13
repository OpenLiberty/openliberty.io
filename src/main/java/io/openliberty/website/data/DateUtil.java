package io.openliberty.website.data;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class DateUtil {

	/**
	 * Returns a String for the given Date object in UTC time.
	 * Formatted as: "Thu Jan 01 00:00:00 UTC 1970"
	 *
	 * @param date
	 * @return A date formatted like "Thu Jan 01 00:00:00 UTC 1970"
	 */
	public static String asUTCString(Date date) {
		if (date == null) {
			return null;
		}
		final SimpleDateFormat sdf = new SimpleDateFormat("EEE MMM dd HH:mm:ss z yyyy", Locale.US);
		sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
		return sdf.format(date);
	}

}
