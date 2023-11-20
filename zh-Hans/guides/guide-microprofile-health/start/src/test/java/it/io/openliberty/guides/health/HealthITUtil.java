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
// tag::HealthTestUtil[]
package it.io.openliberty.guides.health;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;

import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Response;


public class HealthITUtil {

  private static String port;
  private static String baseUrl;
  public static final String INV_MAINTENANCE_FALSE =
  "io_openliberty_guides_inventory_inMaintenance\":false";
  public static final String INV_MAINTENANCE_TRUE =
  "io_openliberty_guides_inventory_inMaintenance\":true";

  static {
    port = System.getProperty("default.http.port");
    baseUrl = "http://localhost:" + port + "/";
  }

  public static JsonArray connectToHealthEnpoint(int expectedResponseCode,
      String endpoint) {
    String healthURL = baseUrl + endpoint;
    Client client = ClientBuilder.newClient();
    Response response = client.target(healthURL).request().get();
    assertEquals(expectedResponseCode, response.getStatus(),
        "Response code is not matching " + healthURL);
    JsonArray servicesStates = response.readEntity(JsonObject.class)
        .getJsonArray("checks");
    response.close();
    client.close();
    return servicesStates;
  }

  public static String getActualState(String service, JsonArray servicesStates) {
    String state = "";
    for (Object obj : servicesStates) {
      if (obj instanceof JsonObject) {
        if (service.equals(((JsonObject) obj).getString("name"))) {
          state = ((JsonObject) obj).getString("status");
        }
      }
    }
    return state;
  }

  public static void changeInventoryProperty(String oldValue, String newValue) {
    try {
      String fileName = System.getProperty("user.dir").split("target")[0]
          + "/resources/CustomConfigSource.json";
      BufferedReader reader = new BufferedReader(new FileReader(new File(fileName)));
      String line = "";
      String oldContent = "";
      String newContent = "";
      while ((line = reader.readLine()) != null) {
        oldContent += line + "\r\n";
      }
      reader.close();
      newContent = oldContent.replaceAll(oldValue, newValue);
      FileWriter writer = new FileWriter(fileName);
      writer.write(newContent);
      writer.close();
      Thread.sleep(600);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public static void cleanUp() {
    changeInventoryProperty(INV_MAINTENANCE_TRUE, INV_MAINTENANCE_FALSE);
  }

}
// end::HealthTestUtil[]
