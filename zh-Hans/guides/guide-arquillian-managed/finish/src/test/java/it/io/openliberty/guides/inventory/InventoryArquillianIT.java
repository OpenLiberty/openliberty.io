// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package it.io.openliberty.guides.inventory;

import java.net.URL;
import java.util.List;

import jakarta.inject.Inject;
import jakarta.json.JsonObject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;

import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.container.test.api.RunAsClient;
import org.jboss.arquillian.junit.Arquillian;
import org.jboss.arquillian.junit.InSequence;
import org.jboss.arquillian.test.api.ArquillianResource;
import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.spec.WebArchive;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

import io.openliberty.guides.inventory.InventoryResource;
import io.openliberty.guides.inventory.model.InventoryList;
import io.openliberty.guides.inventory.model.SystemData;

// tag::RunWith[]
@RunWith(Arquillian.class)
// end::RunWith[]
public class InventoryArquillianIT {

    // tag::warName[]
    private static final String WARNAME = System.getProperty("arquillian.war.name");
    // end::warName[]
    private final String INVENTORY_SYSTEMS = "inventory/systems";
    private Client client = ClientBuilder.newClient();

    // tag::Deployment[]
    // tag::Testable[]
    @Deployment(testable = true)
    // end::Testable[]
    public static WebArchive createDeployment() {
        // tag::WebArchive[]
        WebArchive archive = ShrinkWrap.create(WebArchive.class, WARNAME)
        // end::WebArchive[]
                                       .addPackages(true, "io.openliberty.guides");
        return archive;
    }
    // end::Deployment[]

    // tag::ArquillianResource[]
    @ArquillianResource
    // end::ArquillianResource[]
    private URL baseURL;

    // tag::InventoryResource[]
    @Inject
    InventoryResource invSrv;
    // end::InventoryResource[]

    @Test
    // tag::RunAsClient[]
    @RunAsClient
    // end::RunAsClient[]
    // tag::InSequence1[]
    @InSequence(1)
    // end::InSequence1[]
    // tag::testInventoryEndpoints[]
    public void testInventoryEndpoints() throws Exception {
        String localhosturl = baseURL + INVENTORY_SYSTEMS + "/localhost";

        WebTarget localhosttarget = client.target(localhosturl);
        Response localhostresponse = localhosttarget.request().get();

        Assert.assertEquals("Incorrect response code from " + localhosturl, 200,
                            localhostresponse.getStatus());

        JsonObject localhostobj = localhostresponse.readEntity(JsonObject.class);
        Assert.assertEquals("The system property for the local and remote JVM "
                        + "should match", System.getProperty("os.name"),
                            localhostobj.getString("os.name"));

        String invsystemsurl = baseURL + INVENTORY_SYSTEMS;

        WebTarget invsystemstarget = client.target(invsystemsurl);
        Response invsystemsresponse = invsystemstarget.request().get();

        Assert.assertEquals("Incorrect response code from " + localhosturl, 200,
                            invsystemsresponse.getStatus());

        JsonObject invsystemsobj = invsystemsresponse.readEntity(JsonObject.class);

        int expected = 1;
        int actual = invsystemsobj.getInt("total");
        Assert.assertEquals("The inventory should have one entry for localhost",
                            expected, actual);
        localhostresponse.close();
    }
    // end::testInventoryEndpoints[]

    @Test
    // tag::InSequence2[]
    @InSequence(2)
    // end::InSequence2[]
    // tag::testInventoryResourceFunctions[]
    public void testInventoryResourceFunctions() {
        // Listing the inventory contents that were stored in the previous test
        // tag::listContents[]
        InventoryList invList = invSrv.listContents();
        // end::listContents[]
        Assert.assertEquals(1, invList.getTotal());

        List<SystemData> systemDataList = invList.getSystems();
        Assert.assertTrue(systemDataList.get(0).getHostname().equals("localhost"));

        Assert.assertTrue(systemDataList.get(0).getProperties().get("os.name")
                                        .equals(System.getProperty("os.name")));
    }
    // end::testInventoryResourceFunctions[]
}
