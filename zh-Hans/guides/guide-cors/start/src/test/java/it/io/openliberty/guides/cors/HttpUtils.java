// tag::comment[]
/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::comment[]
package it.io.openliberty.guides.cors;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

public class HttpUtils {

    public static HttpURLConnection sendRequest(String path, String methods, Map<String, String> requestHeaders)
        throws IOException {
    	return getHttpConnection(new URL(path), methods, requestHeaders);
    }

    public static HttpURLConnection getHttpConnection(URL targetURL, String httpRequestMethod,
        Map<String, String> headers) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) targetURL.openConnection();
        Iterator<Entry<String, String>> entries = headers.entrySet().iterator();
        while (entries.hasNext()) {
            Entry<String, String> entry = entries.next();
            connection.setRequestProperty(entry.getKey(), entry.getValue());
        }
        connection.setRequestMethod(httpRequestMethod);
        return connection;
    }

}
