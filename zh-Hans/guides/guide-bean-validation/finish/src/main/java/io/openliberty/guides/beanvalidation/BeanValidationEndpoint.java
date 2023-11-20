// tag::copyright[]
/*******************************************************************************
 * Copyright (c) 2018, 2022 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
// end::copyright[]
package io.openliberty.guides.beanvalidation;

import java.util.Set;

import jakarta.inject.Inject;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;

@Path("/")
public class BeanValidationEndpoint {

    @Inject
    Validator validator;

    @Inject
    // tag::Spacecraft[]
    Spacecraft bean;
    // end::Spacecraft[]

    @POST
    @Path("/validatespacecraft")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "POST request to validate your spacecraft bean")
    // tag::validate-Spacecraft[]
    public String validateSpacecraft(
        @RequestBody(description = "Specify the values to create the "
                + "Astronaut and Spacecraft beans.",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = Spacecraft.class)))
        Spacecraft spacecraft) {

            // tag::ConstraintViolation[]
            Set<ConstraintViolation<Spacecraft>> violations
            // end::ConstraintViolation[]
            // tag::validate[]
                = validator.validate(spacecraft);
            // end::validate[]

            if (violations.size() == 0) {
                return "No Constraint Violations";
            }

            StringBuilder sb = new StringBuilder();
            for (ConstraintViolation<Spacecraft> violation : violations) {
                sb.append("Constraint Violation Found: ")
                .append(violation.getMessage())
                .append(System.lineSeparator());
            }
            return sb.toString();
    }
    // end::validate-Spacecraft[]

    @POST
    @Path("/launchspacecraft")
    @Produces(MediaType.TEXT_PLAIN)
    @Operation(summary = "POST request to specify a launch code")
    // tag::launchSpacecraft[]
    public String launchSpacecraft(
        @RequestBody(description = "Enter the launch code.  Must not be "
                + "null and must equal OpenLiberty for successful launch.",
            content = @Content(mediaType = "text/plain"))
        String launchCode) {
            try {
                bean.launchSpacecraft(launchCode);
                return "launched";
            } catch (ConstraintViolationException ex) {
                return ex.getMessage();
            }
    }
    // end::launchSpacecraft[]
}
