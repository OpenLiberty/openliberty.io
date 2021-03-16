package io.openliberty.website;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

import io.openliberty.website.data.StarterInfo;

@ApplicationScoped
public class StarterManager {

    private Client client = null;

    public StarterManager() {
        client = ClientBuilder.newClient();
    }

    public String getInfo() {
        WebTarget target = client.target(Constants.OPEN_LIBERTY_STARTER_HOST + Constants.STARTER_INFO_PATH);
        Builder builder = target.request("application/json");
        builder.header("Authorization", "Basic " + System.getenv(Constants.PAT_ENV_VARIABLE_NAME));
        Response response = builder.get();
        return response.readEntity(String.class);
    }
}
