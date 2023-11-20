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
import jakarta.json.bind.annotation.JsonbTransient;

// tag::Artist[]
public class Artist {
    // tag::name[]
    public String name;
    // end::name[]
    // tag::Albums[]
    public Album[] albums;
    // end::Albums[]
    // Object property that does not map to a JSON
    // tag::JsonbTransient[]
    @JsonbTransient
    // end::JsonbTransient[]
    public boolean legendary = true;

    public Artist() {

    }

    // tag::JsonbCreator[]
    @JsonbCreator
    // end::JsonbCreator[]
    public Artist(
      // tag::JsonbProperty[]
      @JsonbProperty("name") String name,
      @JsonbProperty("albums") Album[] albums) {
      // end::JsonbProperty[]

      this.name = name;
      this.albums = albums;
    }

    @Override
    public String toString() {
      return name + " wrote " + albums.length + " albums";
    }
}
// end::Artist[]
