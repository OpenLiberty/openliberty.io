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

// Setup and listen to version clicks
function addVersionClick(){
    var onclick = function(event) {
        var resource = $(event.currentTarget);
        var href = resource.attr("href");
        var url = window.location.href;
        var newUrl = url.substring(0,url.lastIndexOf('/')) + '/' + href;
        window.location.href = newUrl;
    };
    $(".feature_version").on("click", onclick);
}

$(document).ready(function () {  
    addVersionClick();
});
