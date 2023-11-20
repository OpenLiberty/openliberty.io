// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
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

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import javax.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.reactivestreams.Publisher;

import io.openliberty.guides.models.PropertyMessage;
import io.openliberty.guides.models.SystemLoad;
import io.reactivex.rxjava3.core.Flowable;

@ApplicationScoped
public class SystemService {
    
    private static Logger logger = Logger.getLogger(SystemService.class.getName());

    private static final OperatingSystemMXBean osMean = 
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

    // tag::publishSystemLoad[]
    @Outgoing("systemLoad")
    // end::publishSystemLoad[]
    // tag::sendSystemLoad[]
    public Publisher<SystemLoad> sendSystemLoad() {
        // tag::flowableInterval[]
        return Flowable.interval(15, TimeUnit.SECONDS)
                .map((interval -> new SystemLoad(getHostname(),
                        osMean.getSystemLoadAverage())));
        // end::flowableInterval[]
    }
    // end::sendSystemLoad[]
    
    // tag::propertyRequest[]
    @Incoming("propertyRequest")
    // end::propertyRequest[]
    // tag::propertyResponse[]
    @Outgoing("propertyResponse")
    // end::propertyResponse[]
    // tag::sendProperty[]
    public PropertyMessage sendProperty(String propertyName) {
        logger.info("sendProperty: " + propertyName);
        if (propertyName == null || propertyName.isEmpty()) {
            logger.warning(propertyName == null ? "Null" : "An empty string"
                    + " is not System property.");
            return null;
        }
        return new PropertyMessage(getHostname(),
                propertyName,
                System.getProperty(propertyName, "unknown"));
    }
    // end::sendProperty[]
}