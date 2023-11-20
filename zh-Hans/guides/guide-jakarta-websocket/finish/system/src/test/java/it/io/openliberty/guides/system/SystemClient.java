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
package it.io.openliberty.guides.system;

import java.net.URI;

import io.openliberty.guides.system.SystemLoadDecoder;
import jakarta.json.JsonObject;
import jakarta.websocket.ClientEndpoint;
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.WebSocketContainer;

@ClientEndpoint()
public class SystemClient {

    private Session session;

    public SystemClient(URI endpoint) {
        try {
            WebSocketContainer container = ContainerProvider.getWebSocketContainer();
            container.connectToServer(this, endpoint);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
    }

    // tag::onMessage[]
    @OnMessage
    public void onMessage(String message, Session userSession) throws Exception {
        SystemLoadDecoder decoder = new SystemLoadDecoder();
        JsonObject systemLoad = decoder.decode(message);
        SystemServiceIT.verify(systemLoad);
    }
    // end::onMessage[]

    public void sendMessage(String message) {
        session.getAsyncRemote().sendText(message);
    }

    public void close() throws Exception {
        session.close();
    }

}
