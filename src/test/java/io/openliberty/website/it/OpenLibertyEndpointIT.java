/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial test
 *******************************************************************************/
package io.openliberty.website.it;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.microshed.testing.SharedContainerConfig;
import org.microshed.testing.jaxrs.RESTClient;
import org.microshed.testing.jupiter.MicroShedTest;
import org.microshed.testing.testcontainers.ApplicationContainer;
import org.testcontainers.junit.jupiter.Container;

import io.openliberty.website.OpenLibertyEndpoint;
import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.BuildType;
import io.openliberty.website.dheclient.BuildStore;

import java.net.URLConnection;
import java.net.HttpURLConnection;
import java.io.InputStream;

@MicroShedTest
@SharedContainerConfig(MockDHEContainer.class)
public class OpenLibertyEndpointIT {
    @Container
    public static ApplicationContainer app = new ApplicationContainer().withReadinessPath("/api/builds")
            .withEnv("build_sync_period_unit", TimeUnit.SECONDS.toString()).withEnv("build_sync_period", "1")
            .withMpRestClient(BuildStore.class, MockDHEContainer.getMockDHETarget());

    @RESTClient
    public static OpenLibertyEndpoint endpoint;

    private static URL latestVersionURL;
    private static HttpURLConnection httpURLConnection;

    @BeforeAll
    public static void init() {
        try {
            latestVersionURL = new URL("http", "localhost", app.getMappedPort(9080), "/latestVersion.js");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
    }
    
    @Test
    public void testNewReleaseCausesUpdate() throws InterruptedException, IOException {
        BuildData data = endpoint.builds();

        assertEquals("20.0.0.4", data.getLatestReleases().runtime.version, "The runtime release version is not correct");
        assertEquals("20.0.0.3", data.getLatestReleases().tools.version, "The tools release version is not correct");

        String latestVersions = readFromURL(latestVersionURL);

        assertTrue(latestVersions.contains("20.0.0.4"), "The latestVersions.js should contain 20.0.0.4 as the version. Contains: " + latestVersions);

        MockDHEContainer.addBuilds(BuildType.runtime_releases, "2020-05-01_1714");
 
        // Sleep for 2s to allow the update to be processed
        Thread.sleep(2000);

        data = endpoint.builds();

        assertEquals("20.0.0.5", data.getLatestReleases().runtime.version, "The runtime release version is not correct");

        latestVersions = readFromURL(latestVersionURL);

        assertTrue(latestVersions.contains("20.0.0.5"), "The latestVersions.js should contain 20.0.0.5 as the version. Contains: " + latestVersions);
    }

    @Test
    public void testDocsVersionNeverExists() throws IOException {
        httpURLConnection = getInvalidDocVersionResponse("https://openliberty.io/docs/22.0.0.15/overview.html");
        int responseCode = httpURLConnection.getResponseCode();
        BufferedReader in = new BufferedReader(new InputStreamReader(
        httpURLConnection.getErrorStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        String responseBody = response.toString();
        assertEquals(500,responseCode);
        assertTrue(responseBody.contains("com.ibm.ws.webcontainer.exception.IncludeFileNotFoundException") && responseBody.contains("SRVE0190E") && responseBody.contains("/docs/22.0.0.15/overview.html.gz"));
    }

    private static String readFromURL(URL url) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()));
        StringBuilder builder = new StringBuilder();

        String line;

        while ((line = reader.readLine()) != null) {
            builder.append(line);
            builder.append("\r\n");
        }

        return builder.toString();
    }

    private static HttpURLConnection getInvalidDocVersionResponse(String strUrl) throws IOException {
        URL url = new URL(strUrl);
        httpURLConnection = (HttpURLConnection) url.openConnection();
        httpURLConnection.setRequestMethod("GET");
        httpURLConnection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11");
        return httpURLConnection;
    }
}