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

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.inject.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import io.openliberty.guides.config.Email;

@RequestScoped
public class InventoryConfig {

  // tag::port-number[]
  // tag::inject-port-number[]
  @Inject
  // end::inject-port-number[]
  // tag::guides-port-number[]
  @ConfigProperty(name = "io_openliberty_guides_port_number")
  // end::guides-port-number[]
  private int portNumber;

  // end::port-number[]
  // tag::build-in-converter[]
  // tag::inject-inMaintenance[]
  // tag::inject[]
  @Inject
  // end::inject[]
  // tag::configPropety[]
  @ConfigProperty(name = "io_openliberty_guides_inventory_inMaintenance")
  // end::configPropety[]
  // end::inject-inMaintenance[]
  private Provider<Boolean> inMaintenance;

  // end::build-in-converter[]
  // tag::custom-converter[]
  @Inject
  @ConfigProperty(name = "io_openliberty_guides_email")
  private Provider<Email> email;
  // end::custom-converter[]

  // tag::getPortNumber[]
  public int getPortNumber() {
    return portNumber;
  }
  // end::getPortNumber[]

  // tag::isInMaintenance[]
  public boolean isInMaintenance() {
    // tag::inMaintenanceGet[]
    return inMaintenance.get();
    // end::inMaintenanceGet[]
  }
  // end::isInMaintenance[]

  // tag::getEmail[]
  public Email getEmail() {
    return email.get();
  }
  // end::getEmail[]
}
// end::config-class[]
