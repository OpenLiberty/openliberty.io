// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2017, 2023 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.config;

import org.eclipse.microprofile.config.spi.Converter;

// tag::customConfig[]
public class CustomEmailConverter implements Converter<Email> {

  @Override
  public Email convert(String value) {
    return new Email(value);
  }

}
// end::customConfig[]
