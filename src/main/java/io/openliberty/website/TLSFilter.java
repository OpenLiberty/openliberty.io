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
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.FilterChain;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;

public class TLSFilter implements Filter {

    // A list of deprecated URLs that need to be redirected using the HTTP 302.
    private final Map<String, String> TEMP_REDIRECTS = 
        new HashMap<String, String>() {{
            put("/docs/ref/javaee/", "/docs/ref/javaee/7/");
            put("/docs/ref/microprofile/", "/docs/ref/microprofile/1.3/");
            put("/docs/ref/", "/docs/");
            // put("old uri", "new uri");
        }};

    public void destroy() {
    }

    public void init(FilterConfig cfg) {
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse response = ((HttpServletResponse)resp);

        String servletPath = ((HttpServletRequest)req).getServletPath();
        String serverName = req.getServerName();
        
        if(!Constants.API_SERVLET_PATH.equals(servletPath) &&
        		(serverName.equals(Constants.OPEN_LIBERTY_GREEN_APP_HOST)
				 || serverName.equals(Constants.OPEN_LIBERTY_BLUE_APP_HOST))) {   
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        } else if ("http".equals(req.getScheme())) {
          response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY); // HTTP 301
          response.setHeader("Location", ((HttpServletRequest)req).getRequestURL().replace(0, 4, "https").toString());
        } else if ("https".equals(req.getScheme())) {
          response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains"); // Tell browsers that this site should only be accessed using HTTPS, instead of using HTTP. IncludeSubDomains and 1 year set per OWASP.
          response.setHeader("X-Frame-Options", "SAMEORIGIN"); // Prevent framing of this website.
          response.setHeader("X-XSS-Protection", "1; mode=block"); // Cross-site scripting prevention for Chrome, Safari, and IE. It's not necessary with newer browser versions that support the Content-Security-Policy but it helps prevent XSS on older versions of these browsers.
          response.setHeader("X-Content-Type-Options", "nosniff"); // Stops a browser from trying to MIME-sniff the content type.

          String uri = ((HttpServletRequest)req).getRequestURI();
          if(uri.startsWith("/img/")) {
        	  response.setHeader("Cache-Control", "max-age=604800");
          } else {
        	  response.setHeader("Cache-Control", "no-cache");
          }
        
          // REDIRECT CODE FOR HTTPS TRAFFIC
          if(TEMP_REDIRECTS.containsKey(uri)) {
              String newURI = TEMP_REDIRECTS.get(uri);
              String newURL = req.getScheme() + "://" + req.getServerName() + newURI;
              response.sendRedirect(newURL);
              // We want to redirect the Servlet and stop further processing of
              // the incoming request.
              return;
          }
        }

        chain.doFilter(req, resp);
    }
}


