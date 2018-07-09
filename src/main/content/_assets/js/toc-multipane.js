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
// Keep the table of contents (TOC) in view while scrolling (Desktop only)
function handleFloatingTableOfContent() {
    if ($(window).width() > 1440) {
        // CURRENTLY IN 3 COLUMN VIEW
        if ($(window).scrollTop() >= $('#toc_column').offset().top) {
            // The top of the TOC is scrolling off the screen, enable floating TOC.
            if(isBackgroundBottomVisible()) {
                handleTOCScrolling();
            } else {
                // The entire viewport is filled with the background, so
                // do not need to worry about the TOC flowing out of the background.
                enableFloatingTOC();
            }
        } else {
            // TOC no longer needs to float,
            // remove all the custom styling for floating TOC
            disableFloatingTOC();
        }
    } else {
        // CURRENTLY IN MOBILE VIEW OR 2 COLUMN VIEW
        // Remove any floating TOC
        disableFloatingTOC();
    }
}

function disableFloatingTOC() {
    $('#toc_inner').width("").css({"position": "", "top": ""});
}

function enableFloatingTOC() {
    $('#toc_inner').css({"position":"fixed", "top":"100px"});
}

// Remove previous TOC section highlighted and highlight correct step
function updateTOCHighlighting(id) {
    $('.liSelected').removeClass('liSelected');
    var anchor = $("#toc_container a[href='#" + id + "']");
    anchor.parent().addClass('liSelected');
}

// Handle when the table of content (TOC) is too small to fit completely in the dark background.
// We want to give the end result of the bottom of the TOC sticks to the bottom of the dark background
// and the top of the TOC scrolls off screen.
function handleTOCScrolling() {
    var visible_background_height = heightOfVisibleBackground();
    var toc_height = $('#toc_inner').height();
    if (toc_height > visible_background_height) {
        // The TOC cannot fit in the dark background, allow the TOC to scroll out of viewport
        // to avoid the TOC overflowing out of the dark background
        var negativeNumber = visible_background_height - toc_height + 100;
        $('#toc_inner').css({"position":"fixed", "top":negativeNumber});
    }
}


$(document).ready(function() {
    
    $("#breadcrumb_hamburger").on('click', function(event){
        // Handle resizing of the guide column when collapsing/expanding the TOC in 3 column view.
        if($(window).width() >= 1440){
            if ($("#toc_column").hasClass('in')) {
                // TOC is expanded
                $("#guide_column").addClass('expanded');
            }
            else {
                // TOC is closed
                $("#guide_column").removeClass('expanded');
            }
        }
        // Handle table of content floating if in the middle of the guide.
        handleFloatingTableOfContent();
    });

    // Handle collapsing the table of contents from full width into the hamburger
    $('#close_container').on('click', function(event) {
        // Hide the X button
        $(this).hide();

        // Show the hamburger button and adjust the header to accomodate it
        $('#breadcrumb_hamburger').addClass('showHamburger');
        $('#breadcrumb_row .breadcrumb').addClass('breadcrumbWithHamburger');
       
        $("#toc_title").css('margin-top', '20px');

        // Remove display type from the table of contents
        $("#toc_column").removeClass('inline');

        // Update the width of the guide_column to accomodate the larger space when the browser is in 3 column view.
        $("#guide_column").addClass('expanded');
    });

    $("#toc_container a").on('click', function(event) {
        var id = this.hash.substring(1);
        updateTOCHighlighting(id);
        handleFloatingTableOfContent();
    });

});