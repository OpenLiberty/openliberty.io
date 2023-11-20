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
package io.openliberty.guides.consumingrest.service;

import jakarta.json.JsonArray;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;

import io.openliberty.guides.consumingrest.model.Artist;
import io.openliberty.guides.consumingrest.Consumer;

@Path("artists")
// tag::ArtistResource[]
public class ArtistResource {

    @Context
    UriInfo uriInfo;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    // tag::getArtists[]
    public JsonArray getArtists() {
      return Reader.getArtists();
    }
    // end::getArtists[]

    @GET
    @Path("jsonString")
    @Produces(MediaType.TEXT_PLAIN)
    // tag::getJsonString[]
    public String getJsonString() {
      Jsonb jsonb = JsonbBuilder.create();

      Artist[] artists = Consumer.consumeWithJsonb(uriInfo.getBaseUri().toString()
                                                   + "artists");
      String result = jsonb.toJson(artists);

      return result;
    }
    // end::getJsonString[]

    @GET
    @Path("total/{artist}")
    @Produces(MediaType.TEXT_PLAIN)
    // tag::getTotalAlbums[]
    public int getTotalAlbums(@PathParam("artist") String artist) {
      Artist[] artists = Consumer.consumeWithJsonb(uriInfo.getBaseUri().toString()
        + "artists");

      for (int i = 0; i < artists.length; i++) {
        if (artists[i].name.equals(artist)) {
          return artists[i].albums.length;
        }
      }
      return -1;
    }
    // end::getTotalAlbums[]

    @GET
    @Path("total")
    @Produces(MediaType.TEXT_PLAIN)
    // tag::getTotalArtists[]
    public int getTotalArtists() {
      return Consumer.consumeWithJsonp(uriInfo.getBaseUri().toString()
                                       + "artists").length;
    }
    // end::getTotalArtists[]
}
// end::ArtistResource[]
