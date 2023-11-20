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
package io.openliberty.guides.models;

import java.util.ArrayList;
import java.util.List;

public class InventoryList {

  private List<SystemData> systems;
  private int total;

  public InventoryList() {
    this.systems = new ArrayList<>();
    this.total = 0;
  }

  public InventoryList(List<SystemData> systems) {
    this.systems = systems;
    this.total = systems.size();
  }

  public List<SystemData> getSystems() {
    return systems;
  }

  public void setTotal(int total) {
    this.total = total;
  }

  public int getTotal() {
    return total;
  }

  public void setSystems(List<SystemData> systems) {
    this.systems = systems;
  }
}
