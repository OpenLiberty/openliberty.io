// tag::comment[]
/*******************************************************************************
 * Copyright (c) 2017, 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
// end::comment[]
package io.openliberty.guides.rest;

import javax.ws.rs.core.Application;
import javax.ws.rs.ApplicationPath;

// tag::applicationPath[]
@ApplicationPath("System")
// end::applicationPath[]
// tag::systemApplication[]
public class SystemApplication extends Application {

}
// end::systemApplication[]