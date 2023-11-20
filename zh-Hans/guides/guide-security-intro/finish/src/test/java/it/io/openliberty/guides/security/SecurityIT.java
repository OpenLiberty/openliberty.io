// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2018, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.net.ssl.SSLContext;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.CookieSpecs;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SecurityIT {

    private static String urlHttp;
    private static String urlHttps;

    @BeforeEach
    public void setup() throws Exception {
        urlHttp = "http://localhost:" + System.getProperty("http.port");
        urlHttps = "https://localhost:" + System.getProperty("https.port");
        ITUtils.trustAll();
    }

    @Test
    // tag::testAuthenticationFail[]
    public void testAuthenticationFail() throws Exception {
        executeURL("/", "bob", "wrongpassword", true, -1, "Don't care");
    }
    // end::testAuthenticationFail[]

    @Test
    // tag::testAuthorizationForAdmin[]
    public void testAuthorizationForAdmin() throws Exception {
        executeURL("/", "bob", "bobpwd", false,
            HttpServletResponse.SC_OK, "admin, user");
    }
    // end::testAuthorizationForAdmin[]

    @Test
    // tag::testAuthorizationForUser[]
    public void testAuthorizationForUser() throws Exception {
        executeURL("/", "alice", "alicepwd", false,
            HttpServletResponse.SC_OK, "<title>User</title>");
    }
    // end::testAuthorizationForUser[]

    @Test
    // tag::testAuthorizationFail[]
    public void testAuthorizationFail() throws Exception {
        executeURL("/", "dave", "davepwd", false,
            HttpServletResponse.SC_FORBIDDEN, "Error 403: Authorization failed");
    }
    // end::testAuthorizationFail[]

    private void executeURL(
        String testUrl, String userid, String password,
        boolean expectLoginFail, int expectedCode, String expectedContent)
        throws Exception {

        // Use HttpClient to execute the testUrl by HTTP
        URI url = new URI(urlHttp + testUrl);
        HttpGet getMethod = new HttpGet(url);
        HttpClientBuilder clientBuilder = HttpClientBuilder.create();
        SSLContext sslContext = SSLContext.getDefault();
        clientBuilder.setSSLContext(sslContext);
        clientBuilder.setDefaultRequestConfig(
            RequestConfig.custom().setCookieSpec(CookieSpecs.STANDARD).build());
        HttpClient client = clientBuilder.build();
        HttpResponse response = client.execute(getMethod);

        // Response should be login.html
        String loginBody = EntityUtils.toString(response.getEntity(), "UTF-8");
        assertTrue(loginBody.contains("window.location.assign"),
            "Not redirected to home.html");
        String[] redirect = loginBody.split("'");

        // Use j_security_check to login
        HttpPost postMethod = new HttpPost(urlHttps + "/j_security_check");
        List<NameValuePair> nvps = new ArrayList<NameValuePair>();
        nvps.add(new BasicNameValuePair("j_username", userid));
        nvps.add(new BasicNameValuePair("j_password", password));
        postMethod.setEntity(new UrlEncodedFormEntity(nvps, "UTF-8"));
        response = client.execute(postMethod);
        assertEquals(HttpServletResponse.SC_FOUND,
            response.getStatusLine().getStatusCode(),
            "Expected " + HttpServletResponse.SC_FOUND + " status code for login");

        // Return if login fails
        if (expectLoginFail) {
            String location = response.getFirstHeader("Location").getValue();
            assertTrue(location.contains("error.html"),
                "Error.html was not returned");
            return;
        }

        // Use HttpClient to execute the redirected url
        url = new URI(urlHttps + redirect[1]);
        getMethod = new HttpGet(url);
        response = client.execute(getMethod);
        assertEquals(expectedCode, response.getStatusLine().getStatusCode(),
            "Expected " + expectedCode + " status code for login");

        // Return if not SC_OK
        if (expectedCode != HttpServletResponse.SC_OK) {
            return;
        }

        // Check the content of the response returned
        String actual = EntityUtils.toString(response.getEntity(), "UTF-8");
        assertTrue(actual.contains(userid),
            "The actual content did not contain the userid \"" + userid
            + "\". It was:\n" + actual);
        assertTrue(actual.contains(expectedContent),
            "The url " + testUrl + " did not return the expected content \""
            + expectedContent + "\"" + "The actual content was:\n" + actual);
    }

}
