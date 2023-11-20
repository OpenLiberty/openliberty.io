// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.query;

// JAX-RS
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

// tag::path1[]
@ApplicationPath("/")
// end::path1[]
public class QueryApplication extends Application {

}