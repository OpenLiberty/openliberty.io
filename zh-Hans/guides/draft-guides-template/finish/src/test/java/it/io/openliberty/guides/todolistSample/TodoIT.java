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
package it.io.openliberty.guides.todolistSample;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@TestMethodOrder(OrderAnnotation.class)
public class TodoIT {

    @Test
    @Order(1)
    public void testGetTodos() throws Exception {
        HttpClient client = HttpClients.createDefault();
        HttpGet request = new HttpGet("http://localhost:9080/todo-app/todo");
        HttpResponse response = client.execute(request);

        assertEquals(200, response.getStatusLine().getStatusCode(), "Incorrect response code from url");
    }

    @Test
    @Order(2)
    public void testGetFirstTodo() throws Exception {
        HttpClient client = HttpClients.createDefault();
        HttpGet request = new HttpGet("http://localhost:9080/todo-app/todo" + "/4");
        HttpResponse response = client.execute(request);

        assertEquals(200, response.getStatusLine().getStatusCode(), "Incorrect response code from url");
    }
}
