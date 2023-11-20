// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.bff.health;

import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;

public class BFFLivenessCheck implements HealthCheck  {

  private boolean isAlive() {
    return true;
  }

  @Override
  public HealthCheckResponse call() {
    boolean up = isAlive();
    return HealthCheckResponse.named(this.getClass().getSimpleName()).state(up).build();
  }

}
