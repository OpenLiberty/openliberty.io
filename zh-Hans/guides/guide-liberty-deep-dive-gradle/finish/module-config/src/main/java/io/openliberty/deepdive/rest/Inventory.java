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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import io.openliberty.deepdive.rest.model.SystemData;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class Inventory {

    private List<SystemData> systems = Collections.synchronizedList(new ArrayList<>());

    public List<SystemData> getSystems() {
        return systems;
    }

    public SystemData getSystem(String hostname) {
        for (SystemData s : systems) {
            if (s.getHostname().equalsIgnoreCase(hostname)) {
                return s;
            }
        }
        return null;
    }

    public void add(String hostname, String osName, String javaVersion, Long heapSize) {
        systems.add(new SystemData(hostname, osName, javaVersion, heapSize));
    }

    public void update(SystemData s) {
        for (SystemData systemData : systems) {
            if (systemData.getHostname().equalsIgnoreCase(s.getHostname())) {
                systemData.setOsName(s.getOsName());
                systemData.setJavaVersion(s.getJavaVersion());
                systemData.setHeapSize(s.getHeapSize());
            }
        }
    }

    public boolean removeSystem(SystemData s) {
        return systems.remove(s);
    }

}
