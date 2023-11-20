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
package it.io.openliberty.guides.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.core.Response;

public class TestUtils {

    private static String port = System.getProperty("http.port");

    public static String baseUrl = "http://localhost:" + port + "/";
    public static final String INVENTORY_LOCALHOST_URL =
    baseUrl + "inventory/systems/localhost/";
    public static final String INVENTORY_UNKNOWN_HOST_URL =
    baseUrl + "inventory/systems/unknown";
    public static final String SYSTEM_MAINTENANCE_FALSE =
    "io_openliberty_guides_system_inMaintenance\":false";
    public static final String SYSTEM_MAINTENANCE_TRUE =
    "io_openliberty_guides_system_inMaintenance\":true";

    /**
     * Returns response information from the specified URL.
     */
    public static Response getResponse(Client client, String url) {
        return client.target(url).request().get();
    }

    /**
     * Changes the system property from old value to new value.
     */
    public static void changeSystemProperty(String oldValue, String newValue) {
        try {
            String fileName = System.getProperty("user.dir").split("target")[0]
                    + "/resources/CustomConfigSource.json";
            BufferedReader reader =
            new BufferedReader(new FileReader(new File(fileName)));
            String line = "";
            String oldContent = "";
            String newContent = "";
            while ((line = reader.readLine()) != null) {
                oldContent += line + "\r\n";
            }
            reader.close();
            newContent = oldContent.replaceAll(oldValue, newValue);
            FileWriter writer = new FileWriter(fileName);
            writer.write(newContent);
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
