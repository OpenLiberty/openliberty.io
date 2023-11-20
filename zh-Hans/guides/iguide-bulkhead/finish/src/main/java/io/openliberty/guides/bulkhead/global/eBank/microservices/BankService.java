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
package io.openliberty.guides.bulkhead.global.eBank.microservices;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.inject.Inject;

import org.eclipse.microprofile.faulttolerance.Asynchronous;
import org.eclipse.microprofile.faulttolerance.Bulkhead;
import org.eclipse.microprofile.faulttolerance.Fallback;
import org.eclipse.microprofile.context.ManagedExecutor;
import org.eclipse.microprofile.context.ThreadContext;

import java.util.concurrent.Future;

@ApplicationScoped
public class BankService {

    // For demo purpose only
    // The length of time (in milliseconds) to pause the currently executing thread
    // so as to simulate concurrency
    public static final int TIMEOUT = 30000;

    public final static int bulkheadValue = 2;
    public final static int bulkheadWaitingQueue = 2;

    @Inject
    private BankService bankService;
    private int counterForVFA = 0;

    @Produces
    @ApplicationScoped
    ManagedExecutor executor = ManagedExecutor.builder().propagated(ThreadContext.APPLICATION).build();

    public Future<Service> requestForVFA() throws Exception {
        int counter = ++counterForVFA;
        return bankService.serviceForVFA(counter);
    }

    @Fallback(ServiceFallbackHandler.class)
    @Asynchronous
    @Bulkhead(value = bulkheadValue, waitingTaskQueue = bulkheadWaitingQueue)
    public Future<Service> serviceForVFA(int counterForVFA) throws Exception {
        Service chatService = new ChatSession(counterForVFA);
        return executor.completedFuture(chatService);
    }
}
