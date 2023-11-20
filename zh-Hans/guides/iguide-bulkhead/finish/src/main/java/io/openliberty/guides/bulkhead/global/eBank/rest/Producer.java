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
package io.openliberty.guides.bulkhead.global.eBank.rest;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import java.util.concurrent.Future;

import io.openliberty.guides.bulkhead.global.eBank.microservices.Service;
import io.openliberty.guides.bulkhead.global.eBank.microservices.Utils;
import io.openliberty.guides.bulkhead.global.eBank.microservices.BankService;

@Path("virtualFinancialAdvisor")
public class Producer {

    private static int value = BankService.bulkheadValue;
    private static int waitingTaskQueue = BankService.bulkheadWaitingQueue;
    private static int requests = 0;
    private static Future[] waitingInQueueFuture = new Future[waitingTaskQueue];

    @Inject
    BankService bankService;

    @GET
    @Path("/vfa")
    @Produces(MediaType.TEXT_HTML)
    public String getVFA() {
        String returnMsg = "";

        try {
            int localRequestNum = adjustRequestCount(true);
            Future<Service> future = bankService.requestForVFA();

            if (localRequestNum > value && localRequestNum <= value + waitingTaskQueue) {
                int futureNumber = localRequestNum - value - 1;
                waitingInQueueFuture[futureNumber] = future;
                returnMsg = Utils.getHTMLForWaitingQueue(localRequestNum - value);
                return returnMsg;
            }

            // You are talking to advisor #
            Service service = future.get();
            returnMsg = service.toString();
        } catch (Exception e) {
            returnMsg = e.getMessage();
        }
        return returnMsg;
    }

    @GET
    @Path("/getResultInQueue/{numInQueue}")
    @Produces(MediaType.TEXT_HTML)
    public String getResutInQueue(@PathParam("numInQueue") int numInQueue) {
        if (numInQueue - 1 >= waitingTaskQueue) {
            return "<h3>Unexpected error</h3>";
        }
        Future<Service> future = waitingInQueueFuture[numInQueue - 1];
        String returnString = "";
        waitingInQueueFuture[numInQueue - 1] = null;
        try {
            if (future != null) {
                Service service = future.get();
                returnString = service.toString();
            }
        } catch (Exception ex) {
            returnString = "<div>Chat has canceled</div>";
        }
        return returnString;
    }

    public static synchronized int adjustRequestCount(boolean add) {
        if (add) {
            requests++;
        } else {
            requests--;
        }
        return requests;
    }
}
