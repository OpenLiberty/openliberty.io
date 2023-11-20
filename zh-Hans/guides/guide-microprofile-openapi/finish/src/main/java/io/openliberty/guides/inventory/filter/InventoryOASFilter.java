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
package io.openliberty.guides.inventory.filter;

import java.util.Arrays;
import java.util.Collections;

import org.eclipse.microprofile.openapi.OASFactory;
import org.eclipse.microprofile.openapi.OASFilter;
import org.eclipse.microprofile.openapi.models.OpenAPI;
import org.eclipse.microprofile.openapi.models.info.License;
import org.eclipse.microprofile.openapi.models.info.Info;
import org.eclipse.microprofile.openapi.models.responses.APIResponse;
import org.eclipse.microprofile.openapi.models.servers.Server;
import org.eclipse.microprofile.openapi.models.servers.ServerVariable;

public class InventoryOASFilter implements OASFilter {

  @Override
  // tag::filterAPIResponse[]
  public APIResponse filterAPIResponse(APIResponse apiResponse) {
    if ("Missing description".equals(apiResponse.getDescription())) {
      apiResponse.setDescription("Invalid hostname or the system service may not "
          + "be running on the particular host.");
    }
    return apiResponse;
  }
  // end::filterAPIResponse[]

  @Override
  // tag::filterOpenAPI[]
  // tag::OpenAPI[]
  public void filterOpenAPI(OpenAPI openAPI) {
  // end::OpenAPI[]
    // tag::oasfactory[]
    openAPI.setInfo(
        OASFactory.createObject(Info.class).title("Inventory App").version("1.0")
                  .description(
                      "App for storing JVM system properties of various hosts.")
                  .license(
                      OASFactory.createObject(License.class)
                                .name("Eclipse Public License - v 1.0").url(
                                    "https://www.eclipse.org/legal/epl-v10.html")));

    openAPI.addServer(
        OASFactory.createServer()
                  .url("http://localhost:{port}")
                  .description("Simple Open Liberty.")
                  .variables(Collections.singletonMap("port",
                                 OASFactory.createServerVariable()
                                           .defaultValue("9080")
                                           .description("Server HTTP port."))));
    // end::oasfactory[]
  }
  // end::filterOpenAPI[]

}
