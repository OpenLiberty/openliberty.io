package io.openliberty.guides.inventory.model;

import java.util.Properties;

public class SystemData {

    private final String hostname;
    private final Properties properties;

    public SystemData(String hostname, Properties properties) {
      this.hostname = hostname;
      this.properties = properties;
    }

    public String getHostname() {
      return hostname;
    }

    public Properties getProperties() {
      return properties;
    }

    @Override
    public boolean equals(Object host) {
      if (host instanceof SystemData) {
        return hostname.equals(((SystemData) host).getHostname());
      }
      return false;
    }
}
