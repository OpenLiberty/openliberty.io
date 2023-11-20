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
package it.io.openliberty.guides.cart;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.Invocation.Builder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class CartSessionIT {
    private Client client;
    private static String serverport = System.getProperty("http.port");
    private static final String ITEM = "SpaceShip";
    private static final String PRICE = "20.0";
    private static final String POST = "POST";
    private static final String GET = "GET";

    @BeforeEach
    public void setup() {
        client = ClientBuilder.newClient();
    }

    @AfterEach
    public void teardown() {
        client.close();
    }

    @Test
    public void testEmptyCart() {
        Response response = getResponse(GET, serverport, null);
        assertResponse(getURL(GET, serverport), response);

        JsonObject obj = response.readEntity(JsonObject.class);
        assertTrue(obj.getJsonArray("cart").isEmpty(),
                   "The cart should be empty on application start but was not");

        response.close();
    }

    @Test
    public void testOneServer() {
        Response addToCartResponse = getResponse(POST, serverport, null);
        assertResponse(getURL(POST, serverport), addToCartResponse);

        Map<String, NewCookie> cookies = addToCartResponse.getCookies();
        Cookie cookie = ((NewCookie) cookies.values().iterator().next()).toCookie();

        Response getCartResponse = getResponse(GET, serverport, cookie);
        assertResponse(getURL(POST, serverport), getCartResponse);

        String actualAddToCart = addToCartResponse.readEntity(String.class);
        String expectedAddToCart = ITEM + " added to your cart and costs $" + PRICE;

        JsonObject actualGetCart = getCartResponse.readEntity(JsonObject.class);
        String expectedGetCart =  ITEM + " | $" + PRICE;

        double expectedSubtotal = Double.parseDouble(PRICE);

        assertEquals(expectedAddToCart, actualAddToCart,
                     "Adding item to cart response failed");
        assertEquals(expectedGetCart, actualGetCart.getJsonArray("cart").getString(0),
                     "Cart response did not match expected string");
        assertEquals(expectedSubtotal, actualGetCart.getJsonNumber("subtotal")
                                                    .doubleValue(),
                     0.0,
                     "Cart response did not match expected subtotal");

        addToCartResponse.close();
        getCartResponse.close();
    }

    private Response getResponse(String method, String port, Cookie cookie) {
        Response result = null;
        String url = getURL(method, port);
        switch (method) {
        case POST:
            Form form = new Form().param(ITEM, PRICE);
            result = client.target(url).request().post(Entity.form(form));
            break;
        case GET:
            WebTarget target = client.target(url);
            Builder builder = target.request(MediaType.APPLICATION_JSON_TYPE);
            if (cookie == null) {
                result = builder.get();
            } else {
                result = builder.cookie(cookie).get();
            }
            break;
        default:
            break;
        }
        return result;
    }

    private String getURL(String method, String port) {
        String result = null;
        switch (method) {
        case POST:
            result = "http://localhost:" + port + "/guide-sessions/cart/" + ITEM + "&"
                            + PRICE;
            break;
        case GET:
            result = "http://localhost:" + port + "/guide-sessions/cart";
            break;
        default:
            break;
        }
        return result;
    }

    private void assertResponse(String url, Response response) {
        assertEquals(200, response.getStatus(),
                     "Incorrect response code from " + url + "\n"
                     + response.getEntity());
    }
}
