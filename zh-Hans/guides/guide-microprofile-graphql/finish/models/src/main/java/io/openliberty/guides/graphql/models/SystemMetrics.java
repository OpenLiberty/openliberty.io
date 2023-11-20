// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.graphql.models;

import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.NonNull;
import org.eclipse.microprofile.graphql.Type;

// tag::type[]
@Type("systemMetrics")
// end::type[]
// tag::description[]
@Description("System metrics")
// end::description[]
// tag::class[]
public class SystemMetrics {

    @NonNull
    private Integer processors;

    @NonNull
    private Long heapSize;

    @NonNull
    private Long nonHeapSize;

    public Integer getProcessors() {
        return processors;
    }

    public void setProcessors(int processors) {
        this.processors = processors;
    }

    public Long getHeapSize() {
        return heapSize;
    }

    public void setHeapSize(long heapSize) {
        this.heapSize = heapSize;
    }

    public Long getNonHeapSize() {
        return nonHeapSize;
    }

    public void setNonHeapSize(Long nonHeapSize) {
        this.nonHeapSize = nonHeapSize;
    }

}
// end::class[]
