// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
 // end::copyright[]
package io.openliberty.guides.todolistSample.resources;

import java.util.Optional;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import io.openliberty.guides.todolistSample.managers.TodoManager;
import io.openliberty.guides.todolistSample.models.*;
import io.openliberty.guides.todolistSample.managers.*;

@Path("todo")
public class TodoResource {
    @Inject
    private TodoManager service;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTodos() {
        return Response.ok(service.getTodos()).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}")
    public Response getTodo(@PathParam("id") int id) {
        Optional<TodoModel> result = service.findTodo(id);
        if (!result.isPresent()) {
            return Response.status(Status.NOT_FOUND).build();
        }

        return Response.ok(result.get()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createTodo(TodoModel todo) {
        if (todo == null || todo.hasId()) {
            return Response.status(Status.BAD_REQUEST).build();
        }

        return Response.ok(service.createTodo(todo)).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}")
    public Response updateTodo(@PathParam("id") int id, TodoModel updated) {
        if (updated == null || updated.hasId()) {
            return Response.status(Status.BAD_REQUEST).build();
        }

        Optional<TodoModel> result = service.updateTodo(id, updated);
        if (!result.isPresent()) {
            return Response.status(Status.NOT_FOUND).build();
        }

        return Response.ok(result.get()).build();
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}")
    public Response deleteTodo(@PathParam("id") int id) {
        Optional<TodoModel> result = service.deleteTodo(id);
        if (!result.isPresent()) {
            return Response.status(Status.NOT_FOUND).build();
        }

        return Response.ok(result.get()).build();
    }
}
