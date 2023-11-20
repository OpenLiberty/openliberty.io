// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.query.client;

import java.util.List;
import java.util.Properties;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.glassfish.jersey.client.rx.rxjava.RxObservableInvoker;
import org.glassfish.jersey.client.rx.rxjava.RxObservableInvokerProvider;

import rx.Observable;

@RequestScoped
public class InventoryClient {

    @Inject
    @ConfigProperty(name = "INVENTORY_BASE_URI", defaultValue = "http://localhost:9085")
    private String baseUri;

    public List<String> getSystems() {
        return ClientBuilder.newClient()
                            .target(baseUri)
                            .path("/inventory/systems")
                            .request()
                            .header(HttpHeaders.CONTENT_TYPE,
                            MediaType.APPLICATION_JSON)
                            .get(new GenericType<List<String>>() { });
    }

    // tag::getSystem[]
    public Observable<Properties> getSystem(String hostname) {
        return ClientBuilder.newClient()
                            .target(baseUri)
                            // tag::register[]
                            .register(RxObservableInvokerProvider.class)
                            // end::register[]
                            .path("/inventory/systems")
                            .path(hostname)
                            .request()
                            .header(HttpHeaders.CONTENT_TYPE,
                            MediaType.APPLICATION_JSON)
                            // tag::rx[]
                            .rx(RxObservableInvoker.class)
                            // end::rx[]
                            .get(new GenericType<Properties>() { });
    }
    // end::getSystem[]
}
