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

public class SystemLoad {

    private static final Jsonb jsonb = JsonbBuilder.create();

    public String hostId;
    public Double loadAverage;
        
    public SystemLoad(String hostId, Double cpuLoadAvg) {
        this.hostId = hostId;
        this.loadAverage = cpuLoadAvg;
    }

    public SystemLoad() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SystemLoad)) return false;
        SystemLoad sl = (SystemLoad) o;
        return Objects.equals(hostId, sl.hostId)
                && Objects.equals(loadAverage, sl.loadAverage);
    }

    @Override
    public int hashCode() {
        return Objects.hash(hostId, loadAverage);
    }
    
    @Override
    public String toString() {
        return "CpuLoadAverage: " + jsonb.toJson(this);
    }

    // tag::SystemLoadSerializer[]
    public static class SystemLoadSerializer implements Serializer<Object> {
        @Override
        public byte[] serialize(String topic, Object data) {
          return jsonb.toJson(data).getBytes();
        }
    }
    // end::SystemLoadSerializer[]

    // tag::SystemLoadDeserializer[]
    public static class SystemLoadDeserializer implements Deserializer<SystemLoad> {
        @Override
        public SystemLoad deserialize(String topic, byte[] data) {
            if (data == null)
                return null;
            return jsonb.fromJson(new String(data), SystemLoad.class);
        }
    }
    // end::SystemLoadDeserializer[]
}