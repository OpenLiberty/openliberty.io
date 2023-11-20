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
package io.openliberty.guides.consumingrest.model;

import jakarta.json.bind.annotation.JsonbCreator;
import jakarta.json.bind.annotation.JsonbProperty;
import jakarta.json.bind.annotation.JsonbTransient;

public class Artist {
    public String name;
    public Album[] albums;

    //does not map to anything
    @JsonbTransient
    public boolean legendary = true;

    //default constructor can be defined
    public Artist() {

    }

    @JsonbCreator
    //or custom constructor can be used
    public Artist(
      @JsonbProperty("name") String name,
      @JsonbProperty("albums") Album[] albums) {

      this.name = name;
      this.albums = albums;
    }

    @Override
    public String toString() {
      return name + " wrote " + albums.length + " albums";
    }
}
