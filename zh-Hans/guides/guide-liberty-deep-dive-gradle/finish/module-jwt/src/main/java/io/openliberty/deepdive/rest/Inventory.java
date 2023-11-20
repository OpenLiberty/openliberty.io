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
package io.openliberty.deepdive.rest;

import java.util.List;

import io.openliberty.deepdive.rest.model.SystemData;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@ApplicationScoped
// tag::InventoryDao[]
public class Inventory {

    // tag::PersistenceContext[]
    @PersistenceContext(name = "jpa-unit")
    // end::PersistenceContext[]
    private EntityManager em;

    // tag::readAllFromInventory[]
    public List<SystemData> getSystems() {
        return em.createNamedQuery("SystemData.findAll", SystemData.class)
                 .getResultList();
    }
    // end::readAllFromInventory[]

    // tag::readInventory[]
    public SystemData getSystem(String hostname) {
        // tag::find[]
        List<SystemData> systems =
            em.createNamedQuery("SystemData.findSystem", SystemData.class)
              .setParameter("hostname", hostname)
              .getResultList();
        return systems == null || systems.isEmpty() ? null : systems.get(0);
        // end::find[]
    }
    // end::readInventory[]

    // tag::addToInventory[]
    public void add(String hostname, String osName, String javaVersion, Long heapSize) {
        // tag::Persist[]
        em.persist(new SystemData(hostname, osName, javaVersion, heapSize));
        // end::Persist[]
    }
    // end::addToInventory[]

    // tag::update[]
    public void update(SystemData s) {
        // tag::Merge[]
        em.merge(s);
        // end::Merge[]
    }
    // end::update[]

    // tag::removeSystem[]
    public void removeSystem(SystemData s) {
        // tag::Remove[]
        em.remove(s);
        // end::Remove[]
    }
    // end::removeSystem[]

}
// end::InventoryDao[]
