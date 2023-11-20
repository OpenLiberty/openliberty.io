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
package it.io.openliberty.guides.system;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
// tag::KafkaConsumer[]
import org.apache.kafka.clients.consumer.KafkaConsumer;
// end::KafkaConsumer[]
import org.junit.jupiter.api.Test;
import org.microshed.testing.SharedContainerConfig;
import org.microshed.testing.jupiter.MicroShedTest;
import org.microshed.testing.kafka.KafkaConsumerClient;

import io.openliberty.guides.models.SystemLoad;
import io.openliberty.guides.models.SystemLoad.SystemLoadDeserializer;

@MicroShedTest
@SharedContainerConfig(AppContainerConfig.class)
public class SystemServiceIT {

    private static final long POLL_TIMEOUT = 30 * 1000;

    // tag::KafkaConsumer2[]
    // tag::KafkaConsumerConfig[]
    // tag::valueDeserializer[]
    @KafkaConsumerClient(valueDeserializer = SystemLoadDeserializer.class,
    // end::valueDeserializer[]
                         groupId = "system-load-status",
                         // tag::systemLoadTopic[]
                         topics = "system.load",
                         // end::systemLoadTopic[]
                         properties = ConsumerConfig.AUTO_OFFSET_RESET_CONFIG
                                      + "=earliest")
    // end::KafkaConsumerConfig[]
    public static KafkaConsumer<String, SystemLoad> cpuConsumer;
    // end::KafkaConsumer2[]

    // tag::testCpuStatus[]
    @Test
    public void testCpuStatus() {
        // tag::poll[]
        ConsumerRecords<String, SystemLoad> records =
                cpuConsumer.poll(Duration.ofMillis(30 * 1000));
        // end::poll[]
        System.out.println("Polled " + records.count() + " records from Kafka:");
        assertTrue(records.count() > 0, "No records processed");

        for (ConsumerRecord<String, SystemLoad> record : records) {
            SystemLoad sl = record.value();
            System.out.println(sl);
            // tag::assert[]
            assertNotNull(sl.hostId);
            assertNotNull(sl.loadAverage);
            // end::assert[]
        }
        cpuConsumer.commitAsync();
    }
    // end::testCpuStatus[]
}
