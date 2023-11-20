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
// tag::SystemReadinessCheck[]
package io.openliberty.guides.system;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.health.Readiness;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;

// tag::Readiness[]
@Readiness
// end::Readiness[]
// tag::ApplicationScoped[]
@ApplicationScoped
// end::ApplicationScoped[]
public class SystemReadinessCheck implements HealthCheck {

  private static final String READINESS_CHECK = SystemResource.class.getSimpleName()
                                               + " Readiness Check";
  @Override
// tag::healthCheckResponse[]
  public HealthCheckResponse call() {
    // tag::defaultServer[]
    if (!System.getProperty("wlp.server.name").equals("defaultServer")) {
    // end::defaultServer[]
      // tag::HealthCheckResponse-DOWN[]
      // tag::HealthCheckResponse-named[]
      return HealthCheckResponse.down(READINESS_CHECK);
      // end::HealthCheckResponse-named[]
      // end::HealthCheckResponse-DOWN[]
    }
    // tag::HealthCheckResponse-UP[]
    return HealthCheckResponse.up(READINESS_CHECK);
    // end::HealthCheckResponse-UP[]
  }
// end::healthCheckResponse[]
}
// end::SystemReadinessCheck[]
