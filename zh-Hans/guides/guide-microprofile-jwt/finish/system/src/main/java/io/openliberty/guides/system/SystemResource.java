// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.system;

import jakarta.json.JsonArray;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.annotation.security.RolesAllowed;

import org.eclipse.microprofile.jwt.Claim;

@RequestScoped
@Path("/properties")
public class SystemResource {

    @Inject
    // tag::claim[]
    @Claim("groups")
    // end::claim[]
    // tag::rolesArray[]
    private JsonArray roles;
    // end::rolesArray[]

    @GET
    // tag::usernameEndpoint[]
    @Path("/username")
    // end::usernameEndpoint[]
    @Produces(MediaType.APPLICATION_JSON)
    // tag::rolesAllowedAdminUser1[]
    @RolesAllowed({ "admin", "user" })
    // end::rolesAllowedAdminUser1[]
    public String getUsername() {
        return System.getProperties().getProperty("user.name");
    }

    @GET
    // tag::osEndpoint[]
    @Path("/os")
    // end::osEndpoint[]
    @Produces(MediaType.APPLICATION_JSON)
    // tag::rolesAllowedAdmin[]
    @RolesAllowed({ "admin" })
    // end::rolesAllowedAdmin[]
    public String getOS() {
        return System.getProperties().getProperty("os.name");
    }

    @GET
    // tag::rolesEndpoint[]
    @Path("/jwtroles")
    // end::rolesEndpoint[]
    @Produces(MediaType.APPLICATION_JSON)
    // tag::rolesAllowedAdminUser2[]
    @RolesAllowed({ "admin", "user" })
    // end::rolesAllowedAdminUser2[]
    public String getRoles() {
        return roles.toString();
    }
}
