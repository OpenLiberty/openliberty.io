// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system.health;

import java.time.LocalDateTime;

import io.openliberty.guides.system.SystemResource;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.health.Readiness;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;

@Readiness
@ApplicationScoped
public class SystemReadinessCheck implements HealthCheck {

    private static final int ALIVE_DELAY_SECONDS = 60;
    private static final String READINESS_CHECK = SystemResource.class.getSimpleName()
                                                 + " Readiness Check";
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
