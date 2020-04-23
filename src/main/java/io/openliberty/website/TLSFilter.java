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

/**
 * Originally this filter was used simply to force the use of TLS, however it
 * has since been enhanced for general security related content.
 * 
 * <p>Note: This does not correctly cope with an SSL port that is not 443 which happens
 * when using dev mode</p>
 */
public class TLSFilter implements Filter {
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
             (serverName.equals(Constants.OPEN_LIBERTY_GREEN_APP_HOST) || 
                 serverName.equals(Constants.OPEN_LIBERTY_BLUE_APP_HOST))) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        // If the request is via http sends a redirect to HTTPS. Note the filter chain is still
        // called which is probably not the right behaviour.
        } else if ("http".equals(req.getScheme())) {
          response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY); // HTTP 301
          // This assumes default https port number.
          response.setHeader("Location", ((HttpServletRequest)req).getRequestURL().replace(0, 4, "https").toString());
        // If HTTPS is configured this sets a bunch of security headers
        } else if ("https".equals(req.getScheme())) {
          response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains"); // Tell browsers that this site should only be accessed using HTTPS, instead of using HTTP. IncludeSubDomains and 1 year set per OWASP.
          response.setHeader("X-Frame-Options", "SAMEORIGIN"); // Prevent framing of this website.
          response.setHeader("X-XSS-Protection", "1; mode=block"); // Cross-site scripting prevention for Chrome, Safari, and IE. It's not necessary with newer browser versions that support the Content-Security-Policy but it helps prevent XSS on older versions of these browsers.
          response.setHeader("X-Content-Type-Options", "nosniff"); // Stops a browser from trying to MIME-sniff the content type.
          response.setHeader("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' maxcdn.bootstrapcdn.com fonts.googleapis.com ajax.googleapis.com code.jquery.com fonts.gstatic.com  *.githubusercontent.com api.github.com www.googletagmanager.com tagmanager.google.com www.google-analytics.com cdnjs.cloudflare.com data: buttons.github.io www.youtube.com *.twitter.com *.twimg.com"); // Mitigating cross site scripting (XSS) from other domains.
          response.setHeader("Referrer-Policy", "no-referrer"); // Limits the information sent cross-domain and does not send the origin name.

          // Note this should be moved into its own filter. It appears to set cache control 
          // for images, and no cache for everything else. This could likely be replaced with a
          // filter just on /img/* which sets Cache-Control only for images. It also isn't clear
          // why the Pragma header (for some HTTP 1.0 clients) is set for the api calls, but not
          // for everything else.
          String uri = ((HttpServletRequest)req).getRequestURI();
          if(uri.startsWith("/img/")) {
              response.setHeader("Cache-Control", "max-age=604800");
          // if requesting the JAX-RS api set cache control to not cache
          } else if (uri.startsWith("/api/builds/") || uri.startsWith("/api/github/")) {
              response.setHeader("Cache-Control", "no-store");
              response.setHeader("Pragma", "no-cache");
          } else {
              response.setHeader("Cache-Control", "no-cache");
          }
        }
        chain.doFilter(req, resp);
    }
}
