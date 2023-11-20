// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system;

import java.io.StringReader;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.websocket.DecodeException;
import jakarta.websocket.Decoder;

// tag::SystemLoadDecoder[]
public class SystemLoadDecoder implements Decoder.Text<JsonObject> {

    @Override
    // tag::decode[]
    public JsonObject decode(String s) throws DecodeException {
        try (JsonReader reader = Json.createReader(new StringReader(s))) {
            return reader.readObject();
        } catch (Exception e) {
            JsonObject error = Json.createObjectBuilder()
                    .add("error", e.getMessage())
                    .build();
            return error;
        }
    }
    // end::decode[]

    @Override
    // tag::willDecode[]
    public boolean willDecode(String s) {
        try (JsonReader reader = Json.createReader(new StringReader(s))) {
            reader.readObject();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    // end::willDecode[]

}
// end::SystemLoadDecoder[]
