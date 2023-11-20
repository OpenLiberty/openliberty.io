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
package io.openliberty.guides.ui;

import java.io.IOException;
import jakarta.inject.Inject;
import jakarta.security.enterprise.SecurityContext;
import jakarta.security.enterprise.authentication.mechanism.http.FormAuthenticationMechanismDefinition;
import jakarta.security.enterprise.authentication.mechanism.http.LoginToContinue;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.HttpConstraint;
import jakarta.servlet.annotation.ServletSecurity;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = "/home")
// tag::AuthenticationMechanism[]
@FormAuthenticationMechanismDefinition(
    // tag::loginToContinue[]
    // tag::errorPage[]
    loginToContinue = @LoginToContinue(errorPage = "/error.html",
    // end::errorPage[]
                                        // tag::loginPage[]
                                       loginPage = "/welcome.html"))
                                        // end::loginPage[]
    // end::loginToContinue[]
// end::AuthenticationMechanism[]
// tag::ServletSecurity[]
// tag::HttpConstraint[]
@ServletSecurity(value = @HttpConstraint(rolesAllowed = { "user", "admin" },
// end::HttpConstraint[]
  // tag::TransportGuarantee[]
  transportGuarantee = ServletSecurity.TransportGuarantee.CONFIDENTIAL))
  // end::TransportGuarantee[]
// end::ServletSecurity[]
// tag::HomeServlet[]
public class HomeServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Inject
    private SecurityContext securityContext;

    // tag::javaDoc1[]
    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
     *      response)
     */
    // end::javaDoc1[]
    // tag::doGet[]
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        // tag::CallerInRole[]
        if (securityContext.isCallerInRole(Utils.ADMIN)) {
            response.sendRedirect("/admin.jsf");
        // end::CallerInRole[]
        } else if  (securityContext.isCallerInRole(Utils.USER)) {
            response.sendRedirect("/user.jsf");
        }
    }
    // end::doGet[]

    // tag::javaDoc2[]
    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
     *      response)
     */
    // end::javaDoc2[]
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        doGet(request, response);
    }
}
// end::HomeServlet[]
