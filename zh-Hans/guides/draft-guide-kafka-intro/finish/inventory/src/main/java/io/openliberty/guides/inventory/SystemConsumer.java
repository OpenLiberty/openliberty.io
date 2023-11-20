// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.inventory;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;

public class SystemConsumer implements Runnable {
  private Consumer<String, String> consumer;
  private InventoryManager manager;

  // tag::offsetValue[]
  private final String OFFSET_RESET_CONFIG = "earliest";
  // end::offsetValue[]

  public SystemConsumer(InventoryManager manager, String kafkaServer, String groupIdPrefix) {
    Properties props = new Properties();
    // tag::serverConfig[]
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaServer);
    // end::serverConfig[]
    // tag::groupIdConfig[]
    props.put(ConsumerConfig.GROUP_ID_CONFIG, String.format("%s-%s", groupIdPrefix, UUID.randomUUID().toString()));
    // end::groupIdConfig[]
    // tag::keyDeserialConfig[]
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
    // end::keyDeserialConfig[]
    // tag::valueDeserialConfig[]
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
    // end::valueDeserialConfig[]
    // tag::offsetConfig[]
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, OFFSET_RESET_CONFIG);
    // end::offsetConfig[]

    // tag::consumerInstance[]
    this.consumer = new KafkaConsumer<>(props);
    // end::consumerInstance[]
    // tag::subscribe[]
    this.consumer.subscribe(Arrays.asList("system-topic"));
    // end::subscribe[]
    this.manager = manager;
  }

  // tag::consumeMessages[]
  public List<String> consumeMessages() {
    List<String> result = new ArrayList<String>();
    // tag::consumerPoll[]
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(3));
    // end::consumerPoll[]

    for (ConsumerRecord<String, String> record : records) {
      result.add(record.value());
    }
    // tag::commitAsync[]
    consumer.commitAsync();
    // end::commitAsync[]
    return result;
  }
  // end::consumeMessages[]

  @Override
  public void run() {
    while (true) {
      Jsonb jsonb = JsonbBuilder.create();
      List<Properties> propertiesList = consumeMessages()
          .stream()
          .map(m -> jsonb.fromJson(m, Properties.class))
          .collect(Collectors.toList());

      for (Properties p : propertiesList) {
        String hostname = p.getProperty("hostname");
        p.remove("hostname");

        if (manager.containsHostname(hostname)) {
          manager.updateSystem(hostname, p.getProperty("system.busy"));
        } else {
          manager.add(hostname, p);
        }
      }
    }
  }
}
