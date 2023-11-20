// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.inventory;

import javax.annotation.Resource;
import javax.enterprise.concurrent.ManagedExecutorService;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.context.Initialized;
import javax.enterprise.event.Observes;
import javax.inject.Inject;

import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class ConsumerStartup {

  private SystemConsumer consumer;

  @Resource
  private ManagedExecutorService executorService;

  @Inject
  private InventoryManager manager;

  @Inject
  @ConfigProperty(name = "KAFKA_SERVER")
  private String kafkaServer;

  @Inject
  @ConfigProperty(name = "GROUP_ID_PREFIX")
  private String groupIdPrefix;

  private void init(@Observes @Initialized(ApplicationScoped.class) Object x) {
    consumer = new SystemConsumer(manager, kafkaServer, groupIdPrefix);
    executorService.execute(consumer);
  }
}
