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

import static org.junit.jupiter.api.Assertions.assertThrows;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;

import org.junit.jupiter.api.Test;
import org.microshed.testing.jupiter.MicroShedTest;
// tag::importSharedContainerConfig[]
import org.microshed.testing.SharedContainerConfig;
// end::importSharedContainerConfig[]
// tag::importMPApp[]
import org.microshed.testing.testcontainers.ApplicationContainer;
// end::importMPApp[]
// tag::importContainer[]
import org.testcontainers.junit.jupiter.Container;
// end::importContainer[]
import org.microshed.testing.jaxrs.RESTClient;

@MicroShedTest
// tag::sharedContainerConfig[]
@SharedContainerConfig(AppDeploymentConfig.class)
// end::sharedContainerConfig[]
public class ErrorPathIT {

    // tag::container[]
    @Container
    public static ApplicationContainer app = new ApplicationContainer()
                    .withAppContextRoot("/guide-microshed-testing")
                    .withReadinessPath("/health/ready");
    // end::container[]

    // tag::personSvc[]
    @RESTClient
    public static PersonService personSvc;
    // end::personSvc[]

    @Test
    public void testGetUnknownPerson() {
        assertThrows(NotFoundException.class, () -> personSvc.getPerson(-1L));
    }

    @Test
    public void testCreateBadPersonNullName() {
        assertThrows(BadRequestException.class, () -> personSvc.createPerson(null, 5));
    }

    @Test
    public void testCreateBadPersonNegativeAge() {
        assertThrows(BadRequestException.class, () ->
          personSvc.createPerson("NegativeAgePersoN", -1));
    }

    @Test
    public void testCreateBadPersonNameTooLong() {
        assertThrows(BadRequestException.class, () ->
          personSvc.createPerson("NameTooLongPersonNameTooLongPersonNameTooLongPerson",
          5));
    }
}
