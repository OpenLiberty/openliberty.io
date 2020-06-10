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

// When loading the page, if the page from the url isn't selected in the TOC we need to look for its version in the TOC and highlight it since the multiple feature versions only have one TOC entry.
function selectTOC(){
    var first_version = $('.feature_version').first();
    var href = first_version.attr('href');
    // Look for toc under the features dropdown
    var featureDropdown = $('li > span:contains(Features)').parent();
    var toc = featureDropdown.find('.nav-item a[href="' + href +'"]');
    if(toc.length > 0){
        var li = toc.parent();
        if(!li.hasClass('is-current-page')){
            $('.is-active').removeClass('is-active is-current-page');
            li.addClass('is-active is-current-page');

            // Go through the parents and make sure they are expanded
            var parents = li.parents('li');
            parents.each(function(){
                $(this).addClass('is-active is-current-path');
            });
        }
    }
}

$(document).ready(function () {  
    addVersionClick();
    // selectTOC();
});
