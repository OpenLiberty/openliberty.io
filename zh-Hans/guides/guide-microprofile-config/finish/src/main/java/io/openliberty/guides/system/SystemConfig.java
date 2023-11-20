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
package io.openliberty.guides.system;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

import jakarta.inject.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import io.openliberty.guides.config.Email;

@RequestScoped
public class SystemConfig {

  // tag::config[]
  @Inject
  @ConfigProperty(name = "io_openliberty_guides_system_inMaintenance")
  Provider<Boolean> inMaintenance;
  // end::config[]

  // tag::custom-converter[]
  @Inject
  @ConfigProperty(name = "io_openliberty_guides_email")
  private Provider<Email> email;
  // end::custom-converter[]

  public boolean isInMaintenance() {
    return inMaintenance.get();
  }

  // tag::getEmail[]
  public Email getEmail() {
    return email.get();
  }
  // end::getEmail[]

}
