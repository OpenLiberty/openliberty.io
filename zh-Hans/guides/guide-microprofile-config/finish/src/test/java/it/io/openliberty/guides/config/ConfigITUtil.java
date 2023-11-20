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
package it.io.openliberty.guides.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.FileReader;
import java.io.IOException;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.core.Response;

/*
 * ===========================================================================
 *  HELPER METHODS
 * ===========================================================================
 *
 */
public class ConfigITUtil {
  private static final String EMAIL = "admin@guides.openliberty.io";
  private static final String TEST_CONFIG = "CustomSource";

  public static void setDefaultJsonFile(String source) {
    CustomConfig config = new CustomConfig(150, false, false, EMAIL, TEST_CONFIG);
    createJsonOverwrite(source, config);
  }

  /**
   * Change the inventory.inMaintenance value for the config source.
   */
  public static void switchInventoryMaintenance(String source, boolean newValue) {
    CustomConfig config = new CustomConfig(150, newValue, false, EMAIL, TEST_CONFIG);
    createJsonOverwrite(source, config);
  }

  /**
   * Change the email for the config source.
   */
  public static void changeEmail(String source, String newEmail) {
    CustomConfig config = new CustomConfig(150, true, false, newEmail, TEST_CONFIG);
    createJsonOverwrite(source, config);
  }

  public static void createJsonOverwrite(String source, CustomConfig config) {
    // Create Jsonb and serialize
    Jsonb jsonb = JsonbBuilder.create();
    String result = jsonb.toJson(config);
    overwriteFile(source, result);
  }

  /**
   * Read the property values from a local file.
   */
  public static String readPropertyValueInFile(String propName, String fileName) {
    String propValue = "";
    String line = "";
    try {
      File f = new File(fileName);
      if (f.exists()) {
        BufferedReader reader = new BufferedReader(new FileReader(f));
        while ((line = reader.readLine()) != null) {
          if (line.contains(propName)) {
            propValue = line.split("=")[1];
          }
        }
        reader.close();
        return propValue;
      } else {
        System.out.println("File " + fileName + " does not exist...");
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    return propValue;
  }

  /**
   * Overwrite a local file.
   */
  public static void overwriteFile(String fileName, String newContent) {
    try {
      File f = new File(fileName);
      if (f.exists()) {
        FileWriter fWriter = new FileWriter(f, false); // true to append
                                                       // false to overwrite.
        fWriter.write(newContent);
        fWriter.close();
        Thread.sleep(600);
      } else {
        System.out.println("File " + fileName + " does not exist");
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public static Response getResponse(Client client, String url) {
    Response response = client.target(url).request().get();
    return response;
  }

  public static String getStringFromURL(Client client, String url) {
    Response response = client.target(url).request().get();
    String result = response.readEntity(String.class);
    response.close();
    return result;
  }

}
