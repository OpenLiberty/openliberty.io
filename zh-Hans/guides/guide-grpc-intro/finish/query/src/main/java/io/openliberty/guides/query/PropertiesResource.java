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
package io.openliberty.guides.query;

import java.util.List;
import java.util.Properties;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.stub.StreamObserver;
// tag::grpcImports[]
import io.openliberty.guides.systemproto.SystemProperties;
import io.openliberty.guides.systemproto.SystemProperty;
import io.openliberty.guides.systemproto.SystemPropertyName;
import io.openliberty.guides.systemproto.SystemPropertyPrefix;
import io.openliberty.guides.systemproto.SystemPropertyValue;
import io.openliberty.guides.systemproto.SystemServiceGrpc;
import io.openliberty.guides.systemproto.SystemServiceGrpc.SystemServiceBlockingStub;
import io.openliberty.guides.systemproto.SystemServiceGrpc.SystemServiceStub;
// end::grpcImports[]

@ApplicationScoped
@Path("/properties")
public class PropertiesResource {

    private static Logger logger = Logger.getLogger(PropertiesResource.class.getName());

    @Inject
    @ConfigProperty(name = "system.hostname", defaultValue = "localhost")
    String SYSTEM_HOST;

    @Inject
    @ConfigProperty(name = "system.port", defaultValue = "9080")
    int SYSTEM_PORT;

    // tag::unary[]
    @GET
    @Path("/{property}")
    @Produces(MediaType.TEXT_PLAIN)
    public String getPropertiesString(@PathParam("property") String property) {

        // tag::createChannel1[]
        ManagedChannel channel = ManagedChannelBuilder
                                     .forAddress(SYSTEM_HOST, SYSTEM_PORT)
                                     .usePlaintext().build();
        // end::createChannel1[]
        // tag::createClient1[]
        SystemServiceBlockingStub client = SystemServiceGrpc.newBlockingStub(channel);
        // end::createClient1[]
        SystemPropertyName request = SystemPropertyName.newBuilder()
                                             .setPropertyName(property).build();
        SystemPropertyValue response = client.getProperty(request);
        channel.shutdownNow();
        return response.getPropertyValue();
    }
    // end::unary[]

    // tag::serverStreaming[]
    @GET
    @Path("/os")
    @Produces(MediaType.APPLICATION_JSON)
    public Properties getOSProperties() {

        // tag::createChannel2[]
        ManagedChannel channel = ManagedChannelBuilder
                                     .forAddress(SYSTEM_HOST, SYSTEM_PORT)
                                     .usePlaintext().build();
        // end::createChannel2[]
        // tag::createClient2[]
        SystemServiceStub client = SystemServiceGrpc.newStub(channel);
        // end::createClient2[]

        Properties properties = new Properties();
        // tag::countDownLatch1[]
        CountDownLatch countDown = new CountDownLatch(1);
        // end::countDownLatch1[]
        SystemPropertyPrefix request = SystemPropertyPrefix.newBuilder()
                                         .setPropertyPrefix("os.").build();
        // tag::getServerStreamingProperties[]
        client.getServerStreamingProperties(
            request, new StreamObserver<SystemProperty>() {

            // tag::onNext1[]
            @Override
            public void onNext(SystemProperty value) {
                logger.info("server streaming received: "
                   + value.getPropertyName() + "=" + value.getPropertyValue());
                properties.put(value.getPropertyName(), value.getPropertyValue());
            }
            // end::onNext1[]

            @Override
            public void onError(Throwable t) {
                t.printStackTrace();
            }

            @Override
            public void onCompleted() {
                logger.info("server streaming completed");
                // tag::countDownLatch2[]
                countDown.countDown();
                // end::countDownLatch2[]
            }
        });
        // end::getServerStreamingProperties[]


        // wait until completed
        // tag::countDownLatch3[]
        try {
            countDown.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // end::countDownLatch3[]

        // tag::closeConnection[]
        channel.shutdownNow();
        // end::closeConnection[]

        return properties;
    }
    // end::serverStreaming[]

    // tag::clientStreaming[]
    @GET
    @Path("/user")
    @Produces(MediaType.APPLICATION_JSON)
    public Properties getUserProperties() {

        ManagedChannel channel = ManagedChannelBuilder
                                     .forAddress(SYSTEM_HOST, SYSTEM_PORT)
                                     .usePlaintext().build();
        SystemServiceStub client = SystemServiceGrpc.newStub(channel);
        // tag::countDownLatch4[]
        CountDownLatch countDown = new CountDownLatch(1);
        // end::countDownLatch4[]
        Properties properties = new Properties();

        // tag::getClientStreamingProperties[]
        StreamObserver<SystemPropertyName> stream = client.getClientStreamingProperties(
            new StreamObserver<SystemProperties>() {

                @Override
                public void onNext(SystemProperties value) {
                    logger.info("client streaming received a map that has "
                        + value.getPropertiesCount() + " properties");
                    properties.putAll(value.getPropertiesMap());
                }

                @Override
                public void onError(Throwable t) {
                    t.printStackTrace();
                }

                @Override
                public void onCompleted() {
                    logger.info("client streaming completed");
                    // tag::countDownLatch5[]
                    countDown.countDown();
                    // end::countDownLatch5[]
                }
            });
        // end::getClientStreamingProperties[]

        // collect the property names starting with user.
        // tag::collectUserProperties[]
        List<String> keys = System.getProperties().stringPropertyNames().stream()
                                  .filter(k -> k.startsWith("user."))
                                  .collect(Collectors.toList());
        // end::collectUserProperties[]

        // send messages to the server
        keys.stream()
            // tag::clientMessage1[]
            .map(k -> SystemPropertyName.newBuilder().setPropertyName(k).build())
            // end::clientMessage1[]
            // tag::streamOnNext1[]
            .forEach(stream::onNext);
            // end::streamOnNext1[]
        // tag::clientCompleted1[]
        stream.onCompleted();
        // end::clientCompleted1[]

        // wait until completed
        // tag::countDownLatch6[]
        try {
            countDown.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // end::countDownLatch6[]

        channel.shutdownNow();

        return properties;
    }
    // end::clientStreaming[]

    // tag::bidirectionalStreaming[]
    @GET
    @Path("/java")
    @Produces(MediaType.APPLICATION_JSON)
    public Properties getJavaProperties() {

        ManagedChannel channel = ManagedChannelBuilder
                                      .forAddress(SYSTEM_HOST, SYSTEM_PORT)
                                      .usePlaintext().build();
        SystemServiceStub client = SystemServiceGrpc.newStub(channel);
        Properties properties = new Properties();
        // tag::countDownLatch7[]
        CountDownLatch countDown = new CountDownLatch(1);
        // end::countDownLatch7[]

        // tag::getBidirectionalProperties[]
        StreamObserver<SystemPropertyName> stream = client.getBidirectionalProperties(
                new StreamObserver<SystemProperty>() {

                    // tag::onNext2[]
                    @Override
                    public void onNext(SystemProperty value) {
                        logger.info("bidirectional streaming received: "
                            + value.getPropertyName() + "=" + value.getPropertyValue());
                        properties.put(value.getPropertyName(),
                                       value.getPropertyValue());
                    }
                    // end::onNext2[]

                    @Override
                    public void onError(Throwable t) {
                        t.printStackTrace();
                    }

                    @Override
                    public void onCompleted() {
                        logger.info("bidirectional streaming completed");
                        // tag::countDownLatch8[]
                        countDown.countDown();
                        // end::countDownLatch8[]
                    }
                });
        // end::getBidirectionalProperties[]

        // collect the property names starting with java
        // tag::collectJavaProperties[]
        List<String> keys = System.getProperties().stringPropertyNames().stream()
                                  .filter(k -> k.startsWith("java."))
                                  .collect(Collectors.toList());
        // end::collectJavaProperties[]

        // post messages to the server
        keys.stream()
              // tag::clientMessage2[]
              .map(k -> SystemPropertyName.newBuilder().setPropertyName(k).build())
              // end::clientMessage2[]
              // tag::streamOnNext2[]
              .forEach(stream::onNext);
              // end::streamOnNext2[]
        // tag::clientCompleted2[]
        stream.onCompleted();
        // end::clientCompleted2[]

        // wait until completed
        // tag::countDownLatch9[]
        try {
            countDown.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // end::countDownLatch9[]

        channel.shutdownNow();

        return properties;
    }
    // end::bidirectionalStreaming[]
}
