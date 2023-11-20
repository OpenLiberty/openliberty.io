// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2021, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import io.openliberty.guides.graphql.models.SystemLoadData;
import io.openliberty.guides.graphql.models.SystemMetrics;

@ApplicationScoped
@Path("metrics")
public class SystemMetricsResource {

    private static final OperatingSystemMXBean OS_MEAN =
                             ManagementFactory.getOperatingSystemMXBean();

    private static final MemoryMXBean MEM_BEAN = ManagementFactory.getMemoryMXBean();

    // tag::systemMetrics[]
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public SystemMetrics getSystemMetrics() {
        SystemMetrics metrics = new SystemMetrics();
        metrics.setProcessors(OS_MEAN.getAvailableProcessors());
        metrics.setHeapSize(MEM_BEAN.getHeapMemoryUsage().getMax());
        metrics.setNonHeapSize(MEM_BEAN.getNonHeapMemoryUsage().getMax());
        return metrics;
    }
    // end::systemMetrics[]

    // tag::systemLoad[]
    @GET
    @Path("/systemLoad")
    @Produces(MediaType.APPLICATION_JSON)
    public SystemLoadData getSystemLoad() {
        SystemLoadData systemLoadData = new SystemLoadData();
        systemLoadData.setLoadAverage(OS_MEAN.getSystemLoadAverage());
        systemLoadData.setHeapUsed(MEM_BEAN.getHeapMemoryUsage().getUsed());
        systemLoadData.setNonHeapUsed(MEM_BEAN.getNonHeapMemoryUsage().getUsed());
        return systemLoadData;
    }
    // end::systemLoad[]
}
