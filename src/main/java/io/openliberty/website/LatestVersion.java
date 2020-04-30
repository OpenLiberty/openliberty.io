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
import java.util.concurrent.atomic.AtomicReference;

import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.events.RuntimeRelease;

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

    private String template = "var latestReleasedVersion = {\r\n" +
                              "    version: '0.0.0.0',\r\n" +
                              "    productName : 'Open Liberty',\r\n" +
                              "    availableFrom : 'https://openliberty.io/downloads?welcome'\r\n" +
                              "};";

    private static AtomicReference<String> response = new AtomicReference<>();

    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // send the response.
        resp.setContentType("application/javascript");
        resp.getWriter().println(response.get());
    }

    /**
     * This method gets the latest release and updates the template replacing the Liberty 
     * version with the most recent version.
     * 
     */
    public void init() {
        releaseUpdate(manager.getLatestReleases().runtime);
    }

    /**
     * This method will update the response value when it is notified of a change
     * to the runtime release.
     * 
     * @param releaseInfo the build info of the supplied release build
     */
    public void releaseUpdate(@Observes @RuntimeRelease BuildInfo releaseInfo) {
        String newValue = template.replaceAll("0\\.0\\.0\\.0", releaseInfo.version);

        response.set(newValue);
    }
}