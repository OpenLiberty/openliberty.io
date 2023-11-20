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
package io.openliberty.guides.system;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.Random;
import java.util.stream.Collectors;

import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;

import io.openliberty.guides.models.Job;
import io.openliberty.guides.models.JobResult;

public class SystemRunnable implements Runnable {

    private SystemProducer producer;
    private Consumer<String, String> consumer;

    private final String CONSUMER_OFFSET_RESET = "earliest";

    public SystemRunnable(String kafkaServer, String groupId) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaServer);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, CONSUMER_OFFSET_RESET);

        this.consumer = new KafkaConsumer<>(props);
        this.consumer.subscribe(Arrays.asList("job-topic"));

        producer = new SystemProducer();
    }

    @Override
    public void run() {
        Random rand = new Random();
        Jsonb jsonb = JsonbBuilder.create();

        producer.sendMessage("system-topic", jsonb.toJson(getProperties(false)));

        while (true) {
            List<Job> jobs = consumeMessages().stream().map(m -> jsonb.fromJson(m, Job.class))
                    .collect(Collectors.toList());

            for (Job job : jobs) {
                producer.sendMessage("system-topic", jsonb.toJson(getProperties(true)));

                int sleepTimeSeconds = rand.nextInt(5) + 5; // 5 to 10
                int result = sleepTimeSeconds;

                try {
                    Thread.sleep(sleepTimeSeconds * 1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    JobResult jobResult = new JobResult();
                    jobResult.setJobId(job.getJobId());
                    jobResult.setResult(result);

                    producer.sendMessage("job-result-topic", jsonb.toJson(jobResult));
                }

                producer.sendMessage("system-topic", jsonb.toJson(getProperties(false)));
            }
        }
    }

    private Properties getProperties(boolean isBusy) {
        Properties props = (Properties) System.getProperties().clone();
        props.setProperty("hostname", Optional.ofNullable(System.getenv("HOSTNAME")).orElse("localhost"));
        props.setProperty("system.busy", Boolean.toString(isBusy));
        return props;
    }
    
    private List<String> consumeMessages() {
        List<String> result = new ArrayList<String>();
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(3000));

        for (ConsumerRecord<String, String> record : records) {
            result.add(record.value());
        }

        consumer.commitAsync();
        return result;
    }

}
