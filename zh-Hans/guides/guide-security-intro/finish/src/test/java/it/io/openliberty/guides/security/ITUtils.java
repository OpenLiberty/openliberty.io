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
package it.io.openliberty.guides.security;

import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class ITUtils {

    public static void trustAll() throws Exception {
        SSLContext sslContext = SSLContext.getInstance("SSL");
        sslContext.init(
            null,
            new TrustManager[] {
                new X509TrustManager() {
                    @Override
                    public void checkClientTrusted(X509Certificate[] arg0,
                        String arg1)
                        throws CertificateException { }

                    @Override
                    public void checkServerTrusted(X509Certificate[] arg0,
                        String arg1)
                        throws CertificateException { }

                    public X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }
                }
            },
            new SecureRandom());
        SSLContext.setDefault(sslContext);
        HttpsURLConnection.setDefaultSSLSocketFactory(
            sslContext.getSocketFactory());
    }

}

