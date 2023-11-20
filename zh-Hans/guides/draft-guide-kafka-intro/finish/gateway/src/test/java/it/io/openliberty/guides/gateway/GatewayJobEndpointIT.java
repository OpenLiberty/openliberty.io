// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.gateway;

import static org.junit.Assert.assertEquals;

import javax.json.JsonObject;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.provider.jsrjsonp.JsrJsonpProvider;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.mockserver.client.MockServerClient;
import org.mockserver.junit.MockServerRule;
import org.mockserver.model.HttpRequest;
import org.mockserver.model.HttpResponse;

public class GatewayJobEndpointIT {

    private final String BASE_URL = "http://localhost:9080/api/jobs";

    private Client client;
    private Response response;

    @Rule
    public MockServerRule mockServerRule = new MockServerRule(this, 9082);
    
    private MockServerClient mockServerClient = mockServerRule.getClient();

    @Before
    public void setup() throws InterruptedException {
        response = null;
        client = ClientBuilder.newBuilder()
                    .hostnameVerifier(new HostnameVerifier() {
                        public boolean verify(String hostname, SSLSession session) {
                            return true;
                        }
                    })
                    .register(JsrJsonpProvider.class)
                    .build();

        mockServerClient
                    .when(HttpRequest.request()
                        .withMethod("GET")
                        .withPath("/jobs"))
                    .respond(HttpResponse.response()
                        .withStatusCode(200)
                        .withBody("{ \"results\": [ { \"jobId\": \"my-job-1\", \"result\": 7 }, { \"jobId\": \"my-job-2\", \"result\": 5 } ] } ")
                        .withHeader("Content-Type", "application/json"));

        mockServerClient
                    .when(HttpRequest.request()
                        .withMethod("POST")
                        .withPath("/jobs"))
                    .respond(HttpResponse.response()
                        .withStatusCode(200)
                        .withBody("{ \"jobId\": \"my-job-id\" }")
                        .withHeader("Content-Type", "application/json"));
    }

    @After
    public void teardown() {
        client.close();
    }
    
    // tag::testCreateJob[]
    @Test
    public void testCreateJob() throws InterruptedException {
        this.response = client
            .target(BASE_URL)
            .request()
            .post(null);

        assertEquals(200, response.getStatus());

        JsonObject obj = response.readEntity(JsonObject.class);
        String jobId = obj.getString("jobId");
        assertEquals("my-job-id", jobId);
    }
    // end::testCreateJob[]

    // tag::testGetJobs[]
    @Test
    public void testGetJobs() {
        this.response = client
            .target(BASE_URL)
            .request()
            .get();

        assertEquals(200, response.getStatus());

        JsonObject obj = response.readEntity(JsonObject.class);
        assertEquals(2, obj.getInt("count"));
        assertEquals(6.0, obj.getJsonNumber("averageResult").doubleValue(), 0.01);
        assertEquals(2, obj.getJsonArray("results").size());
    }
    // end::testGetJobs[]

}
