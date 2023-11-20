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
package it.io.openliberty.guides.system;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.provider.jsrjsonp.JsrJsonpProvider;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class SystemEndpointTest {

    private static final String port = System.getProperty("test.http.port");
    private static final String BASE_URL = "http://localhost:" + port + "/system/properties";
    
    private Client client;

    @Before
    public void setup() throws InterruptedException {
        client = ClientBuilder.newBuilder()
                    .hostnameVerifier(new HostnameVerifier() {
                        public boolean verify(String hostname, SSLSession session) {
                            return true;
                        }
                    })
                    .register(JsrJsonpProvider.class)
                    .build();
    }

    @After
    public void teardown() {
        client.close();
    }

    @Test
    public void testGetProperties() {
    	Response response = client
            .target(BASE_URL)
            .request()
            .get();
        assertEquals(200, response.getStatus());
        
        String json = response.readEntity(String.class);
        assertTrue("The system property shuld contain os.name.",
        		json.contains("os.name"));
        
        response.close();
    }

}
