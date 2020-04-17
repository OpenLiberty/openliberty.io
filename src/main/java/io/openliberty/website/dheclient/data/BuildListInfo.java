/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.dheclient.data;

import java.util.ArrayList;
import java.util.List;

import javax.json.bind.annotation.JsonbProperty;

public class BuildListInfo {
    @JsonbProperty("versions")
    public List<String> versions = new ArrayList<>();

    public String toString() {
        return versions.toString();
    }
}