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
// tag::test[]
package it.io.openliberty.guides.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@TestMethodOrder(OrderAnnotation.class)
public class ConfigurationIT {

  private String port;
  private String baseUrl;
  private Client client;

  private final String INVENTORY_HOSTS = "inventory/systems";
  private final String USER_DIR = System.getProperty("user.dir");
  private final String DEFAULT_CONFIG_FILE = USER_DIR
      + "/src/main/resources/META-INF/microprofile-config.properties";
  private final String CUSTOM_CONFIG_FILE = USER_DIR.split("target")[0]
      + "/resources/CustomConfigSource.json";
  private final String INV_MAINTENANCE_PROP = "io_openliberty_guides"
      + "_inventory_inMaintenance";

  @BeforeEach
  // tag::setup[]
  public void setup() {
    port = System.getProperty("default.http.port");
    baseUrl = "http://localhost:" + port + "/";
    ConfigITUtil.setDefaultJsonFile(CUSTOM_CONFIG_FILE);

    client = ClientBuilder.newClient();
  }
  // end::setup[]

  @AfterEach
  public void teardown() {
    ConfigITUtil.setDefaultJsonFile(CUSTOM_CONFIG_FILE);
    client.close();
  }

  @Test
  @Order(1)
  // tag::testInitialServiceStatus[]
  public void testInitialServiceStatus() {
    boolean status = Boolean.valueOf(ConfigITUtil.readPropertyValueInFile(
        INV_MAINTENANCE_PROP, DEFAULT_CONFIG_FILE));
    if (!status) {
      Response response = ConfigITUtil.getResponse(client, baseUrl + INVENTORY_HOSTS);

      int expected = Response.Status.OK.getStatusCode();
      int actual = response.getStatus();
      assertEquals(expected, actual);
    } else {
      assertEquals(
         "{ \"error\" : \"Service is currently in maintenance."
         + "Contact: admin@guides.openliberty.io\" }",
          ConfigITUtil.getStringFromURL(client, baseUrl + INVENTORY_HOSTS),
          "The Inventory Service should be in maintenance");
    }
  }
  // end::testInitialServiceStatus[]

  @Test
  @Order(2)
  // tag::testPutServiceInMaintenance[]
  public void testPutServiceInMaintenance() {
    Response response = ConfigITUtil.getResponse(client, baseUrl + INVENTORY_HOSTS);

    int expected = Response.Status.OK.getStatusCode();
    int actual = response.getStatus();
    assertEquals(expected, actual);

    ConfigITUtil.switchInventoryMaintenance(CUSTOM_CONFIG_FILE, true);

    String error = ConfigITUtil.getStringFromURL(client, baseUrl + INVENTORY_HOSTS);

    assertEquals(
         "{ \"error\" : \"Service is currently in maintenance. "
         + "Contact: admin@guides.openliberty.io\" }",
        error, "The inventory service should be down in the end");
  }
  // end::testPutServiceInMaintenance[]

  @Test
  @Order(3)
  // tag::testChangeEmail[]
  public void testChangeEmail() {
    ConfigITUtil.switchInventoryMaintenance(CUSTOM_CONFIG_FILE, true);

    String error = ConfigITUtil.getStringFromURL(client, baseUrl + INVENTORY_HOSTS);

    assertEquals(
         "{ \"error\" : \"Service is currently in maintenance. "
         + "Contact: admin@guides.openliberty.io\" }",
        error, "The email should be admin@guides.openliberty.io in the beginning");

    ConfigITUtil.changeEmail(CUSTOM_CONFIG_FILE, "service@guides.openliberty.io");

    error = ConfigITUtil.getStringFromURL(client, baseUrl + INVENTORY_HOSTS);

    assertEquals(
         "{ \"error\" : \"Service is currently in maintenance. "
         + "Contact: service@guides.openliberty.io\" }",
        error, "The email should be service@guides.openliberty.io in the beginning");
  }
  // end::testChangeEmail[]

}
// end::test[]
