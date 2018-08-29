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
var threeColumnBreakpoint = 1440;

function inSingleColumnView(){
    return(window.innerWidth <= twoColumnBreakpoint);
}

function inMobile(){
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// Handle sticky header in IE, because IE doesn't support position: sticky
function handleStickyHeader() {
    if (!inSingleColumnView()) {
        var userAgent = window.navigator.userAgent;
        if(userAgent.indexOf('MSIE') > 0 || userAgent.indexOf('Trident/') > 0){
            var header = $('header');
            var currentTopPosition = $(window).scrollTop();
            var headerHeight = header.height();
            if(currentTopPosition < headerHeight){
                // Remove fixed header
                header.removeClass('IEStickyHeader');
            } else{
                // Make header fixed to top
                header.addClass('IEStickyHeader');
            }
        }
    }
}

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
    if (window.innerWidth > twoColumnBreakpoint) {
        var viewportHeight = window.innerHeight;
        var headerHeight = $('header').height();
        var sectionTitleHeight = $("#guide_content h2").first().height();
        var newSectionHeight = viewportHeight - headerHeight - sectionTitleHeight;
        $('.sect1:not(#guide_meta):not(#related-guides)').css({
                'min-height': newSectionHeight + 'px'
        });
        if(window.innerWidth >= threeColumnBreakpoint){
            // In three column view set the width of the #guide_column appropriately.
            if ($("#toc_column").hasClass('in') || $("#toc_column").hasClass('inline')) {
                // TOC is expanded.  Adjust #guide_column width to account for TOC column.
                $("#guide_column").removeClass('expanded');
            } else {
                // TOC is closed.  Maximize width of #guide_column.
                $("#guide_column").addClass('expanded');
            }
        }
    }
    // Use initial height for single column view / mobile
    else {
            $('.sect1:not(#guide_meta):not(#related-guides)').css({
                'min-height': 'initial'
        });
    }
}

function handleFloatingCodeColumn() {
    if(window.innerWidth > twoColumnBreakpoint) {
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
/**
 * Find the section that is most visible in the viewport and return the id.
 * Returns "" (empty string, not NULL) if the window scrollTop is within the
 * guide's meta.
 */
function getScrolledVisibleSectionID() {
    var id = null;
    var maxVisibleSectionHeight = 0;

    // Multipane view
    if (window.innerWidth > twoColumnBreakpoint) {
        // Look for any sect1 that has a sect2 subsection, where the sect1 is at the top of the page
        var sect1s = $('.sect1:not(#guide_meta):not(#related-guides):has(.sect2)');
        var sections = $('.sect1:not(#guide_meta):not(#related-guides), .sect2');
        var navHeight = $('.navbar').height();
        var topBorder = $("#guide_meta").height() - navHeight;  // Border point between
                                                                  // guide meta and 1st section
        if ($(window).scrollTop() < topBorder) {
            // scroll is within guide meta.
            id = "";
        } else {
            // Determine which section has the majority of the vertical height on 
            // the page.
            sect1s.each(function(){
                var elem = $(this);
                var navHeight = $('.navbar').height();
                var elemHeader = elem.find('h2').first();
                var elemHeaderHeight = elemHeader.height();
                var elemHeaderTop = elemHeader.offset().top - navHeight;

                
                var scrollTop = $(window).scrollTop();
                // var rect = elem[0].getBoundingClientRect();
                // var sect2 = elem.find('.sect2')[0]; // Find the first sect2 to calculate the distance from the top.
                // var sect2Top = sect2.getBoundingClientRect().top;                
                // var top = rect.top - navHeight;

                if(scrollTop >= elemHeaderTop && scrollTop <= (elemHeaderTop + elemHeaderHeight)){
                    // Section is at the top of the page
                    id = elemHeader[0].id;
                    return false; // Break out of the loop.
                }
            });

            if(id){
                // Return the section id that contains subsections if it is displayed at the top.
                return id;
            }

            // Find the height of each section that has no subsections and the height of subsections and return the max.
            sections.each(function() {
                var elem = $(this);
                var windowHeight = $(window).height();

                var elemHeight = elem.outerHeight();
                var rect = elem[0].getBoundingClientRect();
                var top = rect.top;
                var bottom = rect.bottom;
                if (elem.find('.sect2').length > 0) {
                    // Section contains a subsection.  It's height should end
                    // where the subsection begins.
                    var sect2s = elem.find('.sect2');
                    bottom = sect2s[0].getBoundingClientRect().top;
                    elemHeight = bottom - top;
                } 

                var visibleElemHeight = 0;
                if(top > 0){
                     // Top of element is below the top of the viewport
                     // Calculate the visible element height as the min of the whole element (if the whole element is in the viewport) and the top of the element to the bottom of the window (if only part of the element is visible and extends beyond the bottom of the viewport).
                     visibleElemHeight = Math.min(elemHeight, windowHeight - top);
                }
                else {
                    // Top of element is at or above the top of the viewport
                    // Calculate the visible element height as the min between the bottom (if the element starts above the viewport and ends before the bottom of the viewport) or the windowHeight(the element extends beyond the top and bottom of viewport in both diretions).
                    visibleElemHeight = Math.min(bottom, windowHeight);
                }
                if(visibleElemHeight > maxVisibleSectionHeight){
                    maxVisibleSectionHeight = visibleElemHeight;
                    id = elem.children('h2, h3')[0].id;
                }
            });
        }
    }
    return id;
}

// Copy over content that should be shown in a different section than where it
// is generated.
function createEndOfGuideContent(){
    var leftSide = $("#end_of_guide_left_section");
    var rightSide = $("#end_of_guide_right_section");
    var whatYouLearned = $("#great-work-you-re-done, #great-work-youre-done").siblings().find('p').clone();
    leftSide.prepend(whatYouLearned);
    $("#great-work-you-re-done, #great-work-youre-done").parent().remove(); // Remove section from the main guide column.
    $("#toc_container a[href='#great-work-you-re-done'], #toc_container a[href='#great-work-youre-done']").parent().remove(); // Remove from TOC.
    // Concatenate the guide title and guide attribution license and append it to the end of guide.
    var guideAttributionText = $("#guide-attribution").siblings().find('p').text();
    if(guideAttributionText){
        $("#guide_attribution").text(guideAttributionText);
        $("#guide-attribution").parent().remove();
        $("#toc_container a[href='#guide-attribution']").parent().remove(); // Remove from TOC.
    }

    var relatedLinks = $("#related-links").siblings().find('p').clone();
    rightSide.append(relatedLinks);
    $("#related-links").parent().remove(); // Remove section from the main guide column.
    $("#toc_container a[href='#related-links']").parent().remove(); // Remove from TOC.
}

// Adjust the window for the sticky header.
function shiftWindow() {
    scrollBy(0, -100);
}

/**
 * Performs smooth scrolling to the section associated with the provided hash.
 * Returns 'true' if the hash was valid for the doc; false otherwise.  If the
 * hash is not valid, defaultToFirstPage() is called to scroll to the top of
 * the guide.
 *
 * @param String hash   The provided hash should begin with "#" as returned
 *                      from window.location.
 */
function accessContentsFromHash(hash) {
    var $focusSection = $(hash);    
    
    // If section is found, scroll to it
    if ($focusSection.length > 0) {        
        // Update the TOC
        updateTOCHighlighting(hash.substring(1));  // Remove the '#' in the hash
        var scrollSpot = $focusSection.offset().top;
        // Implement smooth scrolling to the section's header.
        if (inSingleColumnView()) {
            // Single-column View
            // The TOC is a band across the page which is fixed to the top of 
            // the page when viewing sections beneath it.
            // Bring the section requested right up underneath this floating TOC.
            var $accordion = $('#mobile_toc_accordion_container');
            scrollSpot -= $accordion.height();
        } else {
            // Multi-column View
            // Account for the sticky header. Display the targeted section below it.
            var stickyHeaderAdjustment = $('.container-fluid').height() || 0;
            scrollSpot -= stickyHeaderAdjustment;
        }
        $("body").data('scrolling', true); // Prevent the default window scroll from triggering until the animation is done.
        $("html, body").first().animate({scrollTop: scrollSpot}, 400, function() {            
            // Callback after animation.  Change the focus.
            $focusSection.focus();            
            // Check if the section was actually focused
            if ($focusSection.is(":focus")) {
                return false;
            } else {
                // Add a tabindex to section header since they aren't focusable.
                // tabindex = -1 means that the element should be focusable,
                // but not via sequential keyboard navigation.
                $focusSection.attr('tabindex', '-1');
                $focusSection.focus();                
            }    
            $("body").data('scrolling', false);   // Allow the default window scroll listener to process scrolls again.
        });
    } else {
        defaultToFirstPage();
    }
}

/**
 * Resets the guide to the top.
 */
function defaultToFirstPage() {
    $("html, body").scrollTop(0);

    // Remove highlighted TOC element
    $('.liSelected').removeClass('liSelected');

    // Reset the hash in the URL
    var currentPath = window.location.pathname;
    var newPath = currentPath.substring(currentPath.lastIndexOf('/')+1);
    // We already scrolled to the top of the guide.  history.pushState allows
    // us to set the URL without invoking immediate scrolling.
    history.pushState(null, null, newPath);
}


$(document).ready(function() {
    function handleDownArrow() {
        if (window.innerWidth <= twoColumnBreakpoint) {
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
            $("#feedback_ratings img").not($(this)).css('opacity', '.30');
            $(this).css('opacity', '1');
        });
    }

    $("#feedback_ratings img").hover (function(event) {
      $("#feedback_ratings img").not($(this)).css('opacity', '.50');
      $(this).css('opacity', '1');
    });

    $(window).on('resize', function(){
        handleFloatingTableOfContent(); // Handle table of content view changes.
        handleFloatingTOCAccordion();
        handleDownArrow();
        resizeGuideSections();
        handleFloatingCodeColumn();
    });

    $(window).on('scroll', function(event) {
        handleFloatingTOCAccordion();
        handleDownArrow();
        handleStickyHeader();
        handleFloatingTableOfContent();
        handleFloatingCodeColumn();
    });

    window.addEventListener("hashchange", function(e){
        e.preventDefault();

        var hash = location.hash;
        accessContentsFromHash(hash);
        // Note: Scrolling to the new content will cause the onScroll method
        //       above to be invoked.
    });

    $(window).on('load', function(){
        handleFloatingTableOfContent();
        addGuideRatingsListener();
        handleFloatingCodeColumn(); // Must be called last to calculate how tall the code column is.
    });
});
