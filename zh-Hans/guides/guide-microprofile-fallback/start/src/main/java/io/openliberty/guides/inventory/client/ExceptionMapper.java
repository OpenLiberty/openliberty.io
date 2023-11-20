// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
// tag::mapper[]
package io.openliberty.guides.inventory.client;

import java.io.IOException;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.rest.client.ext.ResponseExceptionMapper;

@Provider
public class ExceptionMapper implements ResponseExceptionMapper<Exception> {

  @Override
  public boolean handles(int status, MultivaluedMap<String, Object> headers) {
    return status == 404 // UnknownURLException
        || status == 503; // Fallback Exception
  }

  @Override
  public Exception toThrowable(Response response) {
    switch (response.getStatus()) {
    case 404:
      return new UnknownUrlException();
    case 503:
      return new IOException();
    default :
      return null;
    }
  }
}
// end::mapper[]
