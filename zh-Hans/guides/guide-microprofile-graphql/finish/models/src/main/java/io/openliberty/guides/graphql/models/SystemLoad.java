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
@Type("systemLoad")
// end::type[]
// tag::description[]
@Description("Information of system usage")
// end::description[]
// tag::class[]
public class SystemLoad {

    @NonNull
    private String hostname;

    @NonNull
    private SystemLoadData loadData;

    public String getHostname() {
        return this.hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public SystemLoadData getLoadData() {
        return this.loadData;
    }

    public void setLoadData(SystemLoadData loadData) {
        this.loadData = loadData;
    }

}
// end::class[]
