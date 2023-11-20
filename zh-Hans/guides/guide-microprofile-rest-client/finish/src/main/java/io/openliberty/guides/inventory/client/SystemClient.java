// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2018, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
// tag::client[]
package io.openliberty.guides.inventory.client;

import java.util.Properties;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.rest.client.annotation.RegisterProvider;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

// tag::RegisterRestClient[]
@RegisterRestClient(configKey = "systemClient",
                     baseUri = "http://localhost:9080/system")
// end::RegisterRestClient[]
// tag::RegisterProvider[]
@RegisterProvider(UnknownUriExceptionMapper.class)
// end::RegisterProvider[]
@Path("/properties")
// tag::SystemClient[]
// tag::AutoCloseable[]
public interface SystemClient extends AutoCloseable {
// end::AutoCloseable[]

  @GET
  // tag::Produces[]
  @Produces(MediaType.APPLICATION_JSON)
  // end::Produces[]
  // tag::getProperties[]
  Properties getProperties() throws UnknownUriException, ProcessingException;
  // end::getProperties[]
}
// end::SystemClient[]
// end::client[]
