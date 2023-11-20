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
import java.util.Properties;
import jakarta.enterprise.context.ApplicationScoped;

import io.openliberty.guides.inventory.model.InventoryList;

@ApplicationScoped
public class InventoryManager {

    public Properties get(String hostname) throws IOException {
        return null;
    }

    public void add(String hostname, Properties props) {
    }

    public InventoryList list() {
        return null;
    }

}
