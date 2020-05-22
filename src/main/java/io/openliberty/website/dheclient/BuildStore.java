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

/**
 * This interface is a MicroProfile REST client template interface that supports making calls
 * to DHE to read the build list files and the build info ones. There are two MP REST client
 * methods and there are two convenience methods, clients are expected to use the convenience
 * methods and not the MP REST client annotated methods.
 * 
 * <p>The DHE build repoository is structured as follows:
 * 
 * <pre>
 * - runtime
 *    - release
 *      - info.json - list of available builds
 *      - <date-time> - a build as referenced in info.json
 *        - info.json - the info about the build
 *    - nightly
 *      - info.json - list of available builds
 *      - <date-time> - a build as referenced in info.json
 *        - info.json - the info about the build
 * - tools
 *    - release
 *      - info.json - list of available builds
 *      - <date-time> - a build as referenced in info.json
 *        - info.json - the info about the build
 *    - nightly
 *      - info.json - list of available builds
 *      - <date-time> - a build as referenced in info.json
 *        - info.json - the info about the build
 * </pre>
 * </p>
 */
@RegisterRestClient(baseUri = Constants.DHE_URL)
@RegisterProviders({@RegisterProvider(BuildListInfoMessageBodyReader.class), @RegisterProvider(BuildInfoMessageBodyReader.class)})
public interface BuildStore {
    /**
     * This method fetches from DHE the list of available builds in the repository based on the type 
     * of download (runtime vs tools) and the type of build (whether it is a nighly build or a GA one). 
     * @param downloadType The type of download (runtime or tools)
     * @param buildType The build type (nightly or release)
     * @return The List of available builds.
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{downloadType}/{buildType}/info.json")
    @Retry(delay = 2, delayUnit = ChronoUnit.SECONDS)
    public BuildListInfo getBuildListInfo(@PathParam("downloadType") String downloadType, @PathParam("buildType") String buildType);

    /**
     * This method fetches from DHE the info about a specific build in the repository based on the type 
     * of download (runtime vs tools) and the type of build (whether it is a nighly build or a GA one). 
     * @param downloadType The type of download (runtime or tools)
     * @param buildType The build type (nightly or release)
     * @param version The date/time that the build was published (nominally referred to in DHE as version)
     * @return The info about this build
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{downloadType}/{buildType}/{version}/info.json")
    @Retry(delay = 2, delayUnit = ChronoUnit.SECONDS)
    public BuildInfo getBuildInfo(@PathParam("downloadType") String downloadType, @PathParam("buildType") String buildType, @PathParam("version") String version);

    /**
     * This is a convenience method to allow getting a BuildInfo using the BuildType annotation so
     * clients do not need to know how to unpack this into the DHE structure. 
     * 
     * @param type the type of the build
     * @param version the exact build to fetch
     * @return the info about the build
     */
    public default BuildInfo getBuildInfo(BuildType type, String version) {
        return getBuildInfo(type.getType(), type.getStability(), version);
    }

    /**
     * This is a convenience method to enable fetching the list of builds using the BuildType annotation
     * so clients do not need to know how to unpack this into the DHE structure.
     * 
     * @param type the type of this build
     * @return the list of available builds.
     */
    public default BuildListInfo getBuildListInfo(BuildType type) {
        return getBuildListInfo(type.getType(), type.getStability());
    }
}