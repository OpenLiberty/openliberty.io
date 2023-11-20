// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.query.client;

import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Name;

import io.openliberty.guides.graphql.models.SystemInfo;
import io.openliberty.guides.graphql.models.SystemLoad;
import io.smallrye.graphql.client.typesafe.api.GraphQLClientApi;

// tag::clientApi[]
@GraphQLClientApi
// end::clientApi[]
public interface GraphQlClient {
    // tag::querySystemTag[]
    @Query
    // end::querySystemTag[]
    // tag::systemInfo[]
    SystemInfo system(@Name("hostname") String hostname);
    // end::systemInfo[]

    // tag::querySystemLoadTag[]
    @Query("systemLoad")
    // end::querySystemLoadTag[]
    // tag::systemLoad[]
    SystemLoad[] getSystemLoad(@Name("hostnames") String[] hostnames);
    // end::systemLoad[]

    // tag::mutationTag[]
    @Mutation
    // end::mutationTag[]
    // tag::editNote[]
    boolean editNote(@Name("hostname") String host, @Name("note") String note);
    // end::editNote[]

}
