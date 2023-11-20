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

import static org.junit.jupiter.api.Assertions.assertEquals;
// tag::importAssertNotNull[]
import static org.junit.jupiter.api.Assertions.assertNotNull;
// end::importAssertNotNull[]
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collection;

import org.junit.jupiter.api.Test;
import org.microshed.testing.jaxrs.RESTClient;
import org.microshed.testing.jupiter.MicroShedTest;
// tag::importMPApp[]
import org.microshed.testing.testcontainers.ApplicationContainer;
// end::importMPApp[]
// tag::importContainer[]
import org.testcontainers.junit.jupiter.Container;
// end::importContainer[]

@MicroShedTest
public class PersonServiceIT {

    @RESTClient
    public static PersonService personSvc;

    // tag::container[]
    @Container
    // end::container[]
    // tag::mpApp[]
    public static ApplicationContainer app = new ApplicationContainer()
                    .withAppContextRoot("/guide-microshed-testing")
                    .withReadinessPath("/health/ready");
    // end::mpApp[]

    @Test
    public void testCreatePerson() {
        // tag::testCreatePerson[]
        Long createId = personSvc.createPerson("Hank", 42);
        assertNotNull(createId);
        // end::testCreatePerson[]
    }

    // tag::tests[]
    // tag::testMinSizeName[]
    @Test
    public void testMinSizeName() {
        Long minSizeNameId = personSvc.createPerson("Ha", 42);
        assertEquals(new Person("Ha", 42, minSizeNameId),
                     personSvc.getPerson(minSizeNameId));
    }
    // end::testMinSizeName[]

    // tag::testMinAge[]
    @Test
    public void testMinAge() {
        Long minAgeId = personSvc.createPerson("Newborn", 0);
        assertEquals(new Person("Newborn", 0, minAgeId),
                     personSvc.getPerson(minAgeId));
    }
    // end::testMinAge[]

    // tag::testGetPerson[]
    @Test
    public void testGetPerson() {
        Long bobId = personSvc.createPerson("Bob", 24);
        Person bob = personSvc.getPerson(bobId);
        assertEquals("Bob", bob.name);
        assertEquals(24, bob.age);
        assertNotNull(bob.id);
    }
    // end::testGetPerson[]

    // tag::testGetAllPeople[]
    @Test
    public void testGetAllPeople() {
        Long person1Id = personSvc.createPerson("Person1", 1);
        Long person2Id = personSvc.createPerson("Person2", 2);

        Person expected1 = new Person("Person1", 1, person1Id);
        Person expected2 = new Person("Person2", 2, person2Id);

        Collection<Person> allPeople = personSvc.getAllPeople();
        assertTrue(allPeople.size() >= 2,
            "Expected at least 2 people to be registered, but there were only: "
            + allPeople);
        assertTrue(allPeople.contains(expected1),
            "Did not find person " + expected1 + " in all people: " + allPeople);
        assertTrue(allPeople.contains(expected2),
            "Did not find person " + expected2 + " in all people: " + allPeople);
    }
    // end::testGetAllPeople[]

    // tag::testUpdateAge[]
    @Test
    public void testUpdateAge() {
        Long personId = personSvc.createPerson("newAgePerson", 1);

        Person originalPerson = personSvc.getPerson(personId);
        assertEquals("newAgePerson", originalPerson.name);
        assertEquals(1, originalPerson.age);
        assertEquals(personId, Long.valueOf(originalPerson.id));

        personSvc.updatePerson(personId,
            new Person(originalPerson.name, 2, originalPerson.id));
        Person updatedPerson = personSvc.getPerson(personId);
        assertEquals("newAgePerson", updatedPerson.name);
        assertEquals(2, updatedPerson.age);
        assertEquals(personId, Long.valueOf(updatedPerson.id));
    }
    // end::testUpdateAge[]
    // end::tests[]
}
