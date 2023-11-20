// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.system;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Consumer;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactBroker;
import au.com.dius.pact.provider.junitsupport.loader.VersionSelector;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;

@Provider("System")
@Consumer("Inventory")
// tag::connectionInfo[]
@PactBroker(
  host = "localhost",
  port = "9292",
  consumerVersionSelectors = {
    @VersionSelector(tag = "open-liberty-pact")
  })
// end::connectionInfo[]
public class SystemBrokerIT {
  // tag::invocation[]
  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider.class)
  // tag::context[]
  void pactVerificationTestTemplate(PactVerificationContext context) {
    context.verifyInteraction();
  }
  // end::context[]
  // end::invocation[]

  @BeforeAll
  // tag::publish[]
  static void enablePublishingPact() {
    System.setProperty("pact.verifier.publishResults", "true");
  }
  // end::publish[]

  @BeforeEach
  void before(PactVerificationContext context) {
    int port = Integer.parseInt(System.getProperty("http.port"));
    context.setTarget(new HttpTestTarget("localhost", port));
  }

  // tag::state[]
  @State("wlp.server.name is defaultServer")
  // end::state[]
  public void validServerName() {
  }

  @State("Default directory is true")
  public void validEdition() {
  }

  @State("version is 1.1")
  public void validVersion() {
  }

  @State("invalid property")
  public void invalidProperty() {
  }
}
