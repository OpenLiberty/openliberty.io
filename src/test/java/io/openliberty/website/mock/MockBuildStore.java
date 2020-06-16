/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.mock;

import java.util.Arrays;

import io.openliberty.website.Constants;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.dheclient.BuildStore;
import io.openliberty.website.dheclient.data.BuildListInfo;

public class MockBuildStore implements BuildStore {

    @Override
    public BuildListInfo getBuildListInfo(String downloadType, String buildType) {
        BuildListInfo result = new BuildListInfo(); 
        if (Constants.RUNTIME.equals(downloadType)) {
            if (Constants.DHE_RELEASE_PATH_SEGMENT.equals(buildType)) {
                result.versions.addAll(Arrays.asList("2020-01-08_0300","2020-02-04_1746","2020-03-05_1433"));
            } else if (Constants.DHE_BETA_PATH_SEGMENT.equals(buildType)) {
                result.versions.addAll(Arrays.asList("2020-06-09_1652"));
            }
            else {
                result.versions.addAll(Arrays.asList("2020-04-01_1714","2020-04-01_1739","2020-04-01_1900"));
            }
        } else if (Constants.TOOLS.equals(downloadType)) {
            if (Constants.DHE_RELEASE_PATH_SEGMENT.equals(buildType)) {
                result.versions.addAll(Arrays.asList("2019-09-12_1520", "2019-12-13_0905", "2020-03-09_0937"));
            } else {
                
                result.versions.addAll(Arrays.asList("2020-03-27_0905","2020-03-29_0905","2020-03-30_0918"));
            }
        }
        return result;
    }

    @Override
    public BuildInfo getBuildInfo(String downloadType, String buildType, String version) {
        switch (version) {
            case "2020-01-08_0300":
                return new BuildInfo("gradle.log", "openliberty-20.0.0.1.zip", 12503, 12503, "open-liberty.unitTest.results.zip", "20.0.0.1", "openliberty-javaee8-20.0.0.1.zip", "openliberty-webProfile8-20.0.0.1.zip","openliberty-microProfile3-20.0.0.1.zip");
            case "2020-02-04_1746":
                return new BuildInfo("gradle.log", "openliberty-20.0.0.2.zip", 12480, 12480, "open-liberty.unitTest.results.zip", "20.0.0.2", "openliberty-javaee8-20.0.0.2.zip", "openliberty-webProfile8-20.0.0.2.zip","openliberty-microProfile3-20.0.0.2.zip");
            case "2020-03-05_1433":
                return new BuildInfo("gradle.log", "openliberty-20.0.0.3.zip", 12976, 12976, "open-liberty.unitTest.results.zip", "20.0.0.3", "openliberty-javaee8-20.0.0.3.zip", "openliberty-webProfile8-20.0.0.3.zip","openliberty-microProfile3-20.0.0.3.zip");
            
            case "2020-06-09_1652":
                return new BuildInfo("gradle.log", "openliberty-20.0.0.7-beta.zip", 13143, 13143, "open-liberty.unitTest.results.zip", "20.0.0.7", "openliberty-jakartaee9-20.0.0.7-beta.zip");


            case "2020-04-01_1714":
                return new BuildInfo("gradle.log", "openliberty-all-20.0.0.4-cl200420200401-1714.zip", 13051, 13051, "open-liberty.unitTest.results.zip", "20.0.0.4-202004011949");
            case "2020-04-01_1739":
                return new BuildInfo("gradle.log", "openliberty-all-20.0.0.4-cl200420200401-1739.zip", 13051, 13051, "open-liberty.unitTest.results.zip", "20.0.0.4-202004012010");
            case "2020-04-01_1900":
                return new BuildInfo("gradle.log", "openliberty-all-20.0.0.4-cl200420200401-1900.zip", 13051, 13051, "open-liberty.unitTest.results.zip", "20.0.0.4-202004012136");
            case "2019-09-12_1520":
                return new BuildInfo("openlibertytools-19.0.0.9.zip", "19.0.0.9");
            case "2019-12-13_0905":
                return new BuildInfo("openlibertytools-19.0.0.12.zip", "19.0.0.12");
            case "2020-03-09_0937":
                return new BuildInfo("openlibertytools-20.0.0.3.zip", "20.0.0.3");
            case "2020-03-27_0905":
                return new BuildInfo("build.log", "openlibertytools-20.0.0.6.v2020-03-27_0905.zip", 122, 122, "test_results.html");
            case "2020-03-29_0905":
               return new BuildInfo("build.log", "openlibertytools-20.0.0.6.v2020-03-29_0905.zip", 122, 122, "test_results.html");
            case "2020-03-30_0918":
                return new BuildInfo("build.log", "openlibertytools-20.0.0.6.v2020-03-30_0918.zip", 122, 122, "test_results.html");
        }
        return null;
    }
    
}
