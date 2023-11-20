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
package it.io.openliberty.sample;

import static org.junit.jupiter.api.Assertions.assertEquals;

import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.Test;

public class PropertiesEndpointIT {

  @Test
  public void testGetProperties() {

      // system properties
      String port = System.getProperty("http.port");
      String contextRoot = System.getProperty("context.root", "/");
      String url = "http://localhost:" + port + contextRoot;

      // client setup
      Client client = ClientBuilder.newClient();

      // request
      WebTarget target = client.target(url + "/system/properties");
      Response response = target.request().get();

      // response
      assertEquals(200, response.getStatus(), "Incorrect response code from " + url);

      JsonObject obj = response.readEntity(JsonObject.class);

      response.close();
      client.close();
  }

}
