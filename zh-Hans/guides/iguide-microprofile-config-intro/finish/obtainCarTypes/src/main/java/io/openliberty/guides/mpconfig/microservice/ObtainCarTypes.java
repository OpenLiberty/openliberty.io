// tag::comment[]
/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::comment[]
package io.openliberty.guides.mpconfig.microservice;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Enumeration;
import java.util.Scanner;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("carTypes")
public class ObtainCarTypes {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getCarTypes() throws IOException {
        
        String dbFile = "CarTypes.json";
        URL file = this.getClass().getClassLoader().getResource(dbFile);
        File jsonDB = new File(file.getFile());
        String carTypes = null;

        Scanner scanner = new Scanner(jsonDB);
        try {
            carTypes = scanner.useDelimiter("\\Z").next();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            scanner.close();
        }

        return carTypes;
    }
}