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

import javax.json.bind.annotation.JsonbProperty;

import io.openliberty.website.Constants;

/**
 * This is a JSON-B object that holds information abou the most recent 
 * release of the runtime and tools.
 */
public class LatestReleases {

	@JsonbProperty(Constants.RUNTIME)
	public BuildInfo runtime;
	@JsonbProperty(Constants.TOOLS)
	public BuildInfo tools;
	

	public LatestReleases() {
	}

	public LatestReleases(BuildInfo runtime, BuildInfo tools) {
		this.runtime = runtime;
		this.tools = tools;
	}
}
