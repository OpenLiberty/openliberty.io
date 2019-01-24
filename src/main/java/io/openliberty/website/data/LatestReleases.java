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

public class LatestReleases {
	private BuildInfo runtime;
	private BuildInfo tools;

	public LatestReleases() {
	}

	public LatestReleases(BuildInfo runtime, BuildInfo tools) {
		this.runtime = runtime;
		this.tools = tools;
	}

	public JsonObject asJsonObject() {
		JsonObjectBuilder json = Json.createObjectBuilder();
		if (runtime != null) {
			json.add(Constants.RUNTIME, runtime.asJsonObject());
		}
		if (tools != null) {
			json.add(Constants.TOOLS, tools.asJsonObject());
		}
		return json.build();
	}

	public BuildInfo getRuntimeRelease() {
		return runtime;
	}
}
