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
package it.io.openliberty.guides.system;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import jakarta.json.JsonObject;

@TestMethodOrder(OrderAnnotation.class)
public class SystemServiceIT {

    private static CountDownLatch countDown;

    // tag::testSystem[]
    @Test
    @Order(1)
    public void testSystem() throws Exception {
        startCountDown(1);
        URI uri = new URI("ws://localhost:9081/systemLoad");
        SystemClient client = new SystemClient(uri);
        client.sendMessage("both");
        countDown.await(5, TimeUnit.SECONDS);
        client.close();
        assertEquals(0, countDown.getCount(),
                "The countDown was not 0.");
    }
    // end::testSystem[]

    // tag::testSystemMultipleSessions[]
    @Test
    @Order(2)
    public void testSystemMultipleSessions() throws Exception {
        startCountDown(3);
        URI uri = new URI("ws://localhost:9081/systemLoad");
        SystemClient client1 = new SystemClient(uri);
        SystemClient client2 = new SystemClient(uri);
        SystemClient client3 = new SystemClient(uri);
        client2.sendMessage("loadAverage");
        countDown.await(5, TimeUnit.SECONDS);
        client1.close();
        client2.close();
        client3.close();
        assertEquals(0, countDown.getCount(),
            "The countDown was not 0.");
    }
    // end::testSystemMultipleSessions[]

    private static void startCountDown(int count) {
        countDown = new CountDownLatch(count);
    }

    public static void verify(JsonObject systemLoad) {
        assertNotNull(systemLoad.getString("time"));
        assertTrue(
            systemLoad.getJsonNumber("loadAverage") != null
            || systemLoad.getJsonNumber("memoryUsage") != null
        );
        countDown.countDown();
    }
}
