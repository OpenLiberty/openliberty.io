// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - Initial implementation
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.gateway;

import java.util.concurrent.CompletionStage;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.rest.client.inject.RestClient;

import io.openliberty.guides.gateway.client.JobClient;
import io.openliberty.guides.models.JobList;
import io.openliberty.guides.models.Job;
import io.openliberty.guides.models.JobResult;

@Path("/jobs")
public class GatewayJobResource {

    @Inject
    @RestClient
    private JobClient jobClient;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public CompletionStage<JobList> getJobs() {
        return jobClient
            .getJobs()
            // tag::thenApplyAsync[]
            .thenApplyAsync((jobs) -> {
                return new JobList(jobs.getResults());
            })
            // end::thenApplyAsync[]
            // tag::exceptionally[]
            .exceptionally((ex) -> {
                // Respond with empty list on error
                return new JobList();
            });
            // end::exceptionally[]
    }

    @GET
    @Path("{jobId}")
    @Produces(MediaType.APPLICATION_JSON)
    public CompletionStage<JobResult> getJob(@PathParam("jobId") String jobId) {
        return jobClient.getJob(jobId);
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public CompletionStage<Job> createJob() {
        return jobClient.createJob();
    }
}
