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

/**
 * A JSON-B class that can be used to process the info.json file describing
 * the available builds in the build repository. This object only has a single
 * list of "versions". The versions are publication dates so cannot
 * be confused with things like the Liberty version of 20.0.0.3.
 * 
 * <p>An example of this file can be found <a href="https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/info.json">here</a>
 * it has the following structure:
 * <pre>
 * {
 *   "versions": ["2017-09-27_1951", "2017-12-06_1606"]
 * }
 * </pre></p>
 */
public class BuildListInfo {
    @JsonbProperty("versions")
    public List<String> versions = new ArrayList<>();

    public String toString() {
        return versions.toString();
    }
}