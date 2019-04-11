/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.data;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import io.openliberty.website.Constants;

public class BuildData {
	private LatestReleases latestReleases;
	private BuildLists builds;

	public BuildData(LatestReleases latestReleases, BuildLists builds) {
		this.latestReleases = latestReleases;
		this.builds = builds;
	}

	public JsonObject asJsonObject() {
		JsonObjectBuilder data = Json.createObjectBuilder();
		data.add(Constants.LATEST_RELEASES, latestReleases != null ? latestReleases.asJsonObject() : Json.createObjectBuilder().build());
		data.add(Constants.BUILDS, builds != null ? builds.asJsonObject() : Json.createObjectBuilder().build());
		return data.build();
	}

	public LatestReleases getLatestReleases() {
		return latestReleases;
	}

	public BuildLists getBuilds() {
		return builds;
	}

}
