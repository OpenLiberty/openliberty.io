// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020, 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.inventory;

import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Message;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.reactivestreams.Publisher;

import io.openliberty.guides.models.PropertyMessage;
import io.openliberty.guides.models.SystemLoad;
import io.reactivex.rxjava3.core.BackpressureStrategy;
import io.reactivex.rxjava3.core.Flowable;
import io.reactivex.rxjava3.core.FlowableEmitter;


@ApplicationScoped
@Path("/inventory")
public class InventoryResource {

    private static Logger logger = Logger.getLogger(InventoryResource.class.getName());
    // tag::propertyNameEmitter[]
    private FlowableEmitter<Message<String>> propertyNameEmitter;
    // end::propertyNameEmitter[]

    @Inject
    private InventoryManager manager;

    @GET
    @Path("/systems")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSystems() {
        List<Properties> systems = manager.getSystems()
                .values()
                .stream()
                .collect(Collectors.toList());
        return Response
                .status(Response.Status.OK)
                .entity(systems)
                .build();
            }

    @GET
    @Path("/systems/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSystem(@PathParam("hostname") String hostname) {
        Optional<Properties> system = manager.getSystem(hostname);
        if (system.isPresent()) {
            return Response
                    .status(Response.Status.OK)
                    .entity(system)
                    .build();
        }
        return Response
                .status(Response.Status.NOT_FOUND)
                .entity("hostname does not exist.")
                .build();
    }

    // tag::updateSystemProperty[]
    @PUT
    @Path("/data")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.TEXT_PLAIN)
    /* This method sends a message and returns a CompletionStage that doesn't
        complete until the message is acknowledged. */
    // tag::USPHeader[]
    public CompletionStage<Response> updateSystemProperty(String propertyName) {
    // end::USPHeader[]
        logger.info("updateSystemProperty: " + propertyName);
        // First, create an incomplete CompletableFuture named "result".
        // tag::CompletableFuture[]
        CompletableFuture<Void> result = new CompletableFuture<>();
        // end::CompletableFuture[]

        // Create a message that holds the payload.
        // tag::message[]
        Message<String> message = Message.of(
                // tag::payload[]
                propertyName,
                // end::payload[]
                // tag::acknowledgeAction[]
                () -> {
                    /* This is the ack callback, which runs when the outgoing
                        message is acknowledged. After the outgoing message is
                        acknowledged, complete the "result" CompletableFuture. */
                    result.complete(null);
                    /* An ack callback must return a CompletionStage that says
                        when it's complete. Asynchronous processing isn't necessary
                        so a completed CompletionStage is returned to indicate that
                        the work here is done. */
                    return CompletableFuture.completedFuture(null);
                }
                // end::acknowledgeAction[]
        );
        // end::message[]

        // Send the message
        propertyNameEmitter.onNext(message);
        /* Set up what happens when the message is acknowledged and the "result"
            CompletableFuture is completed. When "result" completes, the Response
            object is created with the status code and message. */
        // tag::returnResult[]
        return result.thenApply(a -> Response
                .status(Response.Status.OK)
                .entity("Request successful for the " + propertyName + " property\n")
                .build());
        // end::returnResult[]
    }
    // end::updateSystemProperty[]

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response resetSystems() {
        manager.resetSystems();
        return Response
                .status(Response.Status.OK)
                .build();
    }

    @Incoming("systemLoad")
    public void updateStatus(SystemLoad sl)  {
        String hostname = sl.hostname;
        if (manager.getSystem(hostname).isPresent()) {
            manager.updateCpuStatus(hostname, sl.loadAverage);
            logger.info("Host " + hostname + " was updated: " + sl);
        } else {
            manager.addSystem(hostname, sl.loadAverage);
            logger.info("Host " + hostname + " was added: " + sl);
        }
    }

    @Incoming("addSystemProperty")
    public void getPropertyMessage(PropertyMessage pm)  {
        logger.info("getPropertyMessage: " + pm);
        String hostId = pm.hostname;
        if (manager.getSystem(hostId).isPresent()) {
            manager.updatePropertyMessage(hostId, pm.key, pm.value);
            logger.info("Host " + hostId + " was updated: " + pm);
        } else {
            manager.addSystem(hostId, pm.key, pm.value);
            logger.info("Host " + hostId + " was added: " + pm);
        }
    }

    // tag::sendPropertyName[]
    @Outgoing("requestSystemProperty")
    // tag::SPMHeader[]
    public Publisher<Message<String>> sendPropertyName() {
    // end::SPMHeader[]
        Flowable<Message<String>> flowable = Flowable.create(emitter ->
                this.propertyNameEmitter = emitter, BackpressureStrategy.BUFFER);
        return flowable;
    }
    // end::sendPropertyName[]
}
