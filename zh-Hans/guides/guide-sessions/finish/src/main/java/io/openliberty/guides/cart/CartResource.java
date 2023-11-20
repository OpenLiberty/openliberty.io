// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.cart;

import java.util.Enumeration;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;

@Path("/")
public class CartResource {

    @POST
    // tag::endpointCartItemPrice[]
    @Path("cart/{item}&{price}")
    // end::endpointCartItemPrice[]
    @Produces(MediaType.TEXT_PLAIN)
    @APIResponse(responseCode = "200", description = "Item successfully added to cart.")
    @Operation(summary = "Add a new item to cart.")
    // tag::addToCart[]
    public String addToCart(@Context HttpServletRequest request,
                    @Parameter(description = "Item you need for intergalatic travel.",
                               required = true)
                    // tag::item[]
                    @PathParam("item") String item,
                    // end::item[]
                    @Parameter(description = "Price for this item.",
                               required = true)
                    // tag::price[]
                    @PathParam("price") double price) {
                    // end::price[]
        // tag::getSession[]
        HttpSession session = request.getSession();
        // end::getSession[]
        // tag::setAttribute[]
        session.setAttribute(item, price);
        // end::setAttribute[]
        return item + " added to your cart and costs $" + price;
    }
    // end::addToCart[]

    @GET
    // tag::endpointCart[]
    @Path("cart")
    // end::endpointCart[]
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponse(responseCode = "200",
        description = "Items successfully retrieved from your cart.")
    @Operation(summary = "Return an JsonObject instance which contains "
                        + "the items in your cart and the subtotal.")
    // tag::getCart[]
    public JsonObject getCart(@Context HttpServletRequest request) {
        HttpSession session = request.getSession();
        Enumeration<String> names = session.getAttributeNames();
        JsonObjectBuilder builder = Json.createObjectBuilder();
        // tag::podname[]
        builder.add("pod-name", getHostname());
        // end::podname[]
        // tag::sessionid[]
        builder.add("session-id", session.getId());
        // end::sessionid[]
        JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();
        Double subtotal = 0.0;
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            String price = session.getAttribute(name).toString();
            arrayBuilder.add(name + " | $" + price);
            subtotal += Double.valueOf(price).doubleValue();
        }
        // tag::cart[]
        builder.add("cart", arrayBuilder);
        // end::cart[]
        builder.add("subtotal", subtotal);
        return builder.build();
    }
    // end::getCart[]

    private String getHostname() {
        String hostname = System.getenv("HOSTNAME");
        if (hostname == null) {
            hostname = "localhost";
        }
        return hostname;
    }
}
