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
package it.io.openliberty.guides.inventory;

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;

// tag::GenericContainer[]
public class LibertyContainer extends GenericContainer<LibertyContainer> {
// end::GenericContainer[]

    public LibertyContainer(String imageName, int httpPort, int httpsPort) {

        super(imageName);
        // tag::addExposedPorts1[]
        addExposedPorts(httpPort, httpsPort);
        // end::addExposedPorts1[]

        // wait for smarter planet message by default
        // tag::waitingFor[]
        waitingFor(Wait.forLogMessage("^.*CWWKF0011I.*$", 1));
        // end::waitingFor[]

    }

    // tag::getBaseURL[]
    public String getBaseURL() throws IllegalStateException {
        return "http://" + getHost() + ":" + getFirstMappedPort();
    }
    // end::getBaseURL[]

}
