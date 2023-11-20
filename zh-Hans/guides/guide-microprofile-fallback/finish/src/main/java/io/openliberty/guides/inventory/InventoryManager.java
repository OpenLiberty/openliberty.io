// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.inventory;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.Properties;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.faulttolerance.Fallback;
import io.openliberty.guides.inventory.model.InventoryList;
import io.openliberty.guides.inventory.model.SystemData;

@ApplicationScoped
public class InventoryManager {

    private List<SystemData> systems = Collections.synchronizedList(new ArrayList<>());
    private InventoryUtils invUtils = new InventoryUtils();

    // tag::Fallback[]
    @Fallback(fallbackMethod = "fallbackForGet",
            // tag::applyOn[]
            applyOn = {IOException.class},
            // end::applyOn[]
            // tag::skipOn[]
            skipOn = {UnknownHostException.class})
            // end::skipOn[]
    // end::Fallback[]
    // tag::get[]
    public Properties get(String hostname) throws IOException {
        return invUtils.getProperties(hostname);
    }
    // end::get[]

    // tag::fallbackForGet[]
    public Properties fallbackForGet(String hostname) {
        Properties properties = findHost(hostname);
        if (properties == null) {
            Properties msgProp = new Properties();
            msgProp.setProperty(hostname,
                    "System is not found in the inventory or system is in maintenance");
            return msgProp;
        }
        return properties;
    }
    // end::fallbackForGet[]

    public void add(String hostname, Properties systemProps) {
        Properties props = new Properties();

        String osName = systemProps.getProperty("os.name");
        if (osName == null) {
            return;
        }

        props.setProperty("os.name", systemProps.getProperty("os.name"));
        props.setProperty("user.name", systemProps.getProperty("user.name"));

        SystemData system = new SystemData(hostname, props);
        if (!systems.contains(system)) {
            systems.add(system);
        }
    }

    public InventoryList list() {
        return new InventoryList(systems);
    }

    private Properties findHost(String hostname) {
        for (SystemData system : systems) {
            if (system.getHostname().equals(hostname)) {
                return system.getProperties();
            }
        }
        return null;
    }
}
