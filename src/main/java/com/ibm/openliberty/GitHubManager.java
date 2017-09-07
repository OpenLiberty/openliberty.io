package test;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

public class GitHubManager {
	
	private static GitHubManager instance = null;
	
	private Client client = null;
	
	public static synchronized GitHubManager getInstance() {
		if(instance == null) {
			instance = new GitHubManager();
		}
		return instance;
	}
	
	private GitHubManager() {
		client = ClientBuilder.newClient();
	}

	public String getIssues() {
		WebTarget target = client.target(Constants.GITHUB_ISSUES_URL);	
		Builder builder = target.request("application/json");
    	builder.header("Authorization", "Basic " +  System.getenv(Constants.PAT_ENV_VARIABLE_NAME));
    	Response response = builder.get();
    	return response.readEntity(String.class);
	}
	
}
