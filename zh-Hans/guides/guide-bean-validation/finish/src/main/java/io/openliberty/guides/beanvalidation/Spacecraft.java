// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2018, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.beanvalidation;

import java.io.Serializable;
import java.util.Map;
import java.util.HashMap;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.AssertTrue;
import jakarta.inject.Named;
import jakarta.enterprise.context.RequestScoped;
import jakarta.validation.Valid;

@Named
@RequestScoped
// tag::Spacecraft[]
public class Spacecraft implements Serializable {

    private static final long serialVersionUID = 1L;

    // tag::Valid[]
    @Valid
    // end::Valid[]
    // tag::Astronaut[]
    private Astronaut astronaut;
    // end::Astronaut[]

    // tag::Map[]
    private Map<@NotBlank String, @Positive Integer> destinations;
    // end::Map[]

    // tag::serial-num[]
    @SerialNumber
    // end::serial-num[]
    // tag::serialNumber[]
    private String serialNumber;
    // end::serialNumber[]

    public Spacecraft() {
        destinations = new HashMap<String, Integer>();
    }

    public void setAstronaut(Astronaut astronaut) {
        this.astronaut = astronaut;
    }

    public void setDestinations(Map<String, Integer> destinations) {
        this.destinations = destinations;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Astronaut getAstronaut() {
        return astronaut;
    }

    public Map<String, Integer> getDestinations() {
        return destinations;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    // tag::AssertTrue[]
    @AssertTrue
    // end::AssertTrue[]
    // tag::launchSpacecraft[]
    // tag::launchCode[]
    public boolean launchSpacecraft(@NotNull String launchCode) {
    // end::launchCode[]
        // tag::OpenLiberty[]
        if (launchCode.equals("OpenLiberty")) {
            // end::OpenLiberty[]
            // tag::true[]
            return true;
            // end::true[]
        }
        // tag::false[]
        return false;
        // end::false[]
    }
    // end::launchSpacecraft[]
}
// end::Spacecraft[]
