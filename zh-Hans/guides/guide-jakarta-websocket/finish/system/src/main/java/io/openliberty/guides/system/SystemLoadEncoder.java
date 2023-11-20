// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system;

import jakarta.json.JsonObject;
import jakarta.websocket.EncodeException;
import jakarta.websocket.Encoder;

// tag::SystemLoadEncoder[]
public class SystemLoadEncoder implements Encoder.Text<JsonObject> {

    @Override
    // tag::encode[]
    public String encode(JsonObject object) throws EncodeException {
        return object.toString();
    }
    // end::encode[]
}
// end::SystemLoadEncoder[]
