// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.models;

import java.util.Objects;

import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;

import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.Serializer;

public class SystemLoad {

    private static final Jsonb JSONB = JsonbBuilder.create();

    public String hostname;
    public Double loadAverage;

    public SystemLoad(String hostname, Double cpuLoadAvg) {
        this.hostname = hostname;
        this.loadAverage = cpuLoadAvg;
    }

    public SystemLoad() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SystemLoad)) {
            return false;
        }
        SystemLoad sl = (SystemLoad) o;
        return Objects.equals(hostname, sl.hostname)
                && Objects.equals(loadAverage, sl.loadAverage);
    }

    @Override
    public int hashCode() {
        return Objects.hash(hostname, loadAverage);
    }

    @Override
    public String toString() {
        return "CpuLoadAverage: " + JSONB.toJson(this);
    }

    public static class SystemLoadSerializer implements Serializer<Object> {
        @Override
        public byte[] serialize(String topic, Object data) {
          return JSONB.toJson(data).getBytes();
        }
    }

    public static class SystemLoadDeserializer implements Deserializer<SystemLoad> {
        @Override
        public SystemLoad deserialize(String topic, byte[] data) {
            if (data == null) {
                return null;
            }
            return JSONB.fromJson(new String(data), SystemLoad.class);
        }
    }
}
