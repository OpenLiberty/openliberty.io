// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2022, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.client.scheduler;

import java.io.IOException;
import java.net.URI;
import java.util.logging.Logger;

import jakarta.websocket.ClientEndpoint;
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.WebSocketContainer;

// tag::clientEndpoint[]
@ClientEndpoint()
// end::clientEndpoint[]
public class SystemClient {

    private static Logger logger = Logger.getLogger(SystemClient.class.getName());

    private Session session;

    // tag::constructor[]
    public SystemClient(URI endpoint) {
        try {
            // tag::webSocketAPI[]
            WebSocketContainer container = ContainerProvider.getWebSocketContainer();
            container.connectToServer(this, endpoint);
            // end::webSocketAPI[]
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    // end::constructor[]

    // tag::onOpen[]
    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        logger.info("Scheduler connected to the server.");
    }
    // end::onOpen[]

    // tag::onMessage[]
    @OnMessage
    public void onMessage(String message, Session session) throws Exception {
        logger.info("Scheduler received message from the server: " + message);
    }
    // end::onMessage[]

    public void sendMessage(String message) {
        session.getAsyncRemote().sendText(message);
        logger.info("Scheduler sent message \"" + message + "\" to the server.");
    }

    public void close() {
        try {
            session.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        logger.info("Scheduler closed the session.");
    }

}
