// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.query;

import java.util.List;

import org.eclipse.microprofile.config.inject.ConfigProperties;

import jakarta.enterprise.context.Dependent;

// tag::prefix[]
@ConfigProperties(prefix = "system")
// end::prefix[]
@Dependent
// tag::ConfigSystemBean[]
public class ConfigSystemBean {

    public int httpPort;
    public String user;
    public String password;
    public String userPassword;
    public String contextRoot;
    public List<String> properties;

}
// end::ConfigSystemBean[]
