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
package io.openliberty.guides.inventory;

import java.util.List;

import io.openliberty.guides.inventory.model.SystemData;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@ApplicationScoped
public class Inventory {

    @PersistenceContext(name = "jpa-unit")
    private EntityManager em;

    public List<SystemData> getSystems() {
        return em.createNamedQuery("SystemData.findAll", SystemData.class)
                 .getResultList();
    }

    public SystemData getSystem(String hostname) {
        List<SystemData> systems =
            em.createNamedQuery("SystemData.findSystem", SystemData.class)
              .setParameter("hostname", hostname)
              .getResultList();
        return systems == null || systems.isEmpty() ? null : systems.get(0);
    }

    public void add(String hostname, String osName, String javaVersion, Long heapSize) {
        em.persist(new SystemData(hostname, osName, javaVersion, heapSize));
    }

    public void update(SystemData s) {
        em.merge(s);
    }

    public void removeSystem(SystemData s) {
        em.remove(s);
    }

}
