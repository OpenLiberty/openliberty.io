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

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class JobManager {
    private Map<String, Integer> jobResults = Collections.synchronizedMap(new HashMap<String, Integer>());

    public void addResult(String jobId, Integer result) {
        jobResults.put(jobId, result);
    }

    public Optional<Integer> getResult(String jobId) {
        Integer result = jobResults.get(jobId);
        return Optional.ofNullable(result);
    }

    public Map<String, Integer> getResults() {
        return new HashMap<>(jobResults);
    }
}
