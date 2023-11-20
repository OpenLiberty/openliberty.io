// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020, 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.inventory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Properties;

import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

// tag::KafkaProducer[]
import org.apache.kafka.clients.producer.KafkaProducer;
// end::KafkaProducer[]
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.microshed.testing.SharedContainerConfig;
import org.microshed.testing.jaxrs.RESTClient;
import org.microshed.testing.jupiter.MicroShedTest;
import org.microshed.testing.kafka.KafkaProducerClient;

import io.openliberty.guides.inventory.InventoryResource;
import io.openliberty.guides.models.SystemLoad;
import io.openliberty.guides.models.SystemLoad.SystemLoadSerializer;

@MicroShedTest
@SharedContainerConfig(AppContainerConfig.class)
@TestMethodOrder(OrderAnnotation.class)
// tag::InventoryServiceIT[]
public class InventoryServiceIT {

    // tag::RESTClient[]
    @RESTClient
    public static InventoryResource inventoryResource;
    // end::RESTClient[]

    // tag::KafkaProducer2[]
    // tag::KafkaProducerClient[]
    @KafkaProducerClient(valueSerializer = SystemLoadSerializer.class)
    // end::KafkaProducerClient[]
    public static KafkaProducer<String, SystemLoad> producer;
    // end::KafkaProducer2[]

    @AfterAll
    public static void cleanup() {
        inventoryResource.resetSystems();
    }

    // tag::testCpuUsage[]
    @Test
    public void testCpuUsage() throws InterruptedException {
        SystemLoad sl = new SystemLoad("localhost", 1.1);
        // tag::systemLoadTopic[]
        producer.send(new ProducerRecord<String, SystemLoad>("system.load", sl));
        // end::systemLoadTopic[]
        Thread.sleep(5000);
        Response response = inventoryResource.getSystems();
        List<Properties> systems =
                response.readEntity(new GenericType<List<Properties>>() { });
        // tag::assert[]
        Assertions.assertEquals(200, response.getStatus(),
                "Response should be 200");
        Assertions.assertEquals(systems.size(), 1);
        // end::assert[]
        for (Properties system : systems) {
            // tag::assert2[]
            Assertions.assertEquals(sl.hostname, system.get("hostname"),
                    "Hostname doesn't match!");
            // end::assert2[]
            BigDecimal systemLoad = (BigDecimal) system.get("systemLoad");
            // tag::assert3[]
            Assertions.assertEquals(sl.loadAverage, systemLoad.doubleValue(),
                    "CPU load doesn't match!");
            // end::assert3[]
        }
    }
    // end::testCpuUsage[]
}
// end::InventoryServiceIT[]
