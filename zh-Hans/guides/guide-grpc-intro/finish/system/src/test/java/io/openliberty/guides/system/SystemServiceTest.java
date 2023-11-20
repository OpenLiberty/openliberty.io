// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import io.grpc.ManagedChannel;
import io.grpc.Server;
import io.grpc.inprocess.InProcessChannelBuilder;
import io.grpc.inprocess.InProcessServerBuilder;
import io.grpc.stub.StreamObserver;
import io.openliberty.guides.systemproto.SystemProperties;
import io.openliberty.guides.systemproto.SystemProperty;
import io.openliberty.guides.systemproto.SystemPropertyName;
import io.openliberty.guides.systemproto.SystemPropertyPrefix;
import io.openliberty.guides.systemproto.SystemPropertyValue;
import io.openliberty.guides.systemproto.SystemServiceGrpc;
import io.openliberty.guides.systemproto.SystemServiceGrpc.SystemServiceBlockingStub;
import io.openliberty.guides.systemproto.SystemServiceGrpc.SystemServiceStub;

public class SystemServiceTest {

    private static final String SERVER_NAME = "system";

    private static Server inProcessServer;
    private static ManagedChannel inProcessChannel;
    private static SystemServiceBlockingStub blockingStub;
    private static SystemServiceStub asyncStub;

    @BeforeAll
    public static void setUp() throws Exception {
        // tag::inProcessServer[]
        inProcessServer = InProcessServerBuilder.forName(SERVER_NAME)
                              .addService(new SystemService())
                              .directExecutor()
                              .build();
        inProcessServer.start();
        // end::inProcessServer[]
        // tag::inProcessChannel[]
        inProcessChannel = InProcessChannelBuilder.forName(SERVER_NAME)
                               .directExecutor()
                               .build();
        // end::inProcessChannel[]
        // tag::blockingStub[]
        blockingStub = SystemServiceGrpc.newBlockingStub(inProcessChannel);
        // end::blockingStub[]
        // tag::asyncStub[]
        asyncStub = SystemServiceGrpc.newStub(inProcessChannel);
        // end::asyncStub[]
    }

    // tag::tearDown[]
    @AfterAll
    public static void tearDown() {
        inProcessChannel.shutdownNow();
        inProcessServer.shutdownNow();
    }
    // end::tearDown[]

    @Test
    // tag::testGetProperty[]
    public void testGetProperty() throws Exception {
        SystemPropertyName request = SystemPropertyName.newBuilder()
                                         .setPropertyName("os.name")
                                         .build();
        SystemPropertyValue response = blockingStub.getProperty(request);
        assertEquals(System.getProperty("os.name"), response.getPropertyValue());
    }
    // end::testGetProperty[]

    @Test
    // tag::testGetServerStreamingProperties[]
    public void testGetServerStreamingProperties() throws Exception {

        SystemPropertyPrefix request = SystemPropertyPrefix.newBuilder()
                                           .setPropertyPrefix("os.")
                                           .build();
        final CountDownLatch countDown = new CountDownLatch(1);
        List<SystemProperty> properties = new ArrayList<SystemProperty>();
        StreamObserver<SystemProperty> responseObserver =
            new StreamObserver<SystemProperty>() {
                @Override
                public void onNext(SystemProperty property) {
                    properties.add(property);
                }

                @Override
                public void onError(Throwable t) {
                    fail(t.getMessage());
                }

                @Override
                public void onCompleted() {
                    countDown.countDown();
                }
            };

        asyncStub.getServerStreamingProperties(request, responseObserver);
        assertTrue(countDown.await(10, TimeUnit.SECONDS));

        for (SystemProperty property : properties) {
            String propertName = property.getPropertyName();
            assertEquals(System.getProperty(propertName),
                property.getPropertyValue(), propertName + " is incorrect");
        }
    }
    // end::testGetServerStreamingProperties[]

    @Test
    // tag::testGetClientStreamingProperties[]
    public void testGetClientStreamingProperties() {

        @SuppressWarnings("unchecked")
        StreamObserver<SystemProperties> responseObserver =
            (StreamObserver<SystemProperties>) mock(StreamObserver.class);
        ArgumentCaptor<SystemProperties> systemPropertiesCaptor =
            ArgumentCaptor.forClass(SystemProperties.class);

        StreamObserver<SystemPropertyName> requestObserver =
            asyncStub.getClientStreamingProperties(responseObserver);
        List<String> keys = System.getProperties().stringPropertyNames().stream()
                                  .filter(k -> k.startsWith("user."))
                                  .collect(Collectors.toList());
        keys.stream()
            .map(k -> SystemPropertyName.newBuilder().setPropertyName(k).build())
            .forEach(requestObserver::onNext);
        requestObserver.onCompleted();
        verify(responseObserver, timeout(100)).onNext(systemPropertiesCaptor.capture());

        SystemProperties systemProperties = systemPropertiesCaptor.getValue();
        systemProperties.getPropertiesMap()
            .forEach((propertyName, propertyValue) ->
            assertEquals(System.getProperty(propertyName), propertyValue));
        verify(responseObserver, timeout(100)).onCompleted();
        verify(responseObserver, never()).onError(any(Throwable.class));
    }
    // end::testGetClientStreamingProperties[]

    @Test
    // tag::testGetBidirectionalProperties[]
    public void testGetBidirectionalProperties() {

        int timesOnNext = 0;

        @SuppressWarnings("unchecked")
        StreamObserver<SystemProperty> responseObserver =
            (StreamObserver<SystemProperty>) mock(StreamObserver.class);
        StreamObserver<SystemPropertyName> requestObserver =
            asyncStub.getBidirectionalProperties(responseObserver);

        verify(responseObserver, never()).onNext(any(SystemProperty.class));

        List<String> keys = System.getProperties().stringPropertyNames().stream()
                                  .filter(k -> k.startsWith("java."))
                                  .collect(Collectors.toList());

        for (int i = 0; i < keys.size(); i++) {
            SystemPropertyName spn = SystemPropertyName.newBuilder()
                                         .setPropertyName(keys.get(i))
                                         .build();
            requestObserver.onNext(spn);
            ArgumentCaptor<SystemProperty> systemPropertyCaptor =
                ArgumentCaptor.forClass(SystemProperty.class);
            verify(responseObserver, timeout(100).times(++timesOnNext))
                .onNext(systemPropertyCaptor.capture());
            SystemProperty systemProperty = systemPropertyCaptor.getValue();
            assertEquals(System.getProperty(systemProperty.getPropertyName()),
                         systemProperty.getPropertyValue());
        }

        requestObserver.onCompleted();
        verify(responseObserver, timeout(100)).onCompleted();
        verify(responseObserver, never()).onError(any(Throwable.class));
    }
    // end::testGetBidirectionalProperties[]
}
