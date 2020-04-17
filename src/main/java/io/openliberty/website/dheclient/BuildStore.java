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
package io.openliberty.website.dheclient;

import java.time.temporal.ChronoUnit;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.rest.client.annotation.RegisterProvider;
import org.eclipse.microprofile.rest.client.annotation.RegisterProviders;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import io.openliberty.website.Constants;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.data.BuildType;
import io.openliberty.website.dheclient.data.BuildInfoMessageBodyReader;
import io.openliberty.website.dheclient.data.BuildListInfo;
import io.openliberty.website.dheclient.data.BuildListInfoMessageBodyReader;

@RegisterRestClient(baseUri = Constants.DHE_URL)
@RegisterProviders({@RegisterProvider(BuildListInfoMessageBodyReader.class), @RegisterProvider(BuildInfoMessageBodyReader.class)})
public interface BuildStore {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{downloadType}/{buildType}/info.json")
    @Retry(delay = 2, delayUnit = ChronoUnit.SECONDS)
    public BuildListInfo getBuildListInfo(@PathParam("downloadType") String downloadType, @PathParam("buildType") String buildType);

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{downloadType}/{buildType}/{version}/info.json")
    @Retry(delay = 2, delayUnit = ChronoUnit.SECONDS)
    public BuildInfo getBuildInfo(@PathParam("downloadType") String downloadType, @PathParam("buildType") String buildType, @PathParam("version") String version);


    public default BuildInfo getBuildInfo(BuildType type, String version) {
        return getBuildInfo(type.getType(), type.getStability(), version);
    }

    public default BuildListInfo getBuildListInfo(BuildType type) {
        return getBuildListInfo(type.getType(), type.getStability());
    }
}