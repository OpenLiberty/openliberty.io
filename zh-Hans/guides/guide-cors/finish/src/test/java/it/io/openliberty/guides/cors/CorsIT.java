// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.cors;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.Map;
import java.util.Map.Entry;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class CorsIT {

    String port = System.getProperty("default.http.port");
    String pathToHost = "http://localhost:" + port + "/";

    @BeforeEach
    public void setUp() {
        // JVM does not allow restricted headers by default
        // Set to true for CORS testing
        System.setProperty("sun.net.http.allowRestrictedHeaders", "true");
    }

    // tag::testSimpleCorsRequest[]
    @Test
    public void testSimpleCorsRequest() throws IOException {
        HttpURLConnection connection = HttpUtils.sendRequest(
                        // tag::get[]
                        pathToHost + "configurations/simple", "GET",
                        // end::get[]
                        TestData.simpleRequestHeaders);
        checkCorsResponse(connection, TestData.simpleResponseHeaders);

        printResponseHeaders(connection, "Simple CORS Request");
    }
    // end::testSimpleCorsRequest[]

    // tag::testPreflightCorsRequest[]
    @Test
    public void testPreflightCorsRequest() throws IOException {
        HttpURLConnection connection = HttpUtils.sendRequest(
                        // tag::options[]
                        pathToHost + "configurations/preflight", "OPTIONS",
                        // end::options[]
                        TestData.preflightRequestHeaders);
        checkCorsResponse(connection, TestData.preflightResponseHeaders);

        printResponseHeaders(connection, "Preflight CORS Request");
    }
    // end::testPreflightCorsRequest[]

    public void checkCorsResponse(HttpURLConnection connection,
                    Map<String, String> expectedHeaders) throws IOException {
        assertEquals(200, connection.getResponseCode(), "Invalid HTTP response code");
        expectedHeaders.forEach((responseHeader, value) -> {
            assertEquals(value, connection.getHeaderField(responseHeader),
                            "Unexpected value for " + responseHeader + " header");
        });
    }

    public static void printResponseHeaders(HttpURLConnection connection,
                    String label) {
        System.out.println("--- " + label + " ---");
        Map<String, java.util.List<String>> map = connection.getHeaderFields();
        for (Entry<String, java.util.List<String>> entry : map.entrySet()) {
            System.out.println("Header " + entry.getKey() + " = " + entry.getValue());
        }
        System.out.println();
    }

}
