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
package io.openliberty.guides.circuitbreaker.global.eBank.microservices;

import java.io.IOException;
import java.net.MalformedURLException;


public class SnapshotBalanceService extends Service {

    private String snapshotHTMLFile = "check-balance-snapshot.html";

    public SnapshotBalanceService() throws MalformedURLException, IOException {   
        this.service = BalanceService.getHTMLContent(snapshotHTMLFile);
    }
}