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

/**
 * This enum represents the kinds of builds in the build repository. In DHE there is a two level
 * hierarchy of builds, but in the backend that is kind of klunky and difficult to deal with, so
 * we just flatten them.
 */
public enum BuildType {
    runtime_releases(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT, true),
    runtime_nightly_builds(Constants.DHE_RUNTIME_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT, false),
    tools_releases(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_RELEASE_PATH_SEGMENT, false),
    tools_nightly_builds(Constants.DHE_TOOLS_PATH_SEGMENT, Constants.DHE_NIGHTLY_PATH_SEGMENT, false);

    private String type;
    private String stability;
    private boolean notifyOfLatest = false;

    BuildType(String type, String stability, boolean notify) {
        this.type = type;
        this.stability = stability;
        this.notifyOfLatest = notify;
    }

    /**
     * @return Whether this is a runtime or tools download
     */
    public String getType() {
        return type;
    }

    /**
     * @return Whether this build is a release or a nighly driver
     */
    public String getStability() {
        return stability;
    }

    /**
     * @return Whether this type of build should be notified as a CDI event if it is latest
     */
    public boolean isLatestBuildNotifiable() {
        return notifyOfLatest;
    }

    /**
     * @return the uri segment under the build repository for this type of build.
     */
    public String getURISegment() {
        return type + "/" + stability;
    }
}

