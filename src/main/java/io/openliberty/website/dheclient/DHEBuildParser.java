/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.dheclient;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.ProcessingException;
import javax.ws.rs.WebApplicationException;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.openliberty.website.Constants;
import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.data.BuildType;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.dheclient.data.BuildListInfo;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class manages accessing and updating the build data from DHE.
 * DHE is an IBM managed download site where Liberty builds are physically stored.
 */
@ApplicationScoped
public class DHEBuildParser {

    private static final Logger logger = Logger.getLogger(DHEBuildParser.class.getName());

    @Inject
    private BuildStore store;

    @Inject
    private ScheduledExecutorService exec;

    @Inject
    @ConfigProperty(defaultValue = "1", name = "build.sync.period")
    private int delay = 1;
    @Inject
    @ConfigProperty(defaultValue = "HOURS", name = "build.sync.period.unit")
    private TimeUnit delayTime = TimeUnit.HOURS;

    @Inject
    private volatile BuildData buildData;

    private List<ScheduledFuture<?>> futures = new ArrayList<>();

    /** Defined default constructor */
    public DHEBuildParser() {
    }

    /** Allow for unittest injection */
    public DHEBuildParser(BuildStore store) {
        this.store = store;
        this.buildData = new BuildData();
        exec = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());
        init();
    }

    public LastUpdate getLastUpdate() {
        LastUpdate lastUpdate = buildData.getLastUpdate();
        if (logger.isLoggable(Level.FINER)) {
            logger.log(Level.FINE, "getLastUpdate()", lastUpdate);
        }
        return lastUpdate;
    }

    public BuildData getBuildData() {
        if (logger.isLoggable(Level.FINER)) {
            logger.log(Level.FINE, "getBuildData()", buildData);
        }
        return buildData;
    }

    /**
     * This method initalizes build fetching for the specified build type. The 
     * intent for this method is to inline fetch the most recent release build,
     * but then defer loading the others to another thread. This way we always
     * have a build to return, but most builds are fetched async.
     * 
     * @param type the type of build to initalize
     */
    private void initBuilds(BuildType type) {
        try {
            // Do a sync get to load all versions
            BuildListInfo buildList = store.getBuildListInfo(type);

            // If something goes wrong this could be null, or an empty list so cope gracefully
            if (buildList != null && !buildList.versions.isEmpty()) {
                // Sort by reverse natural order, which means the most recently published build 
                // will be first
                Collections.sort(buildList.versions, Comparator.reverseOrder());

                // notify the number of builds that are about  to be fetched.
                buildData.pending(buildList.versions.size());

                // remove the first one and fetch it syncronously.
                String mostRecent = buildList.versions.remove(0);
                BuildInfo info = store.getBuildInfo(type, mostRecent);

                // add the build into the build data store.
                add(type, mostRecent, info);

                // Submit an async thread to go fetch all the other builds.
                exec.submit(new RetrieveBuildList(type) {
                    public void run() {
                        processBuildList(buildList.versions);
                    }
                });
            }
        } catch (ProcessingException | WebApplicationException e) {
            System.err.println("Failure accessing build: " + type + " error was: " + e.getMessage());
        }
    }

    /**
     * BuildInfo's fetched from DHE need some post processing before they can
     * be returned by the website, so this method makes sure all that code is done
     * in one place.
     * 
     * @param type the type of build
     * @param version the date of publication
     * @param info the build info
     */
    public void add(BuildType type, String version, BuildInfo info) {
        if (info != null) {
            // Make sure we resolve the locations for the Build 
            info.resolveLocations(Constants.DHE_URL, type, version);
            // provide the build to the build data object.
            buildData.supply(type, info);
        }
    }

    /**
     * This method kicks of the initialization routines.
     */
    @PostConstruct
    public void init() {
        // Start out by running init for the releases. We want to make sure we always
        // have the most recent releases, but older ones are less critical in the situation
        // where it takes time to fetch the data from DHE.
        initBuilds(BuildType.runtime_releases);
        initBuilds(BuildType.tools_releases);

        System.out.println("Setting up build sync to run every " + delay + " " + delayTime.toString().toLowerCase());

        // We kicked off the release already so we don't need to resync for an hour
        futures.add(exec.scheduleWithFixedDelay(new RetrieveBuildList(BuildType.runtime_releases), delay, delay, delayTime));
        futures.add(exec.scheduleWithFixedDelay(new RetrieveBuildList(BuildType.tools_releases), delay, delay, delayTime));
        // We haven't read any data about nightly builds so we need to run this now
        futures.add(exec.scheduleWithFixedDelay(new RetrieveBuildList(BuildType.runtime_nightly_builds), 0, delay, delayTime));
        futures.add(exec.scheduleWithFixedDelay(new RetrieveBuildList(BuildType.tools_nightly_builds), 0, delay, delayTime));
        futures.add(exec.scheduleWithFixedDelay(new RetrieveBuildList(BuildType.runtime_betas), 0, delay, delayTime));
    }

    @PreDestroy
    public void destroy() {
        for (ScheduledFuture<?> future : futures) {
            future.cancel(false);
        }
    }

    /**
     * This Runnable handles fetching builds for a given type.
     */
    class RetrieveBuildList implements Runnable {
        private BuildType type;

        RetrieveBuildList(BuildType t) {
            type = t;
        }

        @Override
        public void run() {
            try {
                //  find out which builds we need
                BuildListInfo listInfo = store.getBuildListInfo(type);

                // If we don't get any builds back just skip.
                if (listInfo != null && !listInfo.versions.isEmpty()) {
                    // Sort by reverse order so we fetch newer builds first. This means that
                    // we will load builds we don't know about before refrehsing builds we
                    // already know about. Updating build data doesn't happen often, but it
                    // does happen.
                    Collections.sort(listInfo.versions, Comparator.reverseOrder());

                    // Notify that builds are pending
                    buildData.pending(listInfo.versions.size());

                    // process the build list.
                    processBuildList(listInfo.versions);
                }
            } catch (ProcessingException | WebApplicationException e) {
                System.err.println("Failure accessing builds: " + type + " error was: " + e.getMessage());
                e.printStackTrace();
            }
        }

        /**
         * This method loads all the build info. The main reason it is a separate
         * method is because this class is subclassed in the initBuilds method
         * where the logic in the run method isn't required.
         * 
         * @param versions the versions to fetch.
         */
        public void processBuildList(Collection<String> versions) {
            for (String version : versions) {
                try {
                    BuildInfo info = store.getBuildInfo(type, version);

                    add(type, version, info);
                } catch (RuntimeException e) {
                    System.err.println("Failure accessing build: " + type + " at " + version + " error was: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
    }
}
