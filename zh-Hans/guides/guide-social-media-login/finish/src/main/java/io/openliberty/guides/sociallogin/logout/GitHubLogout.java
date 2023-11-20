// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.sociallogin.logout;

import com.ibm.websphere.security.social.UserProfileManager;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Response;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RequestScoped
public class GitHubLogout implements ILogout {

    @Inject
    @ConfigProperty(name = "github.client.id")
    private String clientId;

    @Inject
    @ConfigProperty(name = "github.client.secret")
    private String clientSecret;

    public Response logout() {

        // tag::unauthorizeUrl[]
        final String unauthorizeUrl = "https://api.github.com/"
                + "applications/{client_id}/grant";
        // end::unauthorizeUrl[]

        // tag::accessToken[]
        String accessToken = UserProfileManager
                .getUserProfile()
                .getAccessToken();
        // end::accessToken[]

        // tag::createAccessTokenBody[]
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("access_token", accessToken);
        // end::createAccessTokenBody[]

        // tag::encodeAuth[]
        String auth = clientId + ":" + clientSecret;
        byte[] encodedAuthStream = Base64
                .getEncoder()
                .encode(auth.getBytes(StandardCharsets.ISO_8859_1));
        String encodedAuth = new String(encodedAuthStream);
        // end::encodeAuth[]

        // tag::delete[]
        return ClientBuilder
                .newClient()
                .target(unauthorizeUrl)
                .resolveTemplate("client_id", clientId)
                .request()
                // tag::authHeader[]
                .header("Authorization", "Basic " + encodedAuth)
                // end::authHeader[]
                // tag::addBody[]
                .method("DELETE", Entity.json(requestBody));
                // end::addBody[]
        // end::delete[]
    }
}
