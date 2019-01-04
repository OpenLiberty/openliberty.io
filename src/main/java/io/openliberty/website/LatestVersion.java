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

@WebServlet("/latestVersion.js")
public class LatestVersion extends HttpServlet {

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
    resp.getWriter().println(response);
  }

  public void init() {
    LatestReleases releases = manager.getLatestReleases();
    String v = releases.getRuntimeRelease().getVersion();
    if (!v.equals(version)) {
      response = template.replaceAll("0\\.0\\.0\\.0", v);
      version = v;
    }
  }
}
