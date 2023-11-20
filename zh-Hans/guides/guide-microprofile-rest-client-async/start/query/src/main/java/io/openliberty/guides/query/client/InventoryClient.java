package io.openliberty.guides.query.client;

import java.util.List;
import java.util.Properties;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/inventory")
@RegisterRestClient(configKey = "InventoryClient", baseUri = "http://localhost:9085")
public interface InventoryClient extends AutoCloseable {

    @GET
    @Path("/systems")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> getSystems();

    @GET
    @Path("/systems/{hostname}")
    @Produces(MediaType.APPLICATION_JSON)
    public Properties getSystem(@PathParam("hostname") String hostname);

}
