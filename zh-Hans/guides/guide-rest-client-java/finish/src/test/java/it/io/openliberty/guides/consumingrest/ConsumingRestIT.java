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
package it.io.openliberty.guides.consumingrest;

import static org.junit.jupiter.api.Assertions.assertEquals;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.openliberty.guides.consumingrest.model.Artist;

public class ConsumingRestIT {

    private static String port;
    private static String baseUrl;
    private static String targetUrl;

    private Client client;
    private Response response;

    // tag::BeforeAll[]
    @BeforeAll
    // end::BeforeAll[]
    public static void oneTimeSetup() {
      port = System.getProperty("http.port");
      baseUrl = "http://localhost:" + port + "/artists/";
      targetUrl = baseUrl + "total/";
    }

    // tag::BeforeEach[]
    @BeforeEach
    // end::BeforeEach[]
    public void setup() {
      client = ClientBuilder.newClient();
    }

    // tag::AfterEach[]
    @AfterEach
    // end::AfterEach[]
    public void teardown() {
      client.close();
    }

    // tag::test-1[]
    @Test
    // end::test-1[]
    // tag::testArtistDeserialization[]
    public void testArtistDeserialization() {
      response = client.target(baseUrl + "jsonString").request().get();
      this.assertResponse(baseUrl + "jsonString", response);

      Jsonb jsonb = JsonbBuilder.create();

      String expectedString = "{\"name\":\"foo\",\"albums\":"
        + "[{\"title\":\"album_one\",\"artist\":\"foo\",\"ntracks\":12}]}";
      Artist expected = jsonb.fromJson(expectedString, Artist.class);

      String actualString = response.readEntity(String.class);
      Artist[] actual = jsonb.fromJson(actualString, Artist[].class);

      assertEquals(expected.name, actual[0].name,
        "Expected names of artists does not match");

      response.close();
    }
    // end::testArtistDeserialization[]

    // tag::test-2[]
    @Test
    // end::test-2[]
    // tag::testJsonBAlbumCount[]
    public void testJsonBAlbumCount() {
      String[] artists = {"dj", "bar", "foo"};
      for (int i = 0; i < artists.length; i++) {
        response = client.target(targetUrl + artists[i]).request().get();
        this.assertResponse(targetUrl + artists[i], response);

        int expected = i;
        int actual = response.readEntity(int.class);
        assertEquals(expected, actual, "Album count for "
                      + artists[i] + " does not match");

        response.close();
      }
    }
    // end::testJsonBAlbumCount[]

    // tag::testAlbumCountForUnknownArtist[]
    // tag::test-3[]
    @Test
    // end::test-3[]
    // tag::testJsonBAlbumCountForUnknownArtist[]
    public void testJsonBAlbumCountForUnknownArtist() {
      response = client.target(targetUrl + "unknown-artist").request().get();

      int expected = -1;
      int actual = response.readEntity(int.class);
      assertEquals(expected, actual, "Unknown artist must have -1 albums");

      response.close();
    }
    // end::testJsonBAlbumCountForUnknownArtist[]

    // tag::test-4[]
    @Test
    // end::test-4[]
    // tag::testJsonPArtistCount[]
    public void testJsonPArtistCount() {
      response = client.target(targetUrl).request().get();
      this.assertResponse(targetUrl, response);

      int expected = 3;
      int actual = response.readEntity(int.class);
      assertEquals(expected, actual, "Expected number of artists does not match");

      response.close();
    }
    // end::testJsonPArtistCount[]

    /**
     * Asserts that the given URL has the correct (200) response code.
     */
    // tag::assertResponse[]
    private void assertResponse(String url, Response response) {
      assertEquals(200, response.getStatus(), "Incorrect response code from " + url);
    }
    // end::assertResponse[]
    // end::tests[]
}
