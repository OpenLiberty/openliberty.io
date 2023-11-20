// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
// tag::ReadinessCheck[]
package io.openliberty.deepdive.rest.health;

import java.time.LocalDateTime;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.health.Readiness;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;

// tag::Readiness[]
@Readiness
// end::Readiness[]
// tag::ApplicationScoped[]
@ApplicationScoped
// end::ApplicationScoped[]
public class ReadinessCheck implements HealthCheck {

    private static final int ALIVE_DELAY_SECONDS = 10;
    private static final String READINESS_CHECK = "Readiness Check";
    private static LocalDateTime aliveAfter = LocalDateTime.now();

    @Override
    public HealthCheckResponse call() {
        if (isAlive()) {
            return HealthCheckResponse.up(READINESS_CHECK);
        }

        return HealthCheckResponse.down(READINESS_CHECK);
    }

    public static void setUnhealthy() {
        aliveAfter = LocalDateTime.now().plusSeconds(ALIVE_DELAY_SECONDS);
    }

    private static boolean isAlive() {
        return LocalDateTime.now().isAfter(aliveAfter);
    }
}
// end::ReadinessCheck[]
