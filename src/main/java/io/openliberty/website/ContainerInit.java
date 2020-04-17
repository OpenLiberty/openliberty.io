package io.openliberty.website;

import java.io.IOException;
import java.util.Set;

import javax.enterprise.inject.Instance;
import javax.enterprise.inject.spi.CDI;
import javax.servlet.ServletContext;

import javax.servlet.ServletContainerInitializer;

public class ContainerInit implements ServletContainerInitializer {
  public void onStartup(Set<Class<?>> classes, ServletContext ctx) {
    try {
      RedirectFilter.init(ctx);
    } catch (IOException e) {
      e.printStackTrace();
    }

    // By initializing the BuildManager and calling getStatus
    // we start building the build list from external data sources at startup
    // rather than on first request.
    Instance<BuildsManager> mgr = CDI.current().select(BuildsManager.class);
    if (!mgr.isUnsatisfied()) {
        System.out.println("About to get hold of instance");
        mgr.get().getStatus(); // do this just to initialize
    }
  }
}
