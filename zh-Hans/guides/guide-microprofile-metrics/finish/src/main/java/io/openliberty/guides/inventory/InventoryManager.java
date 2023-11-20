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
// tag::InventoryManager[]
package io.openliberty.guides.inventory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

import jakarta.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.metrics.MetricUnits;
import org.eclipse.microprofile.metrics.annotation.Counted;
import org.eclipse.microprofile.metrics.annotation.Gauge;
import org.eclipse.microprofile.metrics.annotation.Timed;

import io.openliberty.guides.inventory.model.InventoryList;
import io.openliberty.guides.inventory.model.SystemData;

// tag::ApplicationScoped[]
@ApplicationScoped
// end::ApplicationScoped[]
public class InventoryManager {

  private List<SystemData> systems = Collections.synchronizedList(new ArrayList<>());
  private InventoryUtils invUtils = new InventoryUtils();

  // tag::timedForGet[]
  // tag::nameForGet[]
  @Timed(name = "inventoryProcessingTime",
  // end::nameForGet[]
         // tag::tagForGet[]
         tags = {"method=get"},
         // end::tagForGet[]
         // tag::absoluteForGet[]
         absolute = true,
         // end::absoluteForGet[]
         // tag::desForGet[]
         description = "Time needed to process the inventory")
         // end::desForGet[]
  // end::timedForGet[]
  // tag::get[]
  public Properties get(String hostname) {
    return invUtils.getProperties(hostname);
  }
  // end::get[]

  // tag::timedForAdd[]
  // tag::nameForAdd[]
  @Timed(name = "inventoryAddingTime",
  // end::nameForAdd[]
    // tag::absoluteForAdd[]
    absolute = true,
    // end::absoluteForAdd[]
    // tag::desForAdd[]
    description = "Time needed to add system properties to the inventory")
    // end::desForAdd[]
  // end::timedForAdd[]
  // tag::add[]
  public void add(String hostname, Properties systemProps) {
    Properties props = new Properties();
    props.setProperty("os.name", systemProps.getProperty("os.name"));
    props.setProperty("user.name", systemProps.getProperty("user.name"));

    SystemData host = new SystemData(hostname, props);
    if (!systems.contains(host)) {
      systems.add(host);
    }
  }
  // end::add[]

  // tag::timedForList[]
  // tag::nameForList[]
  @Timed(name = "inventoryProcessingTime",
  // end::nameForList[]
         // tag::tagForList[]
         tags = {"method=list"},
         // end::tagForList[]
         // tag::absoluteForList[]
         absolute = true,
         // end::absoluteForList[]
         // tag::desForList[]
         description = "Time needed to process the inventory")
         // end::desForList[]
  // end::timedForList[]
  // tag::countedForList[]
  @Counted(name = "inventoryAccessCount",
           absolute = true,
           description = "Number of times the list of systems method is requested")
  // end::countedForList[]
  // tag::list[]
  public InventoryList list() {
    return new InventoryList(systems);
  }
  // end::list[]

  // tag::gaugeForGetTotal[]
  // tag::unitForGetTotal[]
  @Gauge(unit = MetricUnits.NONE,
  // end::unitForGetTotal[]
         name = "inventorySizeGauge",
         absolute = true,
         description = "Number of systems in the inventory")
  // end::gaugeForGetTotal[]
  // tag::getTotal[]
  public int getTotal() {
    return systems.size();
  }
  // end::getTotal[]
}
// end::InventoryManager[]
