/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.beans;

import java.util.concurrent.ScheduledExecutorService;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

@ApplicationScoped
public class ExecutorServiceProducer {
    @Produces
    private ScheduledExecutorService getScheduledExecutorService() {
        try {
            Context ctx = new InitialContext();
            return (ScheduledExecutorService) ctx.lookup("java:comp/DefaultManagedScheduledExecutorService");
        } catch (NamingException ne) {
            return null;
        }
    }
}
