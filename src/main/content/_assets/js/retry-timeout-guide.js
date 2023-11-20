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
$(document).ready(function() {
    var iguideJsonName = "/guides/iguide-retry-timeout/json-guides/retry-timeout.json";
    var iguideContextRoot = "RetryTimeout";

    jsonGuide.getAGuide(iguideJsonName).done(function() {
      blueprint.create(iguideContextRoot);
    });
  });