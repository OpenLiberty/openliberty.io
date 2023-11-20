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

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

@RequestScoped
public class LogoutHandler {

    // tag::inject[]
    @Inject
    private GitHubLogout gitHubLogout;
    // end::inject[]

    // tag::githubLoginName[]
    private static final String GITHUB_LOGIN = "githubLogin";
    // end::githubLoginName[]

    public ILogout getLogout() {
        // tag::socialMediaName[]
        String socialMediaName = UserProfileManager.getUserProfile()
                                                   .getSocialMediaName();
        // end::socialMediaName[]
        // tag::switch[]
        switch (socialMediaName) {
            // tag::handleGithubLogout[]
            case GITHUB_LOGIN:
                return gitHubLogout;
            // end::handleGithubLogout[]
            default:
                throw new UnsupportedOperationException("Cannot find the right logout "
                        + "service for social media name " + socialMediaName);
        // end::switch[]
        }
    }
}
