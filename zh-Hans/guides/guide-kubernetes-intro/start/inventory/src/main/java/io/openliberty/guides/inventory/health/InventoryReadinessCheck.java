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
package io.openliberty.guides.inventory.health;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;
import io.openliberty.guides.inventory.InventoryResource;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;

// tag::Readiness[]
@Readiness
// end::Readiness[]
@ApplicationScoped
public class InventoryReadinessCheck implements HealthCheck {

    private static final String READINESS_CHECK = InventoryResource.class
                                                .getSimpleName()
                                                + " Readiness Check";

    @Inject
    @ConfigProperty(name = "SYS_APP_HOSTNAME")
    private String hostname;

    public HealthCheckResponse call() {
        if (isSystemServiceReachable()) {
            return HealthCheckResponse.up(READINESS_CHECK);
        } else {
            return HealthCheckResponse.down(READINESS_CHECK);
        }
    }

    private boolean isSystemServiceReachable() {
        try {
            Client client = ClientBuilder.newClient();
            client
                .target("http://" + hostname + ":9080/system/properties")
                .request()
                .post(null);

            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
