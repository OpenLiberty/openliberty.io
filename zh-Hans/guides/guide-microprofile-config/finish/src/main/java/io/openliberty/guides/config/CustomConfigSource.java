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
// tag::customConfig[]
package io.openliberty.guides.config;

import jakarta.json.stream.JsonParser;
import jakarta.json.stream.JsonParser.Event;
import jakarta.json.Json;
import java.math.BigDecimal;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import java.io.BufferedReader;
import java.io.FileReader;
import org.eclipse.microprofile.config.spi.ConfigSource;

/**
 * User-provided ConfigSources are dynamic.
 * The getProperties() method will be periodically invoked by the runtime
 * to retrieve up-to-date values. The frequency is controlled by
 * the microprofile.config.refresh.rate Java system property,
 * which is in milliseconds and can be customized.
 */
public class CustomConfigSource implements ConfigSource {

  String fileLocation = System.getProperty("user.dir").split("target")[0]
      + "resources/CustomConfigSource.json";

  @Override
  public int getOrdinal() {
    return Integer.parseInt(getProperties().get("config_ordinal"));
  }

  @Override
  public Set<String> getPropertyNames() {
    return getProperties().keySet();
  }

  @Override
  public String getValue(String key) {
    return getProperties().get(key);
  }

  @Override
  public String getName() {
    return "Custom Config Source: file:" + this.fileLocation;
  }

  // tag::getProperties[]
  public Map<String, String> getProperties() {
    Map<String, String> m = new HashMap<String, String>();
    String jsonData = this.readFile(this.fileLocation);
    JsonParser parser = Json.createParser(new StringReader(jsonData));
    String key = null;
    while (parser.hasNext()) {
      final Event event = parser.next();
      switch (event) {
      case KEY_NAME:
        key = parser.getString();
        break;
      case VALUE_STRING:
        String string = parser.getString();
        m.put(key, string);
        break;
      case VALUE_NUMBER:
        BigDecimal number = parser.getBigDecimal();
        m.put(key, number.toString());
        break;
      case VALUE_TRUE:
        m.put(key, "true");
        break;
      case VALUE_FALSE:
        m.put(key, "false");
        break;
      default:
        break;
      }
    }
    parser.close();
    return m;
  }
  // end::getProperties[]

  public String readFile(String fileName) {
    String result = "";
    try {
      BufferedReader br = new BufferedReader(new FileReader(fileName));
      StringBuilder sb = new StringBuilder();
      String line = br.readLine();
      while (line != null) {
        sb.append(line);
        line = br.readLine();
      }
      result = sb.toString();
      br.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
    return result;
  }
}
// end::customConfig[]
