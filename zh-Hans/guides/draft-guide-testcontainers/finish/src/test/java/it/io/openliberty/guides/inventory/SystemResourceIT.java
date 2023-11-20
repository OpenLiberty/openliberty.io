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
package it.io.openliberty.guides.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.net.Socket;
import java.util.List;

import org.jboss.resteasy.client.jaxrs.ResteasyClient;
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.jboss.resteasy.client.jaxrs.ResteasyWebTarget;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.containers.output.Slf4jLogConsumer;
import org.testcontainers.containers.wait.strategy.Wait;

import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.UriBuilder;

@TestMethodOrder(OrderAnnotation.class)
public class SystemResourceIT {

    // tag::getLogger[]
    private static Logger logger = LoggerFactory.getLogger(SystemResourceIT.class);
    // end::getLogger[]

    private static final String DB_HOST = "postgres";
    private static final int DB_PORT = 5432;
    private static final String DB_IMAGE = "postgres-sample:latest";

    private static int httpPort = Integer.parseInt(System.getProperty("http.port"));
    private static int httpsPort = Integer.parseInt(System.getProperty("https.port"));
    private static String contextRoot = System.getProperty("context.root") + "/api";
    private static String invImage = "inventory:1.0-SNAPSHOT";

    private static SystemResourceClient client;
    // tag::network1[]
    private static Network network = Network.newNetwork();
    // end::network1[]

    // tag::postgresContainer[]
    // tag::GenericContainer[]
    private static GenericContainer<?> postgresContainer
    // end::GenericContainer[]
        = new GenericContainer<>(DB_IMAGE)
              // tag::network2[]
              .withNetwork(network)
              // end::network2[]
              .withExposedPorts(DB_PORT)
              .withNetworkAliases(DB_HOST)
              // tag::withLogConsumer1[]
              .withLogConsumer(new Slf4jLogConsumer(logger));
              // end::withLogConsumer1[]
    // end::postgresContainer[]

    // tag::inventoryContainer[]
    // tag::LibertyContainer[]
    private static LibertyContainer inventoryContainer
    // end::LibertyContainer[]
        = new LibertyContainer(invImage, httpPort, httpsPort)
              .withEnv("DB_HOSTNAME", DB_HOST)
              // tag::network3[]
              .withNetwork(network)
              // end::network3[]
              // tag::waitingFor[]
              .waitingFor(Wait.forHttp("/health/ready").forPort(httpPort))
              // end::waitingFor[]
              // tag::withLogConsumer2[]
              .withLogConsumer(new Slf4jLogConsumer(logger));
              // end::withLogConsumer2[]
    // end::inventoryContainer[]

    // tag::isServiceRunning[]
    private static boolean isServiceRunning(String host, int port) {
        try {
            Socket socket = new Socket(host, port);
            socket.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    // end::isServiceRunning[]

    // tag::createRestClient[]
    private static SystemResourceClient createRestClient(String urlPath) {
        ClientBuilder builder = ResteasyClientBuilder.newBuilder();
        ResteasyClient client = (ResteasyClient) builder.build();
        ResteasyWebTarget target = client.target(UriBuilder.fromPath(urlPath));
        return target.proxy(SystemResourceClient.class);
    }
    // end::createRestClient[]

    // tag::setup[]
    @BeforeAll
    public static void setup() throws Exception {
        String urlPath;
        if (isServiceRunning("localhost", httpPort)) {
            logger.info("Testing by dev mode or local Liberty...");
            if (isServiceRunning("localhost", DB_PORT)) {
                logger.info("The application is ready to test.");
                urlPath = "http://localhost:" + httpPort;
            } else {
                throw new Exception("Postgres database is not running");
            }
        } else {
            logger.info("Testing by using Testcontainers...");
            if (isServiceRunning("localhost", DB_PORT)) {
                throw new Exception(
                      "Postgres database is running locally. Stop it and retry.");
            } else {
                // tag::postgresContainerStart[]
                postgresContainer.start();
                // end::postgresContainerStart[]
                // tag::inventoryContainerStart[]
                inventoryContainer.start();
                // end::inventoryContainerStart[]
                urlPath = inventoryContainer.getBaseURL();
            }
        }
        urlPath += contextRoot;
        System.out.println("TEST: " + urlPath);
        client = createRestClient(urlPath);
    }
    // end::setup[]

    // tag::tearDown[]
    @AfterAll
    public static void tearDown() {
        inventoryContainer.stop();
        postgresContainer.stop();
        network.close();
    }
    // end::tearDown[]

    private void showSystemData(SystemData system) {
        System.out.println("TEST: SystemData > "
            + system.getId() + ", "
            + system.getHostname() + ", "
            + system.getOsName() + ", "
            + system.getJavaVersion() + ", "
            + system.getHeapSize());
    }

    // tag::testAddSystem[]
    @Test
    @Order(1)
    public void testAddSystem() {
        System.out.println("TEST: Testing add a system");
        // tag::addSystem[]
        client.addSystem("localhost", "linux", "11", Long.valueOf(2048));
        // end::addSystem[]
        // tag::listContents[]
        List<SystemData> systems = client.listContents();
        // end::listContents[]
        assertEquals(1, systems.size());
        showSystemData(systems.get(0));
        assertEquals("11", systems.get(0).getJavaVersion());
        assertEquals(Long.valueOf(2048), systems.get(0).getHeapSize());
    }
    // end::testAddSystem[]

    // tag::testUpdateSystem[]
    @Test
    @Order(2)
    public void testUpdateSystem() {
        System.out.println("TEST: Testing update a system");
        // tag::updateSystem[]
        client.updateSystem("localhost", "linux", "8", Long.valueOf(1024));
        // end::updateSystem[]
        // tag::getSystem[]
        SystemData system = client.getSystem("localhost");
        // end::getSystem[]
        showSystemData(system);
        assertEquals("8", system.getJavaVersion());
        assertEquals(Long.valueOf(1024), system.getHeapSize());
    }
    // end::testUpdateSystem[]

    // tag::testRemoveSystem[]
    @Test
    @Order(3)
    public void testRemoveSystem() {
        System.out.println("TEST: Testing remove a system");
        // tag::removeSystem[]
        client.removeSystem("localhost");
        // end::removeSystem[]
        List<SystemData> systems = client.listContents();
        assertEquals(0, systems.size());
    }
    // end::testRemoveSystem[]
}
