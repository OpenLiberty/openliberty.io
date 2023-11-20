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
package io.openliberty.guides.microprofile;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

import io.openliberty.guides.microprofile.util.InventoryUtil;
import io.openliberty.guides.microprofile.util.ReadyJson;

// tag::header[]
// tag::cdi-scope[]
@ApplicationScoped
// end::cdi-scope[]
public class InventoryManager {
// end::header[]

    private ConcurrentMap<String, JsonObject> inv = new ConcurrentHashMap<>();

    // tag::get[]
    public JsonObject get(String hostname) {
        // tag::method-contents[]
        JsonObject properties = inv.get(hostname);
        if (properties == null) {
            if (InventoryUtil.responseOk(hostname)) {
                properties = InventoryUtil.getProperties(hostname);
                this.add(hostname, properties);
            } else {
                return ReadyJson.SERVICE_UNREACHABLE.getJson();
            }
        }
        return properties;
        // end::method-contents[]
    }
    // end::get[]

    // tag::add[]
    public void add(String hostname, JsonObject systemProps) {
        // tag::method-contents[]
        inv.putIfAbsent(hostname, systemProps);
        // end::method-contents[]
    }
    // end::add[]

    // tag::list[]
    public JsonObject list() {
        // tag::method-contents[]
        JsonObjectBuilder systems = Json.createObjectBuilder();
        inv.forEach((host, props) -> {
            JsonObject systemProps = Json.createObjectBuilder()
                                         .add("os.name", props.getString("os.name"))
                                         .add("user.name", props.getString("user.name"))
                                         .build();
            systems.add(host, systemProps);
        });
        systems.add("hosts", systems);
        systems.add("total", inv.size());
        return systems.build();
        // end::method-contents[]
    }
    // end::list[]

}
