package io.openliberty.website;

import java.io.IOException;
import java.util.Set;

import javax.enterprise.inject.spi.CDI;
import javax.servlet.ServletContext;

import io.openliberty.website.dheclient.DHEBuildParser;

import javax.servlet.ServletContainerInitializer;

public class ContainerInit implements ServletContainerInitializer {
  public void onStartup(Set<Class<?>> classes, ServletContext ctx) {
    try {
      RedirectFilter.init(ctx);
    } catch (IOException e) {
      e.printStackTrace();
    }

    // By initializing the DHE Build Parser and calling scheduleAsyncUpdate
    // we start building the build list from external data sources at startup
    // rather than on first request.
    CDI.current().select(DHEBuildParser.class).get().scheduleAsyncUpdate();
  }
}
