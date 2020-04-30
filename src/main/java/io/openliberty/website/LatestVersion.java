/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
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
import javax.inject.Inject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.openliberty.website.data.LatestReleases;

/**
 * The Open Liberty landing page makes a request to a latestVersion.js file in order 
 * to find out the most recently released version. This servlet returns the javascript
 * file based on the data held by BuildManager. This means that as soon as a new build
 * is descovered the Open Liberty landing page will know when accessed.
 */
@WebServlet("/latestVersion.js")
public class LatestVersion extends HttpServlet {

    private static final long serialVersionUID = -1106623346121641764L;

    @Inject
    private BuildsManager manager;

    private String response;
    private String version = "0.0.0.0";
    private String template = "var latestReleasedVersion = {\r\n" +
                              "    version: '0.0.0.0',\r\n" +
                              "    productName : 'Open Liberty',\r\n" +
                              "    availableFrom : 'https://openliberty.io/downloads?welcome'\r\n" +
                              "};";

    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // send the response.
        resp.setContentType("application/javascript");
        resp.getWriter().println(response);
    }

    /**
     * This method gets the latest release and updates the template replacing the Liberty 
     * version with the most recent version.
     * 
     * Note this was written assuming that doing it in init would be more efficient, however
     * either each request results in a new servlet instance making this redundant, or there 
     * is reuse at which point the data will be stale when the whole point of this is to be
     * super current. This note is here because this needs looking at again.
     */
    public void init() {
        LatestReleases releases = manager.getLatestReleases();
        String v = releases.runtime.version;
        if (!v.equals(version)) {
            response = template.replaceAll("0\\.0\\.0\\.0", v);
            version = v;
        }
    }
}
