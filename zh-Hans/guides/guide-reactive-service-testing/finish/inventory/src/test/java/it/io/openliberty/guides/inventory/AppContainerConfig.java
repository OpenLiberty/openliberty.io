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
package it.io.openliberty.guides.inventory;

import java.time.Duration;

import org.microshed.testing.SharedContainerConfiguration;
import org.microshed.testing.testcontainers.ApplicationContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Container;

public class AppContainerConfig implements SharedContainerConfiguration {

    private static Network network = Network.newNetwork();

    @Container
    public static KafkaContainer kafka = new KafkaContainer()
                    .withNetwork(network);

    @Container
    public static ApplicationContainer inventory = new ApplicationContainer()
                    .withAppContextRoot("/")
                    .withExposedPorts(9085)
                    .withReadinessPath("/health/ready")
                    .withNetwork(network)
                    .withStartupTimeout(Duration.ofMinutes(3))
                    .dependsOn(kafka);
}
