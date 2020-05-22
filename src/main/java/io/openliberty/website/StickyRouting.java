/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.FilterChain;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

/**
 * This ServletFilter exists to create an HttpSession to ensure the http
 * load balancer does sticky routing. This ensures that in the case where
 * an update is in progress we don't end up sending some requests to an
 * out of date instance and some to the new one causing rendering issues.
 */
public class StickyRouting implements Filter {
    public void destroy() {
    }

    public void init(FilterConfig cfg) {
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {

        if (req instanceof HttpServletRequest) {
            ((HttpServletRequest) req).getSession();
        }

        chain.doFilter(req, resp);
    }
}
