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

import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

import javax.json.bind.annotation.JsonbProperty;
import javax.json.bind.annotation.JsonbTransient;

import io.openliberty.website.Constants;

public class BuildData {
	@JsonbProperty(Constants.LATEST_RELEASES)
	public LatestReleases latestReleases = new LatestReleases();
	@JsonbProperty(Constants.BUILDS)
	public ConcurrentMap<BuildType, Set<BuildInfo>> builds = new ConcurrentHashMap<>();
	@JsonbTransient
	private Map<BuildType, Set<String>> pendingBuildsByType = new HashMap<>();
	@JsonbTransient
	private Map<BuildType, Map<String, BuildInfo>> waitingBuildsByType = new HashMap<>();

	@JsonbTransient
	private LastUpdate lastUpdate;
	@JsonbTransient
	private AtomicInteger pendingBuilds = new AtomicInteger();

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

	public synchronized void supply(BuildType type, BuildInfo bi) {
		Set<String> pendingBuildList = pendingBuildsByType.get(type);

		Iterator<String> builds = pendingBuildList.iterator();

		if (builds.hasNext()) {
			String nextBuild = builds.next();

			if (nextBuild.equals(bi.dateTime)) {
				builds.remove();
				Set<BuildInfo> storedBuilds = this.builds.get(type);

				storedBuilds.add(bi);

				int pendingBuildCount = pendingBuilds.decrementAndGet();

				Map<String, BuildInfo> waitingBuilds = this.waitingBuildsByType.get(type);

				if (waitingBuilds != null) {
					while (builds.hasNext()) {
						nextBuild = builds.next();
						bi = waitingBuilds.get(nextBuild);
						if (bi != null) {
							builds.remove();
							storedBuilds.add(bi);
							pendingBuildCount = pendingBuilds.decrementAndGet();
						} else {
							break;
						}
					}
				}

				BuildInfo latest = storedBuilds.iterator().next();

				if (type == BuildType.runtime_releases) {
					latestReleases.runtime = latest;
				} else if (type == BuildType.tools_releases) {
					latestReleases.tools = latest;
				}

				if (pendingBuildCount == 0) {
					lastUpdate.markSuccessfulUpdate();
				}
			} else {
				Map<String, BuildInfo> waitingBuilds = this.waitingBuildsByType.get(type);
				if (waitingBuilds == null) {
					waitingBuilds = new HashMap<>();
					this.waitingBuildsByType.put(type, waitingBuilds);
				}
				waitingBuilds.put(bi.dateTime, bi);
			}
		}
	}

	public synchronized Collection<String> pending(BuildType type, List<String> versions) {
		Set<String> storedVersions = pendingBuildsByType.get(type);
		if (storedVersions == null) {
			storedVersions = new TreeSet<>(Comparator.reverseOrder());
			pendingBuildsByType.put(type, storedVersions);
		}

		Set<String> newVersions = new TreeSet<>(versions);
		newVersions.removeAll(storedVersions);

		storedVersions.addAll(newVersions);

		pendingBuilds.addAndGet(newVersions.size());

		return newVersions;
	}
}