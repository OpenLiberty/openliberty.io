// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.system.util;

import java.io.FileInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyStore;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.PubSecKeyOptions;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTAuthOptions;
import io.vertx.core.json.JsonArray;

public class JwtBuilder {

    private final String keystorePath = System.getProperty("user.dir")
                                        + "/target/liberty/wlp/usr/servers/"
                                        + "defaultServer/resources/security/key.p12";

    private Vertx vertx = Vertx.vertx();

    public String createUserJwt(String username)
    throws GeneralSecurityException, IOException {
        Set<String> groups = new HashSet<String>();
        groups.add("user");
        return createJwt(username, groups);
    }

    public String createAdminJwt(String username)
    throws GeneralSecurityException, IOException {
        Set<String> groups = new HashSet<String>();
        groups.add("admin");
        groups.add("user");
        return createJwt(username, groups);
    }

    private String createJwt(String username, Set<String> groups) throws IOException {
        JWTAuthOptions config = new JWTAuthOptions()
            .addPubSecKey(new PubSecKeyOptions()
            .setAlgorithm("RS256")
            .setBuffer(getPrivateKey()));

        JWTAuth provider = JWTAuth.create(vertx, config);

        io.vertx.core.json.JsonObject claimsObj = new JsonObject()
            .put("exp", (System.currentTimeMillis() / 1000) + 300)  // Expire time
            .put("iat", (System.currentTimeMillis() / 1000))        // Issued time
            .put("jti", Long.toHexString(System.nanoTime()))        // Unique value
            .put("sub", username)                                   // Subject
            .put("upn", username)                                   // Subject again
            .put("iss", "http://openliberty.io")
            .put("aud", "systemService")
            .put("groups", getGroupArray(groups));

        String token = provider.generateToken(claimsObj,
                                              new JWTOptions().setAlgorithm("RS256"));

        return token;
    }

    private String getPrivateKey() throws IOException {
        try {
            KeyStore keystore = KeyStore.getInstance("PKCS12");
            char[] password = new String("secret").toCharArray();
            keystore.load(new FileInputStream(keystorePath), password);
            Key key = keystore.getKey("default", password);
            String output = "-----BEGIN PRIVATE KEY-----\n"
                          + Base64.getEncoder().encodeToString(key.getEncoded()) + "\n"
                          + "-----END PRIVATE KEY-----";
            return output;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private JsonArray getGroupArray(Set<String> groups) {
        JsonArray arr = new JsonArray();
        if (groups != null) {
            for (String group : groups) {
                arr.add(group);
            }
        }
        return arr;
    }

}
