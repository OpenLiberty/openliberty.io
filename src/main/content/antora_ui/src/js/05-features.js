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

function acivateNavMenu(){
    // Add active class to the nav-menu
    $('.nav-panel-menu').addClass('is-active');
}

function highlightSelectedVersion(){
    var url = window.location.href;
    var version = url.substring(url.lastIndexOf('/') + 1);
    var versionHref = $('.feature_version[href="' + version + '"]');
    if(versionHref.length === 1){
        versionHref.addClass('feature_version_selected');
    }
}

// When loading the page, if the page from the url isn't selected in the TOC we need to look for its version in the TOC and highlight it since the multiple feature versions only have one TOC entry.
function selectTOC(){
    var first_version = $('.feature_version').first();
    var href = first_version.attr('href');
    if(!href){
        // If the feature is a single version it won't have a version switcher at the top. Get the href from the url.
        href = window.location.href;
        href = href.substring(href.lastIndexOf('/') + 1);
    }
    // Look for toc under the features dropdown
    var featureDropdown = $('li > span:contains(Features)').parent();
    var toc = featureDropdown.find('.nav-item a').filter(function(){
        var tocHref = $(this).attr('href');
        tocHref = tocHref.substring(tocHref.lastIndexOf('/') + 1);
        return href === tocHref;
    });
    if(toc.length > 0){        
        var li = toc.parent()[0];
        navigation.activateCurrentPath(li);
        navigation.scrollItemToMidpoint(li);
    }
}

$(document).ready(function () {  
    addVersionClick();
    acivateNavMenu();
    highlightSelectedVersion();
    selectTOC();
});
