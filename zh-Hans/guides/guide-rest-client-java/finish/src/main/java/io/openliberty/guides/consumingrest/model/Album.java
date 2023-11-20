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
package io.openliberty.guides.consumingrest.model;

import jakarta.json.bind.annotation.JsonbCreator;
import jakarta.json.bind.annotation.JsonbProperty;

// tag::Album[]
public class Album {
    // tag::title[]
    public String title;
    // end::title[]

    @JsonbProperty("artist")
    // tag::artistName[]
    public String artistName;
    // end::artistName[]

    @JsonbProperty("ntracks")
    // tag::totalTracks[]
    public int totalTracks;
    // end::totalTracks[]

    public Album() {
    }

    @JsonbCreator
    public Album(
      @JsonbProperty("title") String title,
      @JsonbProperty("artist") String artistName,
      @JsonbProperty("ntracks") int totalTracks) {

      this.title = title;
      this.artistName = artistName;
      this.totalTracks = totalTracks;
    }

    @Override
    public String toString() {
      return "Album titled " + title + " by " + artistName
                             + " contains " + totalTracks + " tracks";
    }
}
// end::Album[]
