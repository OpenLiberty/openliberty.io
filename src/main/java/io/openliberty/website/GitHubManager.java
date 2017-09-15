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

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

@ApplicationScoped
public class GitHubManager {

    private Client client = null;

    public GitHubManager() {
        client = ClientBuilder.newClient();
    }

    public String getIssues() {
        WebTarget target = client.target(Constants.GITHUB_ISSUES_URL);
        Builder builder = target.request("application/json");
        builder.header("Authorization", "Basic " + System.getenv(Constants.PAT_ENV_VARIABLE_NAME));
        Response response = builder.get();
        return response.readEntity(String.class);
    }

}
