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
package io.openliberty.guides.inventory;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.TreeMap;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class InventoryManager {

    private Map<String, Properties> systems = Collections.synchronizedMap(new TreeMap<String, Properties>());

    public void addSystem(String hostId, Double systemLoad) {
        if (!systems.containsKey(hostId)) {
            Properties p = new Properties();
            p.put("hostname", hostId);
            p.put("systemLoad", systemLoad);
            systems.put(hostId, p);
        }
    }

    public void updateCpuStatus(String hostId, Double systemLoad) {
        Optional<Properties> p = getSystem(hostId);
        if (p.isPresent() && p.get().getProperty(hostId) == null && hostId != null)
            p.get().put("systemLoad", systemLoad);
    }

    public Optional<Properties> getSystem(String hostId) {
        Properties p = systems.get(hostId);
        return Optional.ofNullable(p);
    }

    public Map<String, Properties> getSystems() {
        return new TreeMap<>(systems);
    }

    public void resetSystems() {
        systems.clear();
    }
}