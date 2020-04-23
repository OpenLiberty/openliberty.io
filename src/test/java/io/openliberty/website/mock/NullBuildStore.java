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
package io.openliberty.website.mock;

import javax.ws.rs.core.Response;

import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.dheclient.BuildStore;
import io.openliberty.website.dheclient.data.BuildListInfo;

public class NullBuildStore implements BuildStore {

    @Override
    public BuildListInfo getBuildListInfo(String downloadType, String buildType) {
        return null;
    }

    @Override
    public BuildInfo getBuildInfo(String downloadType, String buildType, String version) {
        return null;
    }

    @Override
    public Response getFileData(String downloadType, String buildType, String version, String fileName) {
        return null;
    }
    
}
