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
package io.openliberty.guides.retrytimeout.global.eBank.microservices;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

public class Utils {

    public static String getHTMLForTransactions() {
        String contents = new String();
        try {
            contents = getHTMLContent("transaction-history.html");
        } catch (Exception e){
        }
        return contents;
    }

    public static String getHTMLForTimeoutException() {
        String contents = new String();
        try {
            contents = getHTMLContent("transaction-history-timeout-error.html");
        } catch (Exception e){
        }
        return contents;
    }

    public static String getHTMLForException() {
        String contents = new String();
        try {
            contents = getHTMLContent("transaction-history-error.html");
        } catch (Exception e){
        }
        return contents;
    }
    
    public static String getHTMLContent(String HTMLFile) throws MalformedURLException, IOException {
        URL url = new URL("http://localhost:9080/retryTimeoutSample/html/" + HTMLFile);
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
}