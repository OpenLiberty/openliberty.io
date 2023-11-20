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
package io.openliberty.guides.jsfcontainer;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CDIBean {

    public String greet() {
        return "A CDI bean has been injected";
    }

}
