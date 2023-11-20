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
// tag::userbean[]
package io.openliberty.guides.ui;

import java.io.Serializable;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.security.enterprise.SecurityContext;

@Named("userBean")
@RequestScoped

public class UserBean implements Serializable {

    private static final long serialVersionUID = 1L;

    @Inject
    private SecurityContext securityContext;

    public String getUsername() {
        return securityContext.getCallerPrincipal().getName();
    }

    public String getRoles() {
        String roles = "";
        if (securityContext.isCallerInRole(Utils.ADMIN)) {
            roles = Utils.ADMIN;
        }
        if (securityContext.isCallerInRole(Utils.USER)) {
            if (!roles.isEmpty()) {
                roles += ", ";
            }
            roles += Utils.USER;
        }
        return roles;
    }
}
// end::userbean[]
