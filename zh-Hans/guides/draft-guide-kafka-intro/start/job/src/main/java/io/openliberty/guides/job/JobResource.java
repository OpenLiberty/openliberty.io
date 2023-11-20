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
package io.openliberty.guides.job;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

// CDI
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
// JAX-RS
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import io.openliberty.guides.models.Job;
import io.openliberty.guides.models.JobResult;
import io.openliberty.guides.models.Jobs;

@RequestScoped
@Path("/jobs")
public class JobResource {

  @Inject
  private JobProducer producer;

  @Inject
  private JobManager manager;

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  public Job createJob() {
    String jobId = UUID.randomUUID().toString();
    Job job = new Job();
    job.setJobId(jobId);

    Jsonb jsonb = JsonbBuilder.create();
    producer.sendMessage("job-topic", jsonb.toJson(job));

    return job;
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Jobs getJobResults() {
    List<JobResult> results = manager.getResults()
      .entrySet()
      .stream()
      .map(es -> creatJobResult(es.getKey(), es.getValue()))
      .collect(Collectors.toList());

    Jobs responseJobs = new Jobs();
    responseJobs.setResults(results);
    return responseJobs;
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("{jobId}")
  public Response getJobResult(@PathParam("jobId") String jobId) {
    Optional<JobResult> jobResult = manager
      .getResult(jobId)
      .map(r -> creatJobResult(jobId, r));

    if (jobResult.isPresent()) {
      return Response.ok(jobResult.get()).build();
    }

    return Response.status(Status.NOT_FOUND).build();
  }

  private JobResult creatJobResult(String jobId, int result) {
    JobResult jobResult = new JobResult();
    jobResult.setJobId(jobId);
    jobResult.setResult(result);
    return jobResult;
  }

}
