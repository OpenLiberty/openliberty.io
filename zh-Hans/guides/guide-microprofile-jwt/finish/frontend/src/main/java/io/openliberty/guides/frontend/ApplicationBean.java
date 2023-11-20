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
package io.openliberty.guides.frontend;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;

import org.eclipse.microprofile.rest.client.inject.RestClient;

import io.openliberty.guides.frontend.client.SystemClient;
import io.openliberty.guides.frontend.util.SessionUtils;


@ApplicationScoped
@Named
public class ApplicationBean {

    // tag::restClient[]
    @Inject
    @RestClient
    private SystemClient defaultRestClient;
    // end::restClient[]

    // tag::getJwt[]
    public String getJwt() {
        String jwtTokenString = SessionUtils.getJwtToken();
        String authHeader = "Bearer " + jwtTokenString;
        return authHeader;
    }
    // end::getJwt[]

    // tag::getOs[]
    public String getOs() {
        String authHeader = getJwt();
        String os;
        try {
            // tag::authHeader1[]
            os = defaultRestClient.getOS(authHeader);
            // end::authHeader1[]
        } catch (Exception e) {
            return "You are not authorized to access this system property";
        }
        return os;
    }
    // end::getOs[]

    // tag::getUsername[]
    public String getUsername() {
        String authHeader = getJwt();
        // tag::authHeader2[]
        return defaultRestClient.getUsername(authHeader);
        // end::authHeader2[]
    }
    // end::getUsername[]

    // tag::getJwtRoles[]
    public String getJwtRoles() {
        String authHeader = getJwt();
        // tag::authHeader3[]
        return defaultRestClient.getJwtRoles(authHeader);
        // end::authHeader3[]
    }
    // end::getJwtRoles[]

}
