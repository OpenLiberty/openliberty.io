/*******************************************************************************
 * Copyright (c) 2018, 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.guides.retrytimeout.global.eBank.microservices;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.Thread;

public class Transactions {
    /*
    Use these variables to control the execution of the sample app
        * abortOnCondition (boolean) -
            false will allow execution to fall through to simulate a request taking a
                long time to complete (Thread.sleep).  If it sleeps longer than the
                value specified in the @Timeout annotation in BankService.java, then a
                TimeoutException will be thrown. As long as the retryOn parameter of the
                @Retry annotation includes TimeoutException.class, the request will be
                retried as per the other parameters set on the @Retry annotation in
                BankService.java.
            true will force a FileNotFoundException to be thrown.  If the @Retry
                annotation in BankService.java includes IOException.class in the retryOn
                parameter AND abortOn includes FileNotFoundException.class, execution
                will stop with a message.  However, if abortOn does NOT include
                FileNotFoundException.class, then the retry policy will attempt to retry
                the operation per the other parameters set on the @Retry annotation in
                BankService.java since FileNotFoundException is a subclass of IOException
                which is listed in the retryOn parameter.

        * sleepTime (long) - sleep time in ms. If less than the timeout value specified
            in the @Timeout annotation in BankService.java, the request will successfully
            finish since it shows the application request finished within the allowable
            time.  Otherwise, the @Timeout annotation will cause a TimeoutException to be
            thrown.
    */
    private boolean abortOnCondition = false;
    private long sleepTime = 2100;


    public static int count = 0;
    public static long timeStart = System.currentTimeMillis();
    protected String service = "";

    public Transactions() throws Exception {

    }

    public void getTransactions() throws Exception {
        System.out.println(((count == 0) ? "Initial request" : "Retrying..." + count) + " at " + (System.currentTimeMillis() - timeStart) + "ms");
        count++;
        if (abortOnCondition) {
            throwException();
        }
        Thread.sleep(this.sleepTime);
        this.service = Utils.getHTMLForTransactions();
    }

    private void throwException() throws IOException {
        this.service = Utils.getHTMLForException();
        throw new FileNotFoundException();
    }

    public static void resetCount() {
        count = 0;
        timeStart = System.currentTimeMillis();
    }

    public String toString() {
        return this.service;
    }

}