/*******************************************************************************
 * Copyright (c) 2018, 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.website.data;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.atomic.AtomicInteger;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Event;
import javax.inject.Inject;
import javax.json.bind.annotation.JsonbProperty;
import javax.json.bind.annotation.JsonbTransient;

import io.openliberty.website.Constants;
import io.openliberty.website.events.RuntimeRelease;

/**
 * This JSON-B object is the most important one since it is used to provide
 * the list of all  builds to the openliberty.io website.
 */
@ApplicationScoped
public class BuildData {
    @JsonbProperty(Constants.LATEST_RELEASES)
    private LatestReleases latestReleases = new LatestReleases();
    @JsonbProperty(Constants.BUILDS)
    private Map<BuildType, Set<BuildInfo>> builds = new HashMap<>();

    // These two fields should not be in the JSON-B payload
    /** The object tracking the last update start and success */
    private LastUpdate lastUpdate;
    /** Tracking how many builds are pending vs completed so we can successfully mark the update as complete */
    private AtomicInteger pendingBuilds = new AtomicInteger();
    @Inject
    @RuntimeRelease
    private Event<BuildInfo> event;


    public BuildData() {
        this(new LastUpdate());
    }

    /**
     * The constructor for this initializes the builds map with a sorted set
     * of BuildInfos. Adding something new to BuildType will automatically update
     * the TreeSet, so we don't need to worry later about a get on builds returning
     * null. This is simpler than using another JSON-B object since the only thing
     * we need to do to add a new BuildType is update the enum.
     * 
     * @param lu The LastUpdate object.
     */
    public BuildData(LastUpdate lu) {
        lastUpdate = lu;

        for (BuildType type : BuildType.values()) {
            Set<BuildInfo> storedBuilds = new TreeSet<>(new Comparator<BuildInfo>() {

                @Override
                public int compare(BuildInfo o1, BuildInfo o2) {
                    return o2.dateTime.compareTo(o1.dateTime);
                }
            });
            this.builds.put(type, storedBuilds);
        }
    }

    @JsonbTransient
    public LastUpdate getLastUpdate() {
        return lastUpdate;
    }

    @JsonbProperty(Constants.LATEST_RELEASES)
    public LatestReleases getLatestReleases() {
        return latestReleases;
    }

    public void setLatestReleases(LatestReleases latest) { 
        this.latestReleases = latest;
    }

    public void setBuilds(Map<BuildType, Set<BuildInfo>> builds) {
        this.builds = builds;
    }

    @JsonbProperty(Constants.BUILDS)
    public Map<BuildType, Set<BuildInfo>> getBuilds() {
        return builds;
    }

    /**
     * This method is used to add a new build to the build data. This
     * method does two things. First it adds it to the map in the right place,
     * if the build already exists then the old data will be purged. It also
     * updates latestReleases with the new data.
     * 
     * <p>BuildInfo must have dateTime set when this is called or a NPE will occur</p>
     * 
     * @param type The type of build being added
     * @param bi the build info for the build.
     */
    public synchronized void supply(BuildType type, BuildInfo bi) {
        Set<BuildInfo> info = builds.get(type);
        // Since the build may already exist we need to replace
        // that involves removing the existing one and readding
        // this is safe since the equals doesn't use all the data
        // just the publication date.
        info.remove(bi);
        info.add(bi);

        // We need to update the latest release for both tools and
        // runtime. If the current value is null we set it to this, 
        // otherwise we do a comparison based on the dateTime. If this
        // build is the same or newer we update the release.
        if (type == BuildType.runtime_releases) {
            if (latestReleases.runtime == null || 
                latestReleases.runtime.dateTime.compareTo(bi.dateTime) <= 0) {
                latestReleases.runtime = bi;
                // Notify the build to any CDI event listeners.
                if (type.isLatestBuildNotifiable() && event != null) {
                    event.fire(bi);
                }
            } 
        } else if (type == BuildType.tools_releases) {
            if (latestReleases.tools == null || 
                latestReleases.tools.dateTime.compareTo(bi.dateTime) <= 0) {
                latestReleases.tools = bi;
            } 
        }

        // Finally we want to decrement the pending builds and if it comes back
        // as zero then we mark the build as successfully updated. The use of
        // AtomicInteger is probalby over kill since there is a lock held when it
        // is updated. Hopefully at some point in the future we can revisit to 
        // remove the locks.
        if (pendingBuilds.decrementAndGet() == 0) {
            lastUpdate.markSuccessfulUpdate();
        }
    }

    /**
     * Used to indicate builds are about to be provided. This could be either new
     * builds or refreshing existing ones.
     * 
     * @param count The number of builds to add.
     */
    public synchronized void pending(int count) {
        if (pendingBuilds.getAndAdd(count) == 0) {
            lastUpdate.markUpdateAttempt();
        }
    }
}