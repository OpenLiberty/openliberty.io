// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]

package it.io.openliberty.guides.config;

import jakarta.json.bind.annotation.JsonbProperty;

public class CustomConfig {
  private int config_ordinal;
  private boolean io_openliberty_guides_inventory_inMaintenance;
  private boolean io_openliberty_guides_system_inMaintenance;
  private String io_openliberty_guides_email;
  private String io_openliberty_guides_testConfigOverwrite;

  public CustomConfig(int ordinal, boolean inventory, boolean system, String email,
                      String testConfig) {
    this.setConfigOrdinal(ordinal);
    this.setInventoryInMaintenance(inventory);
    this.setSystemInMaintenance(system);
    this.setEmail(email);
    this.setTestConfigOverwrite(testConfig);
  }

  @JsonbProperty("config_ordinal")
  public int getConfigOrdinal() {
    return config_ordinal;
  }

  public void setConfigOrdinal(int configOrdinal) {
    this.config_ordinal = configOrdinal;
  }

  @JsonbProperty("io_openliberty_guides_inventory_inMaintenance")
  public boolean isInventoryInMaintenance() {
    return io_openliberty_guides_inventory_inMaintenance;
  }

  public void setInventoryInMaintenance(boolean inventoryInMaintenance) {
    this.io_openliberty_guides_inventory_inMaintenance =
    inventoryInMaintenance;
  }

  @JsonbProperty("io_openliberty_guides_system_inMaintenance")
  public boolean isSystemInMaintenance() {
    return io_openliberty_guides_system_inMaintenance;
  }

  public void setSystemInMaintenance(boolean systemInMaintenance) {
    this.io_openliberty_guides_system_inMaintenance =
    systemInMaintenance;
  }

  @JsonbProperty("io_openliberty_guides_email")
  public String getEmail() {
    return io_openliberty_guides_email;
  }

  public void setEmail(String email) {
    this.io_openliberty_guides_email = email;
  }

  @JsonbProperty("io_openliberty_guides_testConfigOverwrite")
  public String getTestConfigOverwrite() {
    return io_openliberty_guides_testConfigOverwrite;
  }

  public void setTestConfigOverwrite(String testConfigOverwrite) {
    this.io_openliberty_guides_testConfigOverwrite =
    testConfigOverwrite;
  }

}
