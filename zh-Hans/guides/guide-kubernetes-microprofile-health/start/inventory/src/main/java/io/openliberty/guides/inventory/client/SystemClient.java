// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.inventory.client;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Invocation.Builder;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import java.util.Properties;
import java.net.URI;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@RequestScoped
public class SystemClient {

  // Constants for building URI to the system service.
  private final String SYSTEM_PROPERTIES = "/system/properties";
  private final String PROTOCOL = "http";

  @Inject
  @ConfigProperty(name = "default.http.port")
  String DEFAULT_PORT;

  // Wrapper function that gets properties
  public Properties getProperties(String hostname) {
    String url = buildUrl(PROTOCOL, hostname,
                         Integer.valueOf(DEFAULT_PORT), SYSTEM_PROPERTIES);
    Builder clientBuilder = buildClientBuilder(url);
    return getPropertiesHelper(clientBuilder);
  }

  // tag::doc[]
  /**
   * Builds the URI string to the system service for a particular host.
   * @param protocol
   *          - http or https.
   * @param host
   *          - name of host.
   * @param port
   *          - port number.
   * @param path
   *          - Note that the path needs to start with a slash!!!
   * @return String representation of the URI to the system properties service.
   */
  // end::doc[]
  protected String buildUrl(String protocol, String host, int port, String path) {
    try {
      URI uri = new URI(protocol, null, host, port, path, null, null);
      return uri.toString();
    } catch (Exception e) {
      System.err.println("Exception thrown while building the URL: " + e.getMessage());
      return null;
    }
  }

  // Method that creates the client builder
  protected Builder buildClientBuilder(String urlString) {
    try {
      Client client = ClientBuilder.newClient();
      Builder builder = client.target(urlString).request();
      return builder.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON);
    } catch (Exception e) {
      System.err.println("Exception thrown while building the client: "
                        + e.getMessage());
      return null;
    }
  }

  // Helper method that processes the request
  protected Properties getPropertiesHelper(Builder builder) {
    try {
      Response response = builder.get();
      if (response.getStatus() == Status.OK.getStatusCode()) {
        return response.readEntity(Properties.class);
      } else {
        System.err.println("Response Status is not OK.");
      }
    } catch (RuntimeException e) {
      System.err.println("Runtime exception: " + e.getMessage());
    } catch (Exception e) {
      System.err.println("Exception thrown while invoking the request: "
                         + e.getMessage());
    }
    return null;
  }

}
