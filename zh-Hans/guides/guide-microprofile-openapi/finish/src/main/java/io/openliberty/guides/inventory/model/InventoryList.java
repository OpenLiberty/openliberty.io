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
package io.openliberty.guides.inventory.model;

import java.util.List;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

// tag::InventoryList[]
@Schema(name = "InventoryList",
description = "POJO that represents the inventory contents.")
// end::InventoryList[]
// tag::InventoryListClass[]
public class InventoryList {

    // tag::Systems[]
    @Schema(required = true)
    // end::Systems[]
    private List<SystemData> systems;

    public InventoryList(List<SystemData> systems) {
        this.systems = systems;
    }

    public List<SystemData> getSystems() {
        return systems;
    }

    public int getTotal() {
        return systems.size();
    }
}
// end::InventoryListClass[]
