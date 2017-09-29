/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

var latest_release_url = '/api/builds/latest';

$(document).ready(function() {

    $.ajax({
        url: latest_release_url
    }).done(function(data) {

        $('#download_link').attr('href', data.runtime.driver_location);
        $('#download_link_size_label').text('(' + Math.floor(data.runtime.size_in_bytes / 1048576) + ' MB)');

    });
});