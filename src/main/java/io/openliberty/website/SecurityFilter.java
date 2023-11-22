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
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.FilterChain;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.FileNotFoundException;

/**
 * Originally this filter was used simply to force the use of TLS, however it
 * has since been enhanced for general security related content.
 * 
 * <p>
 * Note: This does not correctly cope with an SSL port that is not 443 which
 * happens when using dev mode
 * </p>
 */
public class SecurityFilter implements Filter {
    FilterConfig cfg;

    public void destroy() {
    }

    public void init(FilterConfig cfg) {
        this.cfg = cfg;
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse response = ((HttpServletResponse) resp);

        boolean doFilter = true;

        if ("http".equals(req.getScheme())) {
            // If the request is via http sends a redirect to HTTPS. Note the filter chain
            // is still called which is probably not the right behavior.
            response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY); // HTTP 301
            // This assumes default https port number.
            response.setHeader("Location",
                    ((HttpServletRequest) req).getRequestURL().replace(0, 4, "https").toString());
        } else if ("https".equals(req.getScheme())) {
            // If HTTPS is configured this sets a bunch of security headers

            // Tell browsers that this site should only be accessed using HTTPS, instead of using HTTP.
            // IncludeSubDomains and 1 year set per OWASP.
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            // Prevent framing of this website.
            response.setHeader("X-Frame-Options", "SAMEORIGIN");
            // Cross-site scripting prevention for Chrome, Safari, and IE. It's not necessary with newer browser 
            // versions that support the Content-Security-Policy but it helps prevent XSS on older versions of these browsers.
            response.setHeader("X-XSS-Protection", "1; mode=block"); 
            // Stops a browser from trying to MIME-sniff the content type.
            response.setHeader("X-Content-Type-Options", "nosniff");
             // Mitigating cross site scripting (XSS) from other domains.
            response.setHeader("Content-Security-Policy",
                    "default-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net fonts.googleapis.com ajax.googleapis.com code.jquery.com fonts.gstatic.com  *.githubusercontent.com api.github.com www.googletagmanager.com tagmanager.google.com www.google-analytics.com cdnjs.cloudflare.com data: buttons.github.io www.youtube.com video.ibm.com https://start.openliberty.io/ gitlab.com starter-staging.rh9j6zz75er.us-east.codeengine.appdomain.cloud https://docs.oracle.com/javase/8/docs/api/");

            // Limits the information sent cross-domain and does not send the origin name.
            response.setHeader("Referrer-Policy", "no-referrer");

            // Note this should be moved into its own filter. It appears to set cache control
            // for images, and no cache for everything else. This could likely be replaced
            // with a filter just on /img/* which sets Cache-Control only for images. It also isn't
            // clear why the Pragma header (for some HTTP 1.0 clients) is set for the api calls,
            // but not for everything else.
            String uri = ((HttpServletRequest) req).getRequestURI();
            if (uri.startsWith("/img/")) {
                response.setHeader("Cache-Control", "max-age=604800");
                // if requesting the JAX-RS api set cache control to not cache
            } else if ((uri.startsWith("/docs") || uri.startsWith("/ja/docs")) && uri.endsWith(".html") && !uri.endsWith("index.html")) {
                boolean doGzip = true;
                // Check if the servlet context contains a redirect rule for this url
                Map<String, ?> map = cfg.getServletContext().getContext(uri).getFilterRegistrations();
                for (String key : map.keySet()) {
                    String redirectRule = key.replace("redirect_", "");
                    if (redirectRule.endsWith("*")) {
                        redirectRule = redirectRule.substring(0, redirectRule.indexOf("*"));
                        if (uri.startsWith(redirectRule) && !uri.equals(redirectRule)) {
                            doGzip = false;
                        }
                    } else if (uri.equals(redirectRule)) {
                        // Do not prevent the redirect from happening.
                        doGzip = false;
                    }
                }
                if (doGzip) {
                    response.setHeader("Content-Type", "text/html");
                    response.setHeader("Content-Encoding", "gzip");
                    doFilter = false;
                    try {
                        req.getRequestDispatcher(uri.concat(".gz")).include(req, response);
                    }
                    catch(FileNotFoundException e) {
                        response.reset();
                        response.setHeader("Content-Type", "text/html");
                        response.sendError(404);
                        return;
                    }
                }
            } else if (uri.startsWith("/api/builds/") || uri.startsWith("/api/github/")) {
                response.setHeader("Cache-Control", "no-store");
                response.setHeader("Pragma", "no-cache");
            } else {
                response.setHeader("Cache-Control", "no-cache");
            }
        }
        if (doFilter) {
            chain.doFilter(req, resp);
        }

    }
}