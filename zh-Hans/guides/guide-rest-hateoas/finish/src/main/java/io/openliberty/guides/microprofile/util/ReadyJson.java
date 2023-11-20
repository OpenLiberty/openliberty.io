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
package io.openliberty.guides.microprofile.util;

import jakarta.json.Json;
import jakarta.json.JsonObject;

public enum ReadyJson {

    SERVICE_UNREACHABLE();

    private JsonObject json;

    public JsonObject getJson() {
        switch (this) {
            case SERVICE_UNREACHABLE:
                this.serviceUnreachable();
                break;
            default:
                break;
        }
        return json;
    }

    private void serviceUnreachable() {
        json = Json.createObjectBuilder()
                .add("ERROR", "Unknown hostname or the resource"
                    + "may not be running on the host machine")
                .build();
    }

}
