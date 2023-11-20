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
package io.openliberty.guides.inventory;

import java.io.IOException;
import java.net.URL;
import java.net.UnknownHostException;
import java.net.MalformedURLException;
import jakarta.ws.rs.ProcessingException;
import java.util.Properties;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.eclipse.microprofile.rest.client.RestClientBuilder;
import io.openliberty.guides.inventory.client.SystemClient;
import io.openliberty.guides.inventory.client.UnknownUrlException;
import io.openliberty.guides.inventory.client.ExceptionMapper;

public class InventoryUtils {

  private final String DEFAULT_PORT = System.getProperty("default.http.port", "9080");

  // tag::builder[]
  public Properties getProperties(String hostname)
          throws IOException {
    String customURLString = "http://" + hostname + ":" + DEFAULT_PORT + "/system";
    URL customURL;
    try {
      customURL = new URL(customURLString);
      SystemClient customRestClient = RestClientBuilder.newBuilder()
              .baseUrl(customURL)
              .register(
                      ExceptionMapper.class)
              .build(SystemClient.class);
      return customRestClient.getProperties();
    } catch (ProcessingException ex) {
      handleProcessingException(ex);
    } catch (UnknownUrlException e) {
      System.err.println("The given URL is unreachable.");
    } catch (MalformedURLException e) {
      System.err.println("The given URL is not formatted correctly.");
    }
    return null;
  }
  // end::builder[]

  public void handleProcessingException(ProcessingException ex)
  throws UnknownHostException {
    Throwable rootEx = ExceptionUtils.getRootCause(ex);
    if (rootEx instanceof UnknownHostException) {
      throw (UnknownHostException) rootEx;
    } else {
      throw ex;
    }
  }
}
