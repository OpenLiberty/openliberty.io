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
import javax.inject.Inject;

import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.data.BuildType;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.data.LatestReleases;
import io.openliberty.website.dheclient.DHEBuildParser;

import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class BuildsManager {

    private static final Logger logger = Logger.getLogger(BuildsManager.class.getName());

    @Inject
    private DHEBuildParser dheBuilds;

    /** Defined default constructor */
    public BuildsManager() {
    }

    /** Allow for unittest injection */
    BuildsManager(DHEBuildParser dheBuilds) {
        if (logger.isLoggable(Level.FINER)) {
            logger.log(Level.FINE, "BuildsManager() ", dheBuilds);
        }
        this.dheBuilds = dheBuilds;
    }

    public BuildData getData() {
        return dheBuilds.getBuildData();
    }

    public Map<BuildType, Set<BuildInfo>> getBuilds() {
        return dheBuilds.getBuildData().builds;
    }

    public LatestReleases getLatestReleases() {
        return dheBuilds.getBuildData().latestReleases;
    }

    public LastUpdate getStatus() {
        return dheBuilds.getLastUpdate();
    }
}
