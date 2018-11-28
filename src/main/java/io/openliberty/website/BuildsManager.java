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
import io.openliberty.website.data.BuildLists;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.data.LatestReleases;
import io.openliberty.website.dheclient.DHEBuildParser;

@ApplicationScoped
public class BuildsManager {
	@Inject
	private DHEBuildParser dheBuilds;

	/** Defined default constructor */
	public BuildsManager() {
	}

	/** Allow for unittest injection */
	BuildsManager(DHEBuildParser dheBuilds) {
		this.dheBuilds = dheBuilds;
	}

	public BuildData getData() {
		return dheBuilds.getBuildData();
	}

	public BuildLists getBuilds() {
		return dheBuilds.getBuildData().getBuilds();
	}

	public LatestReleases getLatestReleases() {
		return dheBuilds.getBuildData().getLatestReleases();
	}

	public LastUpdate getStatus() {
		return dheBuilds.getLastUpdate();
	}

	public LastUpdate updateBuilds() {
		return dheBuilds.blockingUpdate();
	}

}
