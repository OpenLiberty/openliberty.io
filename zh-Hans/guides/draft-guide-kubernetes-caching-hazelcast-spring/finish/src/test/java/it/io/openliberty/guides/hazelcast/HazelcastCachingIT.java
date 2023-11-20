/*
 * Copyright 2014-2016 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package it.io.openliberty.guides.hazelcast;

import io.openliberty.guides.hazelcast.CommandResponse;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;


public class HazelcastCachingIT {

    private static String clusterUrl;


    @BeforeClass
    public static void oneTimeSetup() {
        String clusterIp = System.getProperty("cluster.ip");
        String nodePort = System.getProperty("cluster.port");
        clusterUrl = "http://" + clusterIp + ":" + nodePort ;
    }


    @Test(timeout = 60000)
    public void testHazelcastCache()
            throws Exception {


        String key = "1";
        String value = "hazelcast-springboot-openliberty";

        String put_url = String.format(clusterUrl +"/put?key=%s&value=%s", key, value);
        RestTemplate rest = new RestTemplate();

        ResponseEntity<CommandResponse> putResponse = rest.getForEntity(put_url, CommandResponse.class);
        Assert.assertTrue(putResponse.getStatusCode() == HttpStatus.OK);

        String firstPod = putResponse.getBody().getPodName();

        //GET call to see data is coming from another pod
        String get_url = String.format(clusterUrl+"/get?key=%s", key);

        while (true) { // it will try every second until it timeouts in 60 seconds
            ResponseEntity<CommandResponse> getResponse = rest.getForEntity(get_url, CommandResponse.class);
            String secondPod = getResponse.getBody().getPodName();
            if (!secondPod.equals(firstPod)) break; // we get the response from different pod so SUCCESS!!
            Thread.sleep(1000);
        }
    }

}
