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
package io.openliberty.guides.retrytimeout.global.eBank.rest;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.faulttolerance.exceptions.TimeoutException;

import io.openliberty.guides.retrytimeout.global.eBank.microservices.Transactions;
import io.openliberty.guides.retrytimeout.global.eBank.microservices.Utils;
import io.openliberty.guides.retrytimeout.global.eBank.microservices.BankService;

@Path("transactions")
public class Producer {
    @Inject
    BankService bankService;

    @GET
    @Produces(MediaType.TEXT_HTML)
    public String getTransactions() {
        String returnMsg = "";        
            
        try {
            Transactions.resetCount();
            Transactions trans = bankService.showTransactions();
            returnMsg = trans.toString();
        } catch (TimeoutException e) {
            returnMsg = Utils.getHTMLForTimeoutException();
        } catch (Exception e) {
            returnMsg = Utils.getHTMLForException();
        }
        return returnMsg;
    }
    
}