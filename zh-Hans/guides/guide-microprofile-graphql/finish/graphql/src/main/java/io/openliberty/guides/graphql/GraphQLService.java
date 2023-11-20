// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2021, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.graphql;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.inject.Inject;
import jakarta.ws.rs.ProcessingException;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Name;
import org.eclipse.microprofile.graphql.NonNull;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;
import org.eclipse.microprofile.rest.client.RestClientBuilder;

import io.openliberty.guides.graphql.client.SystemClient;
import io.openliberty.guides.graphql.client.UnknownUriException;
import io.openliberty.guides.graphql.client.UnknownUriExceptionMapper;
import io.openliberty.guides.graphql.models.JavaInfo;
import io.openliberty.guides.graphql.models.SystemInfo;
import io.openliberty.guides.graphql.models.SystemLoad;
import io.openliberty.guides.graphql.models.SystemLoadData;
import io.openliberty.guides.graphql.models.SystemMetrics;

// tag::graphqlapi[]
@GraphQLApi
// end::graphqlapi[]
public class GraphQLService {

    private static Map<String, SystemClient> clients =
            Collections.synchronizedMap(new HashMap<String, SystemClient>());

    @Inject
    @ConfigProperty(name = "system.http.port", defaultValue = "9080")
    String SYSTEM_PORT;

    // tag::query1[]
    @Query("system")
    // end::query1[]
    // tag::nonnull1[]
    @NonNull
    // end::nonnull1[]
    // tag::description1[]
    @Description("Gets information about the system")
    // end::description1[]
    // tag::getSystemInfo[]
    // tag::getSystemInfoHeader[]
    public SystemInfo getSystemInfo(@Name("hostname") String hostname)
        throws ProcessingException, UnknownUriException {
    // end::getSystemInfoHeader[]
        SystemClient systemClient = getSystemClient(hostname);
        SystemInfo systemInfo = new SystemInfo();
        systemInfo.setHostname(hostname);
        systemInfo.setUsername(systemClient.queryProperty("user.name"));
        systemInfo.setOsName(systemClient.queryProperty("os.name"));
        systemInfo.setOsArch(systemClient.queryProperty("os.arch"));
        systemInfo.setOsVersion(systemClient.queryProperty("os.version"));
        systemInfo.setNote(systemClient.queryProperty("note"));

        return systemInfo;
    }
    // end::getSystemInfo[]

    // tag::mutation[]
    @Mutation("editNote")
    // end::mutation[]
    // tag::description2[]
    @Description("Changes the note set for the system")
    // end::description2[]
    // tag::editNoteFunction[]
    // tag::editNoteHeader[]
    public boolean editNote(@Name("hostname") String hostname,
                            @Name("note") String note)
        throws ProcessingException, UnknownUriException {
    // end::editNoteHeader[]
        SystemClient systemClient = getSystemClient(hostname);
        systemClient.editNote(note);
        return true;
    }
    // end::editNoteFunction[]

    // tag::query2[]
    @Query("systemLoad")
    // end::query2[]
    // tag::description3[]
    @Description("Gets system load data from the systems")
    // end::description3[]
    // tag::getSystemLoad[]
    // tag::getSystemLoadHeader[]
    public SystemLoad[] getSystemLoad(@Name("hostnames") String[] hostnames)
        throws ProcessingException, UnknownUriException {
    // end::getSystemLoadHeader[]
        if (hostnames == null || hostnames.length == 0) {
            return new SystemLoad[0];
        }

        List<SystemLoad> systemLoads = new ArrayList<SystemLoad>(hostnames.length);

        for (String hostname : hostnames) {
            SystemLoad systemLoad = new SystemLoad();
            systemLoad.setHostname(hostname);
            systemLoads.add(systemLoad);
        }

        return systemLoads.toArray(new SystemLoad[systemLoads.size()]);
    }
    // end::getSystemLoad[]

    // Nested objects, these can be expensive to obtain
    // tag::nonnull3[]
    @NonNull
    // tag::nonnull3[]
    // tag::systemMetricsFunction[]
    // tag::systemMetricsHeader[]
    public SystemMetrics systemMetrics(
        @Source @Name("system") SystemInfo systemInfo)
        throws ProcessingException, UnknownUriException {
    // end::systemMetricsHeader[]
        String hostname = systemInfo.getHostname();
        SystemClient systemClient = getSystemClient(hostname);
        return systemClient.getSystemMetrics();
    }
    // end::systemMetricsFunction[]

    // tag::nonnull4[]
    @NonNull
    // end::nonnull4[]
    // tag::javaFunction[]
    // tag::javaHeader[]
    public JavaInfo java(@Source @Name("system") SystemInfo systemInfo)
        throws ProcessingException, UnknownUriException {
    // end::javaHeader[]
        String hostname = systemInfo.getHostname();
        SystemClient systemClient = getSystemClient(hostname);
        return systemClient.java();
    }
    // end::javaFunction[]

    // tag::loadData[]
    // tag::loadDataHeader[]
    public SystemLoadData loadData(@Source @Name("systemLoad") SystemLoad systemLoad)
        throws ProcessingException, UnknownUriException {
    // end::loadDataHeader[]
        String hostname = systemLoad.getHostname();
        SystemClient systemClient = getSystemClient(hostname);
        return systemClient.getSystemLoad();
    }
    // end::loadData[]

    private SystemClient getSystemClient(String hostname) {
        SystemClient sc = clients.get(hostname);
        if (sc == null) {
            String customURIString = "http://" + hostname + ":"
                                      + SYSTEM_PORT + "/system";
            URI customURI = URI.create(customURIString);
            sc = RestClientBuilder
                   .newBuilder()
                   .baseUri(customURI)
                   .register(UnknownUriExceptionMapper.class)
                   .build(SystemClient.class);
            clients.put(hostname, sc);
        }
        return sc;
    }
}
