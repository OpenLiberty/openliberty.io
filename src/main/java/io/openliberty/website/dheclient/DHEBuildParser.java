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

import java.util.Collections;
import java.util.Comparator;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import io.openliberty.website.Constants;
import io.openliberty.website.data.BuildData;
import io.openliberty.website.data.BuildInfo;
import io.openliberty.website.data.BuildType;
import io.openliberty.website.data.LastUpdate;
import io.openliberty.website.dheclient.data.BuildListInfo;

import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class DHEBuildParser {

	private static final Logger logger = Logger.getLogger(DHEBuildParser.class.getName());

	@Inject
	private BuildStore store;

	@Inject
	private ScheduledExecutorService exec;

	private final LastUpdate lastUpdate = new LastUpdate();

	private volatile BuildData buildData = new BuildData(lastUpdate);

	/** Defined default constructor */
	public DHEBuildParser() {
	}

	/** Allow for unittest injection */
	public DHEBuildParser(BuildStore store) {
		this.store = store;
		exec = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());
		init();
		lastUpdate.awaitSuccessfulUpdate();
	}

	public LastUpdate getLastUpdate() {
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

	private void initBuilds(BuildType type) {
		BuildListInfo buildList = store.getBuildListInfo(type);

		if (buildList != null && !buildList.versions.isEmpty()) {
			Collections.sort(buildList.versions, Comparator.reverseOrder());
			buildData.pending(type, buildList.versions);
			String mostRecent = buildList.versions.remove(0);
			BuildInfo info = store.getBuildInfo(type, mostRecent);

			info.resolveLocations(Constants.DHE_URL, type, mostRecent);
			buildData.supply(type, info);

			for (String v : buildList.versions) {
				exec.submit(new RetrieveBuildInfo(type, v));
			}
		} else {
			lastUpdate.markSuccessfulUpdate();
		}
	}

	@PostConstruct
	public void init() {
		lastUpdate.markUpdateAttempt();
		initBuilds(BuildType.runtime_releases);
		initBuilds(BuildType.tools_releases);
		exec.submit(new RetrieveBuildList(BuildType.runtime_nightly_builds));
		exec.submit(new RetrieveBuildList(BuildType.tools_nightly_builds));

		exec.scheduleWithFixedDelay(new UpdateBuildData(), 1, 1, TimeUnit.HOURS);
	}

	class UpdateBuildData implements Runnable {

		@Override
		public void run() {
			if (logger.isLoggable(Level.FINER)) {
		        logger.log(Level.FINE, "UpdateBuildData.call()");
            }
			lastUpdate.markUpdateAttempt();

			exec.submit(new RetrieveBuildList(BuildType.runtime_releases));
			exec.submit(new RetrieveBuildList(BuildType.runtime_nightly_builds));
			exec.submit(new RetrieveBuildList(BuildType.tools_releases));
			exec.submit(new RetrieveBuildList(BuildType.tools_nightly_builds));
		}
	}

	class RetrieveBuildInfo implements Runnable {
		private BuildType type;
		private String dateTime;

		RetrieveBuildInfo(BuildType t, String dateTime) {
			type = t;
			this.dateTime = dateTime;
		}

		@Override
		public void run() {
			if (logger.isLoggable(Level.FINER)) {
		        logger.log(Level.FINE, "RetrieveBuildInfo.call()");
			}
			
			BuildInfo info = store.getBuildInfo(type, dateTime);

			if (info != null) {
				if (info.packageLocations.isEmpty()) {
					info.packageLocations = null;
				}
				info.resolveLocations(Constants.DHE_URL, type, dateTime);
				buildData.supply(type, info);
			}
		}
	}

	class RetrieveBuildList implements Runnable {
		private BuildType type;

		RetrieveBuildList(BuildType t) {
			type = t;
		}

		@Override
		public void run() {
			BuildListInfo info = store.getBuildListInfo(type);

			if (info != null) {
				for (String version : buildData.pending(type, info.versions)) {
					exec.submit(new RetrieveBuildInfo(type, version));
				}
			}
		}
	}
}
