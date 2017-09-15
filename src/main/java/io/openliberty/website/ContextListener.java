/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website;

import javax.enterprise.inject.Instance;
import javax.enterprise.inject.spi.CDI;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class ContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        Instance<BuildsManager> mgr = CDI.current().select(BuildsManager.class);
        if (!mgr.isUnsatisfied()) {
            mgr.get().updateBuilds();
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
    }

}
