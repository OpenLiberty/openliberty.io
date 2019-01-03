package io.openliberty.website;

import java.io.IOException;
import java.util.Set;

import javax.servlet.ServletContext;
import javax.servlet.ServletContainerInitializer;

public class ContainerInit implements ServletContainerInitializer {
  public void onStartup(Set<Class<?>> classes, ServletContext ctx) {
    try {
      RedirectFilter.init(ctx);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
