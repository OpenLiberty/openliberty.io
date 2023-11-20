// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

import io.openliberty.guides.models.InventoryList;
import io.openliberty.guides.models.SystemData;
import javax.enterprise.context.ApplicationScoped;

// tag::ApplicationScoped[]
@ApplicationScoped
// end::ApplicationScoped[]
public class InventoryManager {

  private List<SystemData> systems = Collections.synchronizedList(new ArrayList<>());

  public void add(String hostname, Properties systemProps) {
    Properties props = new Properties();
    props.setProperty("os.name", systemProps.getProperty("os.name"));
    props.setProperty("user.name", systemProps.getProperty("user.name"));
    props.setProperty("system.busy", systemProps.getProperty("system.busy"));

    SystemData system = new SystemData(hostname, props);
    if (!systems.contains(system)) {
      systems.add(system);
    }
  }

  public boolean containsHostname(String hostname) {
    return systems
      .stream()
      .filter(s -> s.getHostname().equals(hostname))
      .collect(Collectors.toList())
      .size() > 0;
  }

  public void updateSystem(String hostname, String busy) {
    for (SystemData s : systems) {
      if (s.getHostname().equals(hostname)) {
        s.getProperties().setProperty("system.busy", busy);
      }
    }
  }

  public void reset() {
    systems.clear();
  }

  public InventoryList list() {
    return new InventoryList(systems);
  }
}
