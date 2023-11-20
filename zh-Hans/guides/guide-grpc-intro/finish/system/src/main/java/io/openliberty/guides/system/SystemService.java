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
package io.openliberty.guides.system;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import io.grpc.stub.StreamObserver;
// tag::importGrpcClasses[]
import io.openliberty.guides.systemproto.SystemProperties;
import io.openliberty.guides.systemproto.SystemProperty;
import io.openliberty.guides.systemproto.SystemPropertyName;
import io.openliberty.guides.systemproto.SystemPropertyPrefix;
import io.openliberty.guides.systemproto.SystemPropertyValue;
import io.openliberty.guides.systemproto.SystemServiceGrpc;
// end::importGrpcClasses[]

// tag::extends[]
public class SystemService extends SystemServiceGrpc.SystemServiceImplBase {
// end::extends[]

    private static Logger logger = Logger.getLogger(SystemService.class.getName());

    public SystemService() {
    }

    // tag::getProperty[]
    @Override
    public void getProperty(
        SystemPropertyName request, StreamObserver<SystemPropertyValue> observer) {

        // tag::pName[]
        String pName = request.getPropertyName();
        // end::pName[]
        // tag::pValue[]
        String pValue = System.getProperty(pName);
        // end::pValue[]
        // tag::response[]
        SystemPropertyValue value = SystemPropertyValue
                                        .newBuilder()
                                        .setPropertyValue(pValue)
                                        .build();
        // end::response[]

        // tag::next[]
        observer.onNext(value);
        // end::next[]
        // tag::complete[]
        observer.onCompleted();
        // end::complete[]

    }
    // end::getProperty[]

    // tag::getServerStreamingProperties[]
    @Override
    public void getServerStreamingProperties(
        SystemPropertyPrefix request, StreamObserver<SystemProperty> observer) {

        // tag::prefix[]
        String prefix = request.getPropertyPrefix();
        // end::prefix[]
        System.getProperties()
              .stringPropertyNames()
              .stream()
              // tag::filter[]
              .filter(name -> name.startsWith(prefix))
              // end::filter[]
              .forEach(name -> {
                  String pValue = System.getProperty(name);
                  // tag::serverMessage[]
                  SystemProperty value = SystemProperty
                      .newBuilder()
                      .setPropertyName(name)
                      .setPropertyValue(pValue)
                      .build();
                  // end::serverMessage[]
                  // tag::serverNext1[]
                  observer.onNext(value);
                  // end::serverNext1[]
                  logger.info("server streaming sent property: " + name);
               });
        // tag::serverComplete[]
        observer.onCompleted();
        // end::serverComplete[]
        logger.info("server streaming was completed!");
    }
    // end::getServerStreamingProperties[]

    // tag::getClientStreamingProperties[]
    @Override
    public StreamObserver<SystemPropertyName> getClientStreamingProperties(
        StreamObserver<SystemProperties> observer) {

        // tag::streamObserverClient[]
        return new StreamObserver<SystemPropertyName>() {

            // tag::clientStreamingMap[]
            private Map<String, String> properties = new HashMap<String, String>();
            // end::clientStreamingMap[]

            // tag::receivingProperties[]
            @Override
            public void onNext(SystemPropertyName spn) {
                String pName = spn.getPropertyName();
                String pValue = System.getProperty(pName);
                logger.info("client streaming received property: " + pName);
                properties.put(pName, pValue);
            }
            // end::receivingProperties[]

            @Override
            public void onError(Throwable t) {
                t.printStackTrace();
            }

            // tag::clientStreamingCompleted[]
            @Override
            public void onCompleted() {
                SystemProperties value = SystemProperties.newBuilder()
                                             .putAllProperties(properties)
                                             .build();
                observer.onNext(value);
                observer.onCompleted();
                logger.info("client streaming was completed!");
            }
            // end::clientStreamingCompleted[]
        };
        // end::streamObserverClient[]
    }
    // end::getClientStreamingProperties[]

    // tag::getBidirectionalProperties[]
    @Override
    public StreamObserver<SystemPropertyName> getBidirectionalProperties(
        StreamObserver<SystemProperty> observer) {

        // tag::streamObserverBidirectional[]
        return new StreamObserver<SystemPropertyName>() {
            // tag::receiveBidirectionalProperties[]
            @Override
            public void onNext(SystemPropertyName spn) {
                String pName = spn.getPropertyName();
                String pValue = System.getProperty(pName);
                logger.info("bi-directional streaming received: " + pName);
                // tag::systemPropertyMessage[]
                SystemProperty value = SystemProperty.newBuilder()
                                           .setPropertyName(pName)
                                           .setPropertyValue(pValue)
                                           .build();
                // end::systemPropertyMessage[]
                // tag::serverNext2[]
                observer.onNext(value);
                // end::serverNext2[]
            }
            // end::receiveBidirectionalProperties[]

            @Override
            public void onError(Throwable t) {
                t.printStackTrace();
            }

            // tag::bidirectionalCompleted[]
            @Override
            public void onCompleted() {
                observer.onCompleted();
                logger.info("bi-directional streaming was completed!");
            }
            // end::bidirectionalCompleted[]
        };
        // end::streamObserverBidirectional[]
    }
    // end::getBidirectionalProperties[]
}
