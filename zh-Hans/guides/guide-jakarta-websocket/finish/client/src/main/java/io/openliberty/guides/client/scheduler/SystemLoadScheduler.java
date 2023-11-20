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
package io.openliberty.guides.client.scheduler;

import java.net.URI;
import java.util.Random;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.ejb.Schedule;
import jakarta.ejb.Singleton;

@Singleton
public class SystemLoadScheduler {

    private SystemClient client;
    // tag::messages[]
    private static final String[] MESSAGES = new String[] {
        "loadAverage", "memoryUsage", "both" };
    // end::messages[]

    // tag::postConstruct[]
    @PostConstruct
    public void init() {
        try {
            // tag::systemClient[]
            client = new SystemClient(new URI("ws://localhost:9081/systemLoad"));
            // end::systemClient[]
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    // end::postConstruct[]

    // tag::schedule[]
    @Schedule(second = "*/10", minute = "*", hour = "*", persistent = false)
    // end::schedule[]
    // tag::sendSystemLoad[]
    public void sendSystemLoad() {
        Random r = new Random();
        client.sendMessage(MESSAGES[r.nextInt(MESSAGES.length)]);
    }
    // end::sendSystemLoad[]

    @PreDestroy
    public void close() {
        client.close();
    }
}
