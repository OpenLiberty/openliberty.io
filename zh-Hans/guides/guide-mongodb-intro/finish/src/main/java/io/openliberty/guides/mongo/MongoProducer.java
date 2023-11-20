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
package io.openliberty.guides.mongo;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Disposes;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import javax.net.ssl.SSLContext;

import com.ibm.websphere.ssl.JSSEHelper;
import com.ibm.websphere.ssl.SSLException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.ibm.websphere.crypto.PasswordUtil;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoDatabase;

import java.util.Collections;

@ApplicationScoped
public class MongoProducer {

    // tag::mongoProducerInjections[]
    @Inject
    @ConfigProperty(name = "mongo.hostname", defaultValue = "localhost")
    String hostname;

    @Inject
    @ConfigProperty(name = "mongo.port", defaultValue = "27017")
    int port;

    @Inject
    @ConfigProperty(name = "mongo.dbname", defaultValue = "testdb")
    String dbName;

    @Inject
    @ConfigProperty(name = "mongo.user")
    String user;

    @Inject
    @ConfigProperty(name = "mongo.pass.encoded")
    String encodedPass;
    // end::mongoProducerInjections[]

    // tag::produces1[]
    @Produces
    // end::produces1[]
    // tag::createMongo[]
    public MongoClient createMongo() throws SSLException {
        // tag::decode[]
        String password = PasswordUtil.passwordDecode(encodedPass);
        // end::decode[]
        // tag::createCredential[]
        MongoCredential creds = MongoCredential.createCredential(
                user,
                dbName,
                password.toCharArray()
        );
        // end::createCredential[]

        // tag::sslContext[]
        SSLContext sslContext = JSSEHelper.getInstance().getSSLContext(
                // tag::outboundSSLContext[]
                "outboundSSLContext",
                // end::outboundSSLContext[]
                Collections.emptyMap(),
                null
        );
        // end::sslContext[]

        // tag::mongoClient[]
        return new MongoClient(
                // tag::serverAddress[]
                new ServerAddress(hostname, port),
                // end::serverAddress[]
                // tag::creds[]
                creds,
                // end::creds[]
                // tag::optionsBuilder[]
                new MongoClientOptions.Builder()
                        .sslEnabled(true)
                        .sslContext(sslContext)
                        .build()
                // end::optionsBuilder[]
        );
        // end::mongoClient[]
    }
    // end::createMongo[]

    // tag::produces2[]
    @Produces
    // end::produces2[]
    // tag::createDB[]
    public MongoDatabase createDB(
            // tag::injectMongoClient[]
            MongoClient client) {
            // end::injectMongoClient[]
        // tag::getDatabase[]
        return client.getDatabase(dbName);
        // end::getDatabase[]
    }
    // end::createDB[]

    // tag::close[]
    public void close(
            // tag::disposes[]
            @Disposes MongoClient toClose) {
            // end::disposes[]
        // tag::toClose[]
        toClose.close();
        // end::toClose[]
    }
    // end::close[]
}
