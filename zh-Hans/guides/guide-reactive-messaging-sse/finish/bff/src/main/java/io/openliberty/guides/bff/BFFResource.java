// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.bff;

import io.openliberty.guides.models.SystemLoad;

import org.eclipse.microprofile.reactive.messaging.Incoming;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.sse.OutboundSseEvent;
import javax.ws.rs.sse.Sse;
import javax.ws.rs.sse.SseBroadcaster;
import javax.ws.rs.sse.SseEventSink;
import java.util.logging.Logger;

@ApplicationScoped
@Path("/sse")
// tag::frontendResource[]
public class BFFResource {

    private Logger logger = Logger.getLogger(BFFResource.class.getName());

    // tag::sse[]
    private Sse sse;
    // end::sse[]
    // tag::broadcaster[]
    private SseBroadcaster broadcaster;
    // end::broadcaster[]

    // tag::subscribeToSystems[]
    @GET
    @Path("/")
    // tag::sseMimeType[]
    @Produces(MediaType.SERVER_SENT_EVENTS)
    // end::sseMimeType[]
    public void subscribeToSystem(
        // tag::sseEventSinkParam[]
        @Context SseEventSink sink,
        // end::sseEventSinkParam[]
        // tag::sseParam[]
        @Context Sse sse
        // end::sseParam[]
        ) {

        if (this.sse == null || this.broadcaster == null) { 
            this.sse = sse;
            // tag::newBroadcaster[]
            this.broadcaster = sse.newBroadcaster();
            // end::newBroadcaster[]
        }
        
        // tag::registerSink[]
        this.broadcaster.register(sink);
        // end::registerSink[]     
        logger.info("New sink registered to broadcaster.");
    }
    // end::subscribeToSystems

    // tag::broadcastData[]
    private void broadcastData(String name, Object data) {
        // tag::notNull[]
        if (broadcaster != null) {
        // end::notNull[]
            // tag::createEvent[]
            // tag::newEventBuilder[]
            OutboundSseEvent event = sse.newEventBuilder()
            // end::newEventBuilder[]
                                        // tag::name[]
                                        .name(name)
                                        // end::name[]
                                        // tag::data[]
                                        .data(data.getClass(), data)
                                        // end::data[]
                                        // tag::mediaType[]
                                        .mediaType(MediaType.APPLICATION_JSON_TYPE)
                                        // end::mediaType[]
                                        // tag::build[]
                                        .build();
                                        // end::build[]
            // end::createEvent[]
            // tag::broadcastEvent[]        
            broadcaster.broadcast(event);
            // end::broadcastEvent[]
        } else {
            logger.info("Unable to send SSE. Broadcaster context is not set up.");
        }
    }
    // end::broadcastData[]

    // tag::systemLoad[]
    @Incoming("systemLoad")
    // end::systemLoad[]
    // tag::getSystemLoadMessage[]
    public void getSystemLoadMessage(SystemLoad sl)  {
        logger.info("Message received from system.load topic. " + sl.toString());
        // tag::broadcastCall[]
        broadcastData("systemLoad", sl);
        // end::broadcastCall[]
    }
    // end::getSystemLoadMessage[]
}
// end::frontendResource[]