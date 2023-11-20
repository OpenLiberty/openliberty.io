// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.deepdive.rest;

import java.net.URI;
import java.util.List;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.enums.ParameterIn;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameters;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponseSchema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.rest.client.RestClientBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;

import io.openliberty.deepdive.rest.client.SystemClient;
import io.openliberty.deepdive.rest.client.UnknownUriExceptionMapper;
import io.openliberty.deepdive.rest.model.SystemData;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("/systems")
public class SystemResource {

    @Inject
    Inventory inventory;

    @Inject
    @ConfigProperty(name = "client.https.port")
    String CLIENT_PORT;

    // tag::jwt[]
    @Inject
    JsonWebToken jwt;
    // end::jwt[]

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponseSchema(value = SystemData.class,
        responseDescription = "A list of system data stored within the inventory.",
        responseCode = "200")
    @Operation(
        summary = "List contents.",
        description = "Returns the currently stored system data in the inventory.",
        operationId = "listContents")
    public List<SystemData> listContents() {
        return inventory.getSystems();
    }

    @GET
    @Path("/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponseSchema(value = SystemData.class,
        responseDescription = "System data of a particular host.",
        responseCode = "200")
    @Operation(
        summary = "Get System",
        description = "Retrieves and returns the system data from the system "
                      + "service running on the particular host.",
        operationId = "getSystem"
    )
    public SystemData getSystem(
        @Parameter(
            name = "hostname", in = ParameterIn.PATH,
            description = "The hostname of the system",
            required = true, example = "localhost",
            schema = @Schema(type = SchemaType.STRING)
        )
        @PathParam("hostname") String hostname) {
        return inventory.getSystem(hostname);
    }

    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    @APIResponses(value = {
        @APIResponse(responseCode = "200",
            description = "Successfully added system to inventory"),
        @APIResponse(responseCode = "400",
            description = "Unable to add system to inventory")
    })
    @Parameters(value = {
        @Parameter(
            name = "hostname", in = ParameterIn.QUERY,
            description = "The hostname of the system",
            required = true, example = "localhost",
            schema = @Schema(type = SchemaType.STRING)),
        @Parameter(
            name = "osName", in = ParameterIn.QUERY,
            description = "The operating system of the system",
            required = true, example = "linux",
            schema = @Schema(type = SchemaType.STRING)),
        @Parameter(
            name = "javaVersion", in = ParameterIn.QUERY,
            description = "The Java version of the system",
            required = true, example = "11",
            schema = @Schema(type = SchemaType.STRING)),
        @Parameter(
            name = "heapSize", in = ParameterIn.QUERY,
            description = "The heap size of the system",
            required = true, example = "1048576",
            schema = @Schema(type = SchemaType.NUMBER)),
    })
    @Operation(
        summary = "Add system",
        description = "Add a system and its data to the inventory.",
        operationId = "addSystem"
    )
    public Response addSystem(
        @QueryParam("hostname") String hostname,
        @QueryParam("osName") String osName,
        @QueryParam("javaVersion") String javaVersion,
        @QueryParam("heapSize") Long heapSize) {

        SystemData s = inventory.getSystem(hostname);
        if (s != null) {
            return fail(hostname + " already exists.");
        }
        inventory.add(hostname, osName, javaVersion, heapSize);
        return success(hostname + " was added.");
    }

    // tag::put[]
    @PUT
    // end::put[]
    // tag::putEndpoint[]
    @Path("/{hostname}")
    // end::putEndpoint[]
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    // tag::putRolesAllowed[]
    @RolesAllowed({ "admin", "user" })
    // end::putRolesAllowed[]
    @APIResponses(value = {
        @APIResponse(responseCode = "200",
            description = "Successfully updated system"),
        @APIResponse(responseCode = "400",
           description =
               "Unable to update because the system does not exist in the inventory.")
    })
    @Parameters(value = {
        @Parameter(
            name = "hostname", in = ParameterIn.PATH,
            description = "The hostname of the system",
            required = true, example = "localhost",
            schema = @Schema(type = SchemaType.STRING)),
        @Parameter(
            name = "osName", in = ParameterIn.QUERY,
            description = "The operating system of the system",
            required = true, example = "linux",
            schema = @Schema(type = SchemaType.STRING)),
        @Parameter(
            name = "javaVersion", in = ParameterIn.QUERY,
            description = "The Java version of the system",
            required = true, example = "11",
            schema = @Schema(type = SchemaType.STRING)),
        @Parameter(
            name = "heapSize", in = ParameterIn.QUERY,
            description = "The heap size of the system",
            required = true, example = "1048576",
            schema = @Schema(type = SchemaType.NUMBER)),
    })
    @Operation(
        summary = "Update system",
        description = "Update a system and its data on the inventory.",
        operationId = "updateSystem"
    )
    public Response updateSystem(
        @PathParam("hostname") String hostname,
        @QueryParam("osName") String osName,
        @QueryParam("javaVersion") String javaVersion,
        @QueryParam("heapSize") Long heapSize) {

        SystemData s = inventory.getSystem(hostname);
        if (s == null) {
            return fail(hostname + " does not exists.");
        }
        s.setOsName(osName);
        s.setJavaVersion(javaVersion);
        s.setHeapSize(heapSize);
        inventory.update(s);
        return success(hostname + " was updated.");
    }

    // tag::delete[]
    @DELETE
    // end::delete[]
    // tag::deleteEndpoint[]
    @Path("/{hostname}")
    // end::deleteEndpoint[]
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    // tag::deleteRolesAllowed[]
    @RolesAllowed({ "admin" })
    // end::deleteRolesAllowed[]
    @APIResponses(value = {
        @APIResponse(responseCode = "200",
            description = "Successfully deleted the system from inventory"),
        @APIResponse(responseCode = "400",
            description =
                "Unable to delete because the system does not exist in the inventory")
    })
    @Parameter(
        name = "hostname", in = ParameterIn.PATH,
        description = "The hostname of the system",
        required = true, example = "localhost",
        schema = @Schema(type = SchemaType.STRING)
    )
    @Operation(
        summary = "Remove system",
        description = "Removes a system from the inventory.",
        operationId = "removeSystem"
    )
    public Response removeSystem(@PathParam("hostname") String hostname) {
        SystemData s = inventory.getSystem(hostname);
        if (s != null) {
            inventory.removeSystem(s);
            return success(hostname + " was removed.");
        } else {
            return fail(hostname + " does not exists.");
        }
    }

    // tag::addSystemClient[]
    @POST
    @Path("/client/{hostname}")
    // end::addSystemClient[]
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    @RolesAllowed({ "admin" })
    @APIResponses(value = {
        @APIResponse(responseCode = "200",
            description = "Successfully added system client"),
        @APIResponse(responseCode = "400",
            description = "Unable to add system client")
    })
    @Parameter(
        name = "hostname", in = ParameterIn.PATH,
        description = "The hostname of the system",
        required = true, example = "localhost",
        schema = @Schema(type = SchemaType.STRING)
    )
    @Operation(
        summary = "Add system client",
        description = "This adds a system client.",
        operationId = "addSystemClient"
    )
    public Response addSystemClient(@PathParam("hostname") String hostname) {

        SystemData s = inventory.getSystem(hostname);
        if (s != null) {
            return fail(hostname + " already exists.");
        }

        // tag::getCustomRestClient[]
        SystemClient customRestClient = null;
        try {
            customRestClient = getSystemClient(hostname);
        } catch (Exception e) {
            return fail("Failed to create the client " + hostname + ".");
        }
        // end::getCustomRestClient[]

        // tag::authHeader[]
        String authHeader = "Bearer " + jwt.getRawToken();
        // end::authHeader[]
        try {
            // tag::customRestClient[]
            String osName = customRestClient.getProperty(authHeader, "os.name");
            String javaVer = customRestClient.getProperty(authHeader, "java.version");
            Long heapSize = customRestClient.getHeapSize(authHeader);
            // end::customRestClient[]
            // tag::addSystem[]
            inventory.add(hostname, osName, javaVer, heapSize);
            // end::addSystem[]
        } catch (Exception e) {
            return fail("Failed to reach the client " + hostname + ".");
        }
        return success(hostname + " was added.");
    }

    // tag::getSystemClient[]
    private SystemClient getSystemClient(String hostname) throws Exception {
        String customURIString = "https://" + hostname + ":" + CLIENT_PORT + "/system";
        URI customURI = URI.create(customURIString);
        return RestClientBuilder.newBuilder()
                                .baseUri(customURI)
                                .register(UnknownUriExceptionMapper.class)
                                .build(SystemClient.class);
    }
    // end::getSystemClient[]

    private Response success(String message) {
        return Response.ok("{ \"ok\" : \"" + message + "\" }").build();
    }

    private Response fail(String message) {
        return Response.status(Response.Status.BAD_REQUEST)
                       .entity("{ \"error\" : \"" + message + "\" }")
                       .build();
    }
}
