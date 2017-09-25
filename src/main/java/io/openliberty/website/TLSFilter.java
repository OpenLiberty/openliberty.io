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
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;

public class TLSFilter implements Filter {
    public void destroy() {
    }

    public void init(FilterConfig cfg) {
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse response = ((HttpServletResponse)resp);
        if ("http".equals(req.getScheme())) {
          response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
          response.setHeader("Location", ((HttpServletRequest)req).getRequestURL().replace(0, 4, "https").toString());
        } else if ("https".equals(req.getScheme())) {
          response.setHeader("Strict-Transport-Security", "max-age=3600");
          if(((HttpServletRequest)req).getRequestURI().startsWith("/api/")) {
        	  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else {
        	  response.setHeader("Cache-Control", "public, max-age=600");
          }
        }

        chain.doFilter(req, resp);
    }
}
