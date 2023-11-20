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

import io.openliberty.guides.bulkhead.global.eBank.rest.Producer;

public class ChatSession extends Service {

    public ChatSession(int counterForVFA) {
        int localCounter = Utils.calculateAdvisorNum(counterForVFA);
        try {
            this.service = Utils.getHTMLForChatWithVFA(localCounter);
            Thread.sleep(BankService.TIMEOUT);
            Producer.adjustRequestCount(false);
        } catch (InterruptedException ie) {
            this.service = "<div>" + ie.getMessage() + "</div>";
        }
    }

}
