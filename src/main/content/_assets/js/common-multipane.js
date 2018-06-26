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
// The background is shortened by 200px
var backgroundSizeAdjustment = 200;
var twoColumnBreakpoint = 1170;

function heightOfVisibleBackground() {
    var result;
    if(isBackgroundBottomVisible()) {
        var scrollTop = $(window).scrollTop();
        result = getBackgroundAbsoluteBottomPosition() - scrollTop;
    } else {
        // Assume the background is filling up the entire viewport
        result = $(window).height();
    }
    return result;
}

// Get the absolute position of the bottom of the dark background regardless
// of whether the bottom is in the browser's viewport
function getBackgroundAbsoluteBottomPosition() {
    var background = $('#background_container'),
    elementTop = background.offset().top,
    elementBottomPosition = elementTop + (background.outerHeight() - backgroundSizeAdjustment);
    return elementBottomPosition;
}

// Determine if the bottom of the visible dark background is now visible
// in the browser's viewport.
function isBackgroundBottomVisible() {
    var background = $('#background_container'),
        currentTopPosition = $(window).scrollTop(),
        currentBottomPosition = currentTopPosition + $(window).height(),
        elementBottomPosition = getBackgroundAbsoluteBottomPosition(),
        visibleBottom = currentBottomPosition > elementBottomPosition;
    return visibleBottom;
}

// Resize the guide sections so that there is clear separation between each
// section and the code column transitions better by making the section height
// in two and three column view at least as tall as the viewport.
function resizeGuideSections() {
        // Two column view or three column view.
    if ($(window).width() > twoColumnBreakpoint) {
        var viewportHeight = window.innerHeight;
        var headerHeight = $('header').height();
        var sectionTitleHeight = $("#guide_content h2").first().height();
        var newSectionHeight = viewportHeight - headerHeight - (2 * sectionTitleHeight);
        $('.sect1:not(#guide_meta):not(#related-guides)').css({
                'min-height': newSectionHeight + 'px'
        });
    }
    // Use initial height for single column view / mobile
    else {
            $('.sect1:not(#guide_meta):not(#related-guides)').css({
                'min-height': 'initial'
        });
    }
}
    
function handleFloatingCodeColumn() {
    if($(window).width() > twoColumnBreakpoint) {
        // CURRENTLY IN DESKTOP VIEW
        if(isBackgroundBottomVisible()) {
            // Set the bottom of the code column to the distance between the top of the end of guide section and the bottom of the page.
            var windowHeight = window.innerHeight;
            var relatedGuidesTopPosition = $("#end_of_guide")[0].getBoundingClientRect().top;
            if(relatedGuidesTopPosition){
                var bottom = windowHeight - relatedGuidesTopPosition;
                $("#code_column").css('bottom', bottom + 'px');
            } else {
                $("#code_column").css('bottom', 'auto');
            }
        } else {
            // The entire viewport is filled with the code column
            $("#code_column").css('bottom', '0');
        }
    }
}

function getScrolledVisibleSectionID(event) {
    var origEvent = event.originalEvent;
    var dir = (origEvent.deltaY) < 0 ? 'up' : 'down';
    var id = null;

    // Multipane view
    if ($(window).width() > twoColumnBreakpoint) {
        var sections = $('.sect1:not(#guide_meta):not(#related-guides) > h2');
        sections.each(function(index) {
            var elem = sections.get(index);
            var rect = elem.getBoundingClientRect();
            var elemTop = rect.top - 100; // Offset by the sticky header's height
            var elemBottom = rect.bottom;
            // Check if the next section in the direction the user is scrolling shows up
            var isVisible;
            if (dir === 'down') {
                // Element top is visible and bottom is not visible
                isVisible = elemTop < window.innerHeight && elemBottom >= window.innerHeight;
            } else if (dir === 'up') {
                isVisible = elemBottom >= 0 && elemBottom < window.innerHeight;
            }
            if (isVisible) {
                id = this.id;
                return false;    // Break out of loop
            }
        });
    }
    return id;
}

// Copy over content that should be shown in a different section than where it
// is generated.
function createEndOfGuideContent(){
    var leftSide = $("#end_of_guide_left_section");
    var rightSide = $("#end_of_guide_right_section");
    var whatYouLearned = $("#great-work-you-re-done").siblings().find('p').clone();
    leftSide.prepend(whatYouLearned);
    $("#great-work-you-re-done").parent().remove(); // Remove section from the main guide column.
    $("#toc_container a[href='#great-work-you-re-done'], #toc_container a[href='#great-work-youre-done']").parent().remove(); // Remove from TOC.
    var relatedLinks = $("#related-links").siblings().find('p').clone();
    rightSide.append(relatedLinks);
    $("#related-links").parent().remove(); // Remove section from the main guide column.
    $("#toc_container a[href='#related-links']").parent().remove(); // Remove from TOC.
}


$(document).ready(function() {
    function handleDownArrow() {
        if ($(window).width() < 1171) {
            $("#down_arrow").hide();
            return;
        }
        var atTop = $(window).scrollTop() === 0;
        atTop ? $("#down_arrow").fadeIn() : $("#down_arrow").fadeOut();
    }
        
    function addGuideRatingsListener(){
        $("#feedback_ratings img").on('click', function(event){
            var rating = $(this).data('guide-rating');
            // Send rating to google analytics
            // The first parameter '1' is the slot for the custom variable
            // The last parameter '3' is opt_scope is which is page level storage
            if(typeof ga === "function"){
                ga(1, "Guide Review", rating, 3);
            }
            $("#feedback_ratings img").not($(this)).css('opacity', '.25');
            $(this).css('opacity', '1');
        });
    }

    // Adjust the window for the sticky header when requesting a specific section.
    function shiftWindow() {
        scrollBy(0, -100);
    }

    if (location.hash){
        shiftWindow();
        handleFloatingTableOfContent();
        var id = location.hash.substring(1);
        updateTOCHighlighting(id);
    }

    window.addEventListener("hashchange", function(){
        shiftWindow();
        var id = location.hash.substring(1);
        updateTOCHighlighting(id);
    });

    $(window).on('resize', function(){
        handleFloatingTableOfContent(); // Handle table of content view changes.
        handleDownArrow();
        resizeGuideSections();
        handleFloatingCodeColumn();
    });

    $(window).on('scroll', function(event) {
        handleDownArrow();
        handleFloatingTableOfContent(); 
        handleFloatingCodeColumn();
    });

    $(window).on('load', function(){
        handleFloatingTableOfContent();
        addGuideRatingsListener();
        handleFloatingCodeColumn(); // Must be called last to calculate how tall the code column is.
    });
});