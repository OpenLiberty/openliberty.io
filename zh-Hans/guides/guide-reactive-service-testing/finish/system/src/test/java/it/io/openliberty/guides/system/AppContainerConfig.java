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

import java.time.Duration;

import org.microshed.testing.SharedContainerConfiguration;
import org.microshed.testing.testcontainers.ApplicationContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Container;

// tag::AppContainerConfig[]
public class AppContainerConfig implements SharedContainerConfiguration {

    private static Network network = Network.newNetwork();

    // tag::container[]
    // tag::kafka[]
    @Container
    // end::container[]
    public static KafkaContainer kafka = new KafkaContainer()
                    .withNetwork(network);
    // end::kafka[]

    // tag::container2[]
    // tag::system[]
    @Container
    // end::container2[]
    public static ApplicationContainer system = new ApplicationContainer()
                    .withAppContextRoot("/")
                    .withExposedPorts(9083)
                    .withReadinessPath("/health/ready")
                    .withNetwork(network)
                    .withStartupTimeout(Duration.ofMinutes(3))
                    // tag::dependsOn[]
                    .dependsOn(kafka);
                    // end::dependsOn[]
    // end::system[]
}
// end::AppContainerConfig[]
