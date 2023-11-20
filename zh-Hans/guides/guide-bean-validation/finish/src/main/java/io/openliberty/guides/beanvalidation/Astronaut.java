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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

// tag::Astronaut[]
public class Astronaut implements Serializable {

    private static final long serialVersionUID = 1L;

    // tag::not-blank[]
    @NotBlank
    // end::not-blank[]
    // tag::Name[]
    private String name;
    // end::Name[]

    // tag::Min[]
    @Min(18)
    // end::Min[]
    // tag::Max[]
    @Max(100)
    // end::Max[]
    // tag::age[]
    private Integer age;
    // end::age[]

    // tag::Email[]
    @Email
    // end::Email[]
    // tag::emailAddress[]
    private String emailAddress;
    // end::emailAddress[]

    public Astronaut() {
    }

    public String getName() {
        return name;
    }

    public Integer getAge() {
        return age;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }
}
// end::Astronaut[]
