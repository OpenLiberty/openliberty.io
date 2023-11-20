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

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.eclipse.microprofile.config.Config;
import org.eclipse.microprofile.config.ConfigValue;
// tag::importConfigProperties[]
import org.eclipse.microprofile.config.inject.ConfigProperties;
// end::importConfigProperties[]
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.config.spi.ConfigSource;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@ApplicationScoped
@Path("/config")
public class ConfigResource {

    // tag::config[]
    @Inject
    private Config config;
    // end::config[]

    // tag::contactEmail[]
    @Inject
    // tag::queryContactEmail[]
    @ConfigProperty(name = "query.contactEmail")
    // end::queryContactEmail[]
    // tag::configValue[]
    private ConfigValue contactConfigValue;
    // end::configValue[]
    // end::contactEmail[]

    // tag::configSystemBean[]
    // tag::inject[]
    @Inject
    // end::inject[]
    // tag::ConfigProperties[]
    @ConfigProperties
    // end::ConfigProperties[]
    // tag::systemConfig[]
    private ConfigSystemBean systemConfig;
    // end::systemConfig[]
    // end::configSystemBean[]

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, Properties> getAllConfig() {
        Map<String, Properties> configMap = new HashMap<String, Properties>();
        configMap.put("ConfigSources", getConfigSources());
        configMap.put("ConfigProperties", getConfigProperties());
        return configMap;
    }

    @GET
    @Path("/contact")
    @Produces(MediaType.APPLICATION_JSON)
    // tag::getContactConfig[]
    public Properties getContactConfig() {
        Properties configProps = new Properties();
        // tag::getSourceName[]
        String sourceName = contactConfigValue.getSourceName();
        // end::getSourceName[]
        // tag::getSourceOrdinal[]
        int sourceOrdinal = contactConfigValue.getSourceOrdinal();
        // end::getSourceOrdinal[]
        // tag::getValue[]
        String value = contactConfigValue.getValue();
        // end::getValue[]
        configProps.put("SourceName", sourceName);
        configProps.put("SourceOrdinal", sourceOrdinal);
        configProps.put("Value", value);
        return configProps;
    }
    // end::getContactConfig[]

    // tag::getSystemConfig[]
    @GET
    @Path("/system")
    @Produces(MediaType.APPLICATION_JSON)
    public Properties getSystemConfig() {
        Properties configProps = new Properties();
        // tag::systemProperties[]
        configProps.put("system.httpPort", systemConfig.httpPort);
        configProps.put("system.user", systemConfig.user);
        configProps.put("system.password", systemConfig.password);
        configProps.put("system.userPassword", systemConfig.userPassword);
        configProps.put("system.contextRoot", systemConfig.contextRoot);
        configProps.put("system.properties", systemConfig.properties);
        // end::systemProperties[]
        return configProps;
    }
    // end::getSystemConfig[]

    //tag::getConfigSourcesClassMethod[]
    public Properties getConfigSources() {
        Properties configSource = new Properties();
        // tag::getConfigSources[]
        for (ConfigSource source : config.getConfigSources()) {
        // end::getConfigSources[]
            configSource.put(source.getName(), source.getOrdinal());
        }
        return configSource;
    }
    //end::getConfigSourcesClassMethod[]

    //tag::getConfigProperties[]
    public Properties getConfigProperties() {
        Properties configProperties = new Properties();
        // tag::getPropertyNames[]
        for (String name : config.getPropertyNames()) {
        // end::getPropertyNames[]
            if (name.startsWith("system.")
                || name.startsWith("query.")
                || name.equals("role")) {
                configProperties.put(name, config.getValue(name, String.class));
            }
        }
        return configProperties;
    }
    //end::getConfigProperties[]
}
