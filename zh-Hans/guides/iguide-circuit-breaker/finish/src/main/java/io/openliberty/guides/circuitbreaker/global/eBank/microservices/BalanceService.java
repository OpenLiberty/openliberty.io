/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.guides.circuitbreaker.global.eBank.microservices;

import java.lang.StringBuilder;
import java.io.IOException;

import java.net.MalformedURLException;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class BalanceService extends Service {

    private String successHTMLFile = "check-balance-success.html";

    public static String getHTMLContent(String HTMLFile) throws MalformedURLException, IOException {
        URL url = new URL("http://localhost:9080/circuitBreakerSample/" + HTMLFile);
        BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()));

        String inputLine;
        StringBuilder response = new StringBuilder();
        String newLine = System.getProperty("line.separator");

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine + newLine);
        }
        in.close();
        return response.toString();
    }

    public BalanceService() throws MalformedURLException, IOException {   
        this.service = getHTMLContent(successHTMLFile);
    }
}