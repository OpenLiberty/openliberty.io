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

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletResponse;

@WebFilter(servletNames = { "Faces Servlet" })
public class NoCacheFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request,
                         ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
                HttpServletResponse httpServletResponse =
                                    (HttpServletResponse) response;
                httpServletResponse.setHeader("Cache-Control", "no-store,"
                                             + "no-cache, must-revalidate, max-age=0");
                httpServletResponse.setDateHeader("Expires", 0);
                httpServletResponse.setHeader("Pragma", "no-cache");
                chain.doFilter(request, response);
    }

}
