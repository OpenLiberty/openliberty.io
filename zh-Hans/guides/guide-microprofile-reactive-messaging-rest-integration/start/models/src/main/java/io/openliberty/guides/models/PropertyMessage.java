// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
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

import java.util.Objects;

import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;

import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.Serializer;

public class PropertyMessage {

    private static final Jsonb jsonb = JsonbBuilder.create();

    public String hostname;
    public String key;
    public String value;
    
    public PropertyMessage(String hostname, String key, String value) {
        this.hostname = hostname;
        this.key = key;
        this.value = value;
    }

    public PropertyMessage() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PropertyMessage)) return false;
        PropertyMessage m = (PropertyMessage) o;
        return Objects.equals(hostname, m.hostname)
                && Objects.equals(key, m.key)
                && Objects.equals(value, m.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(hostname, key, value);
    }
    
    @Override
    public String toString() {
        return "PropertyMessage: " + jsonb.toJson(this);
    }
    
    public static class PropertyMessageSerializer implements Serializer<Object> {
        @Override
        public byte[] serialize(String topic, Object data) {
          return jsonb.toJson(data).getBytes();
        }
    }
      
    public static class PropertyMessageDeserializer implements Deserializer<PropertyMessage> {
        @Override
        public PropertyMessage deserialize(String topic, byte[] data) {
            if (data == null)
                return null;
            return jsonb.fromJson(new String(data), PropertyMessage.class);
        }
    }
}