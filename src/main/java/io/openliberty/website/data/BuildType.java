/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.data;

import io.openliberty.website.Constants;

public enum BuildType {
    runtime_releases(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT),
    runtime_nightly_builds(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT),
    tools_releases(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT),
    tools_nightly_builds(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT);

    private String type;
    private String stability;

    BuildType(String type, String stability) {
        this.type = type;
        this.stability = stability;
    }

    public String getType() {
        return type;
    }

    public String getStability() {
        return stability;
    }

    public String getURISegment() {
        return type + "/" + stability;
    }
}

