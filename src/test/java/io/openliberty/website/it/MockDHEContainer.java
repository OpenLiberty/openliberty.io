/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial test
 *******************************************************************************/
package io.openliberty.website.it;

import static org.mockserver.model.HttpRequest.request;
import static org.mockserver.model.HttpResponse.response;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URI;

import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;

import com.google.common.net.MediaType;

import org.eclipse.microprofile.rest.client.RestClientBuilder;
import org.microshed.testing.SharedContainerConfiguration;
import org.mockserver.client.MockServerClient;
import org.mockserver.model.HttpRequest;
import org.testcontainers.containers.MockServerContainer;
import org.testcontainers.junit.jupiter.Container;

import io.openliberty.website.data.BuildType;
import io.openliberty.website.dheclient.BuildStore;
import io.openliberty.website.dheclient.data.BuildListInfo;

public class MockDHEContainer implements SharedContainerConfiguration {
    @Container
    public static MockServerContainer mockDHE = new MockServerContainer().withNetworkAliases("mockdhe");

    private static final Jsonb jsonb = JsonbBuilder.create();

    @Override
    public void startContainers() {
        mockDHE.start();

        MockServerClient client = new MockServerClient(mockDHE.getContainerIpAddress(), mockDHE.getServerPort());

        try {
            loadBuilds(client, BuildType.runtime_releases, "2020-03-05_1433", "2020-04-01_1714");
            loadBuilds(client, BuildType.tools_releases, "2019-12-13_0905", "2020-03-09_0937");
            loadBuilds(client, BuildType.runtime_nightly_builds, "2020-05-01_0529", "2020-05-01_1100");
            loadBuilds(client, BuildType.tools_nightly_builds, "2020-04-26_0904", "2020-04-29_0947");
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        }
    }

    private static void loadBuilds(MockServerClient client, BuildType buildType, String ... builds) throws IOException {
        loadBuilds(client, buildType, new BuildListInfo(), builds);
    }

    private static void loadBuilds(MockServerClient client, BuildType buildType, BuildListInfo bli, String ... builds)
            throws IOException {

        for (String dateTime : builds) {
            String fileName = buildType.getURISegment() + "/" + dateTime + "/info.json";
            StringBuilder builder = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new FileReader(new File("src/test/mockdhe", fileName)))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    builder.append(line);
                    builder.append("\r\n");
                }
            }
    
            client.when(request("/" + fileName))
                    .respond(response().withBody(builder.toString(), MediaType.create("text", "plain")));

            bli.versions.add(dateTime);
        }

        HttpRequest request = request("/" + buildType.getURISegment() + "/info.json");
        client.clear(request);
        client.when(request)
                .respond(response().withBody(jsonb.toJson(bli), MediaType.create("text", "plain")));
    }

    public static void addBuilds(BuildType buildType, String ... builds) throws IOException {
        MockServerClient client = new MockServerClient(mockDHE.getContainerIpAddress(), mockDHE.getServerPort());
        BuildStore store =  RestClientBuilder.newBuilder().baseUri(URI.create("http://localhost:" + mockDHE.getMappedPort(MockServerContainer.PORT) + "/")).build(BuildStore.class);

        BuildListInfo bli = store.getBuildListInfo(buildType);

        loadBuilds(client, buildType, bli, builds);

    }

	public static String getMockDHETarget() {
		return "http://mockdhe:" + MockServerContainer.PORT + "/";
	}

}