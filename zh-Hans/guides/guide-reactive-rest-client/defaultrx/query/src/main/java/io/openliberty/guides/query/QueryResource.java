// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.openliberty.guides.query.client.InventoryClient;

@ApplicationScoped
@Path("/query")
public class QueryResource {
    
    @Inject
    private InventoryClient inventoryClient;

    // tag::systemLoad[]
    @GET
    @Path("/systemLoad")
    @Produces(MediaType.APPLICATION_JSON)
    // tag::systemLoadMethod[]
    public Map<String, Properties> systemLoad() {
    // end::systemLoadMethod[]
        List<String> systems = inventoryClient.getSystems();
        // tag::countdownlatch[]
        CountDownLatch remainingSystems = new CountDownLatch(systems.size());
        // end::countdownlatch[]
        final Holder systemLoads = new Holder();

        for (String system : systems) {
            // tag::getsystem[]
            inventoryClient.getSystem(system)
            // end::getsystem[]
                           // tag::thenAcceptAsync[]
                           .thenAcceptAsync(p -> {
                                if (p != null) {
                                    systemLoads.updateValues(p);
                                }
                                // tag::countdown1[]
                                remainingSystems.countDown();
                                // end::countdown1[]
                           })
                           // end::thenAcceptAsync[]
                           // tag::exceptionally[]
                           .exceptionally(ex -> {
                                // tag::countdown2[]
                                remainingSystems.countDown();
                                // end::countdown2[]
                                ex.printStackTrace();
                                return null;
                           });
                           // end::exceptionally[]
        }

        // Wait for all remaining systems to be checked
        try {
            // tag::await[]
            remainingSystems.await(30, TimeUnit.SECONDS);
            // end::await[]
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return systemLoads.getValues();
    }
    // end::systemLoad[]

    private class Holder {
        // tag::volatile[]
        private volatile Map<String, Properties> values;
        // end::volatile[]

        public Holder() {
            // tag::concurrentHashMap[]
            this.values = new ConcurrentHashMap<String, Properties>();
            // end::concurrentHashMap[]
            init();
        }

        public Map<String, Properties> getValues() {
            return this.values;
        }

        public void updateValues(Properties p) {
            final BigDecimal load = (BigDecimal) p.get("systemLoad");

            this.values.computeIfPresent("lowest", (key, curr_val) -> {
                BigDecimal lowest = (BigDecimal) curr_val.get("systemLoad");
                return load.compareTo(lowest) < 0 ? p : curr_val;
            });
            this.values.computeIfPresent("highest", (key, curr_val) -> {
                BigDecimal highest = (BigDecimal) curr_val.get("systemLoad");
                return load.compareTo(highest) > 0 ? p : curr_val;
            });
        }

        private void init() {
            // Initialize highest and lowest values
            this.values.put("highest", new Properties());
            this.values.put("lowest", new Properties());
            this.values.get("highest").put("hostname", "temp_max");
            this.values.get("lowest").put("hostname", "temp_min");
            this.values.get("highest").put("systemLoad", new BigDecimal(Double.MIN_VALUE));
            this.values.get("lowest").put("systemLoad", new BigDecimal(Double.MAX_VALUE));
        }
    }
}