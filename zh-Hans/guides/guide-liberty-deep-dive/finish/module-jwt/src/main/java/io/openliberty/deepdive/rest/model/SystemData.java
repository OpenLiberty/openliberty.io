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
package io.openliberty.deepdive.rest.model;

import java.io.Serializable;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Schema(name = "SystemData",
        description = "POJO that represents a single inventory entry.")
// tag::Entity[]
@Entity
// end::Entity[]
// tag::Table[]
@Table(name = "SystemData")
// end::Table[]
// tag::NamedQuery[]
@NamedQuery(name = "SystemData.findAll", query = "SELECT e FROM SystemData e")
@NamedQuery(name = "SystemData.findSystem",
    query = "SELECT e FROM SystemData e WHERE e.hostname = :hostname")
// end::NamedQuery[]
// tag::SystemData[]
public class SystemData implements Serializable {
    private static final long serialVersionUID = 1L;

    // tag::GeneratedValue[]
    @SequenceGenerator(name = "SEQ",
                       sequenceName = "systemData_id_seq",
                       allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "SEQ")
    // end::GeneratedValue[]
    // tag::Id[]
    @Id
    // end::Id[]
    // tag::Column[]
    @Column(name = "id")
    // end::Column[]
    private int id;

    @Schema(required = true)
    // tag::Column[]
    @Column(name = "hostname")
    // end::Column[]
    private String hostname;

    @Column(name = "osName")
    private String osName;
    @Column(name = "javaVersion")
    private String javaVersion;
    @Column(name = "heapSize")
    private Long heapSize;

    public SystemData() {
    }

    public SystemData(String hostname, String osName, String javaVer, Long heapSize) {
        this.hostname = hostname;
        this.osName = osName;
        this.javaVersion = javaVer;
        this.heapSize = heapSize;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getOsName() {
        return osName;
    }

    public void setOsName(String osName) {
        this.osName = osName;
    }

    public String getJavaVersion() {
        return javaVersion;
    }

    public void setJavaVersion(String javaVersion) {
        this.javaVersion = javaVersion;
    }

    public Long getHeapSize() {
        return heapSize;
    }

    public void setHeapSize(Long heapSize) {
        this.heapSize = heapSize;
    }

    @Override
    public int hashCode() {
        return hostname.hashCode();
    }

    @Override
    public boolean equals(Object host) {
        if (host instanceof SystemData) {
            return hostname.equals(((SystemData) host).getHostname());
        }
        return false;
    }
}
// end::SystemData[]
