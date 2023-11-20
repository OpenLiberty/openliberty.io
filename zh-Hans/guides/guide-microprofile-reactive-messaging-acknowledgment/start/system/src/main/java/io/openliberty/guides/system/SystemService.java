// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020, 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system;

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import javax.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;
import org.reactivestreams.Publisher;

import io.openliberty.guides.models.PropertyMessage;
import io.openliberty.guides.models.SystemLoad;
import io.reactivex.rxjava3.core.Flowable;

@ApplicationScoped
public class SystemService {

    private static Logger logger = Logger.getLogger(SystemService.class.getName());

    private static final OperatingSystemMXBean OS_MEAN =
            ManagementFactory.getOperatingSystemMXBean();
    private static String hostname = null;

    private static String getHostname() {
        if (hostname == null) {
            try {
                return InetAddress.getLocalHost().getHostName();
            } catch (UnknownHostException e) {
                return System.getenv("HOSTNAME");
            }
        }
        return hostname;
    }

    @Outgoing("systemLoad")
    public Publisher<SystemLoad> sendSystemLoad() {
        return Flowable.interval(15, TimeUnit.SECONDS)
                .map((interval -> new SystemLoad(getHostname(),
                        OS_MEAN.getSystemLoadAverage())));
    }

    // tag::sendProperty[]
    @Incoming("propertyRequest")
    @Outgoing("propertyResponse")
    public PublisherBuilder<PropertyMessage> sendProperty(String propertyName) {
        logger.info("sendProperty: " + propertyName);
        // tag::null[]
        String propertyValue = System.getProperty(propertyName);
        if (propertyValue == null) {
            logger.warning(propertyName + " is not System property.");
            // tag::returnEmpty[]
            return ReactiveStreams.empty();
            // end::returnEmpty[]
        }
        // end::null[]
        // tag::propertyMessage[]
        PropertyMessage message =
                new PropertyMessage(getHostname(),
                                    propertyName,
                                    System.getProperty(propertyName, "unknown"));
        return ReactiveStreams.of(message);
        // end::propertyMessage[]
    }
    // end::sendProperty[]
}
