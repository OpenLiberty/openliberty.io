// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.inventory;

public class SystemData {

    // tag::fields[]
    private int id;
    private String hostname;
    private String osName;
    private String javaVersion;
    private Long heapSize;
    // end::fields[]

    public SystemData() {
    }

    // tag::getMethods[]
    public int getId() {
        return id;
    }

    public String getHostname() {
        return hostname;
    }

    public String getOsName() {
        return osName;
    }

    public String getJavaVersion() {
        return javaVersion;
    }

    public Long getHeapSize() {
        return heapSize;
    }
    // end::getMethods[]

    // tag::setMethods[]
    public void setId(int id) {
        this.id = id;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public void setOsName(String osName) {
        this.osName = osName;
    }

    public void setJavaVersion(String javaVersion) {
        this.javaVersion = javaVersion;
    }

    public void setHeapSize(Long heapSize) {
        this.heapSize = heapSize;
    }
    // end::setMethods[]
}
