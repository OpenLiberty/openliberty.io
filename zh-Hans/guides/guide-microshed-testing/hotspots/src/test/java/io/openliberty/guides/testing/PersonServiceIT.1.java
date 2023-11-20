// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019, 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.testing;

// tag::importAssertNotNull[]
import static org.junit.jupiter.api.Assertions.assertNotNull;
// end::importAssertNotNull[]

import org.junit.jupiter.api.Test;
// tag::importInject[]
import org.microshed.testing.jaxrs.RESTClient;
// end::importInject[]
// tag::importMicroShedTest[]
import org.microshed.testing.jupiter.MicroShedTest;
// end::importMicroShedTest[]
// tag::importSharedContainerConfig[]
import org.microshed.testing.SharedContainerConfig;
// end::importSharedContainerConfig[]
// tag::importMPApp[]
import org.microshed.testing.testcontainers.ApplicationContainer;
// end::importMPApp[]
// tag::importContainer[]
import org.testcontainers.junit.jupiter.Container;
// end::importContainer[]

// tag::microShedTest[]
@MicroShedTest
// end::microShedTest[]
// tag::sharedContainerConfig[]
@SharedContainerConfig(AppDeploymentConfig.class)
// end::sharedContainerConfig[]
public class PersonServiceIT {

    // tag::inject[]
    @RESTClient
    // end::inject[]
    // tag::personSvc[]
    public static PersonService personSvc;
    // end::personSvc[]

    // tag::container[]
    @Container
    // end::container[]
    // tag::mpApp[]
    public static ApplicationContainer app = new ApplicationContainer()
                    // tag::withAppContextRoot[]
                    .withAppContextRoot("/guide-microshed-testing")
                    // end::withAppContextRoot[]
                    // tag::withReadinessPath[]
                    .withReadinessPath("/health/ready");
                    // end::withReadinessPath[]
    // end::mpApp[]

    @Test
    public void testCreatePerson() {
        // tag::testCreatePerson[]
        Long createId = personSvc.createPerson("Hank", 42);
        assertNotNull(createId);
        // end::testCreatePerson[]
    }

}
