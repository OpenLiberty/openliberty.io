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

// tag::config-class[]
package io.openliberty.guides.inventory;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.inject.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class InventoryConfig {

  // tag::port-number[]
  @Inject
  @ConfigProperty(name = "io_openliberty_guides_port_number")
  private int portNumber;
  // end::port-number[]

  // tag::build-in-converter[]
  @Inject
  @ConfigProperty(name = "io_openliberty_guides_inventory_inMaintenance")
  private Provider<Boolean> inMaintenance;
  // end::build-in-converter[]

  // tag::isInMaintenance[]
  public boolean isInMaintenance() {
    return inMaintenance.get();
  }
  // end::isInMaintenance[]

  // tag::getPortNumber[]
  public int getPortNumber() {
    return portNumber;
  }
  // end::getPortNumber[]
}
// end::config-class[]
