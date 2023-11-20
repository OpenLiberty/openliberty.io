// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.system;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.time.Duration;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.Test;
import org.microshed.testing.SharedContainerConfig;
import org.microshed.testing.jupiter.MicroShedTest;
import org.microshed.testing.kafka.KafkaConsumerClient;
import org.microshed.testing.kafka.KafkaProducerClient;

import io.openliberty.guides.models.PropertyMessage;
import io.openliberty.guides.models.PropertyMessage.PropertyMessageDeserializer;
import io.openliberty.guides.models.SystemLoad;
import io.openliberty.guides.models.SystemLoad.SystemLoadDeserializer;

@MicroShedTest
@SharedContainerConfig(AppContainerConfig.class)
public class SystemServiceIT {

    @KafkaConsumerClient(valueDeserializer = SystemLoadDeserializer.class,
            groupId = "system-load-status",
            topics = "system.load",
            properties = ConsumerConfig.AUTO_OFFSET_RESET_CONFIG + "=earliest")
    public static KafkaConsumer<String, SystemLoad> consumer;

    @KafkaConsumerClient(valueDeserializer = PropertyMessageDeserializer.class,
            groupId = "property-name", topics = "add.system.property",
            properties = ConsumerConfig.AUTO_OFFSET_RESET_CONFIG + "=earliest")
    public static KafkaConsumer<String, PropertyMessage> propertyConsumer;

    @KafkaProducerClient(valueSerializer = StringSerializer.class)
    public static KafkaProducer<String, String> propertyProducer;

    @Test
    public void testCpuStatus() {
        ConsumerRecords<String, SystemLoad> records =
                consumer.poll(Duration.ofMillis(30 * 1000));
        System.out.println("Polled " + records.count() + " records from Kafka:");

        for (ConsumerRecord<String, SystemLoad> record : records) {
            SystemLoad sl = record.value();
            System.out.println(sl);
            assertNotNull(sl.hostname);
            assertNotNull(sl.loadAverage);
        }
        consumer.commitAsync();
    }

    @Test
    public void testPropertyMessage() throws IOException, InterruptedException {
        propertyProducer.send(new ProducerRecord<String, String>(
                "request.system.property", "os.name"));

        ConsumerRecords<String, PropertyMessage> records =
                propertyConsumer.poll(Duration.ofMillis(30 * 1000));
        System.out.println("Polled " + records.count() + " records from Kafka:");
        assertTrue(records.count() > 0, "No records processed");
        for (ConsumerRecord<String, PropertyMessage> record : records) {
            PropertyMessage pm = record.value();
            System.out.println(pm);
            assertNotNull(pm.hostname);
            assertEquals("os.name", pm.key);
            assertNotNull(pm.value);
        }
        consumer.commitAsync();
    }

    @Test
    public void testInvalidPropertyMessage() {
        propertyProducer.send(new ProducerRecord<String, String>(
                "request.system.property", "null"));

        ConsumerRecords<String, PropertyMessage> records =
                propertyConsumer.poll(Duration.ofMillis(30 * 1000));
        System.out.println("Polled " + records.count() + " records from Kafka");
        assertTrue(records.count() == 0,
                "System service printed properties "
                + "of an invalid system property (null)");
    }
}
