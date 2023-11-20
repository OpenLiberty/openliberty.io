// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.application;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

// tag::crewMember[]
public class CrewMember {

    @NotEmpty(message = "All crew members must have a name!")
    private String name;

    @Pattern(regexp = "(Captain|Officer|Engineer)",
            message = "Crew member must be one of the listed ranks!")
    private String rank;

    @Pattern(regexp = "^\\d+$",
            message = "ID Number must be a non-negative integer!")
    private String crewID;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRank() {
        return rank;
    }

    public void setRank(String rank) {
        this.rank = rank;
    }

    public String getCrewID() {
        return crewID;
    }

    public void setCrewID(String crewID) {
        this.crewID = crewID;
    }

}
// end::crewMember[]
