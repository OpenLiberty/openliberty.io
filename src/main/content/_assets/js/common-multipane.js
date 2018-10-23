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

/* Detect if the user has scrolled downwards into a new section and apply inertial resistence. */
function checkForInertialScrolling (event){
    if(inSingleColumnView()){
        return;
    }
    var origEvent = event.originalEvent;
    var windowHeight = $(window).height();
    var navbarHeight = $("nav").height();
    var scrollPosition;

    var dir;
    if(origEvent.deltaY){
        dir = (origEvent.deltaY) > 0 ? 'down' : 'up';
    } else if(origEvent.detail){
        // Firefox
        dir = (origEvent.detail) > 0 ? 'down' : 'up';
    }
    if(!dir){
        console.log('Scroll direction was not determined.');
    }

    var section_headers = $('.sect1:not(#guide_meta) h2');
    section_headers.each(function(index) {
        var elem = $(section_headers.get(index));
        var rect = elem[0].getBoundingClientRect();
        var top = rect.top;
        var bottom = rect.bottom;

        // If scrolling down, check if the section header is coming into view
        if(dir == 'down'){
            if(top > 0 && top < windowHeight && bottom > (windowHeight - 200) && bottom < windowHeight){
                // Section header is fully in view with the bottom in the last 200 pixels of the viewport.
                // Snap to the top of the element.
                scrollPosition = elem.offset().top - navbarHeight;
                return false;
            }
        } else {
            // Scrolling up
            // Check to see that the current section's top is in viewport and at least 200 pixels from the top of the screen but not more than 400.
            // Scroll up by a full page's height so that the previous section ends at the bottom of the viewport for optimal reading.
            if(top > 200 && top < 400){
                var prevSection = elem.parents('.sect1').prev();
                var prevSectionHeight = prevSection.height();
                scrollPosition = prevSection.offset().top - windowHeight + prevSectionHeight;
                return false;
            }
        }
    });
    if(scrollPosition){
        event.preventDefault();
        event.stopPropagation();
        // Snap to the top of the previous section so the user can read the last part of it.
        $('html').stop().animate({
            scrollTop: scrollPosition
        }, 500);
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
    var topBorder = 0;
    var scrollTop = $(window).scrollTop();

    if (window.innerWidth > twoColumnBreakpoint) {
        // multi-column view - header is constant and guide scrolls
        //                     beneath it.
        topBorder = $('#guide_meta').outerHeight(true); // Border point between
                                                        // guide meta and 1st section
    } else {
        // single-column view - header and guide meta scroll away.
        //                      TOC anchors to top of page at $('.scroller_anchor).
        topBorder = $('.scroller_anchor').offset().top;
    }

    if (scrollTop <= topBorder) {
        // scroll is within guide meta.
        id = "";
    } else {
        var sections = $('.sect1:not(#guide_meta):not(#related-guides), .sect2');

        if (window.innerWidth > twoColumnBreakpoint) {
            // multi-column view -
            // Determine which section has the majority of the vertical height
            // of the page.
            sections.each(function(index) {
                var elem = $(sections.get(index));
                var windowHeight = $(window).height();

                var elemHeight = elem.outerHeight();
                var rect = elem[0].getBoundingClientRect();
                var top = rect.top;
                var bottom = rect.bottom;

                var $sect2s = elem.find('.sect2');
                if ($sect2s.length > 0) {
                    // Section contains a subsection.  The section's height
                    // really ends where the subsection begins.
                    bottom = $sect2s[0].getBoundingClientRect().top;
                    elemHeight = bottom - top;
                }

                var visibleElemHeight = 0;
                if(top > 0){
                    // Top of element is below the top of the viewport

                    if (top < ($('header').height() + 1)) {
                        // We have a header at the very top of the page.
                        // Return this as the ID.  This helps small sections
                        // that never take up the vertical majority of the
                        // window to be identified as the main element.
                        id =  elem.children('h2, h3')[0].id;
                        return false;  // Leave the loop
                    } else {
                        // Calculate the visible element height as the min of the
                        // whole element (if the whole element is in the viewport)
                        // and the top of the element to the bottom of the window
                        // (if only part of the element is visible and extends beyond
                        // the bottom of the viewport).
                        visibleElemHeight = Math.min(elemHeight, windowHeight - top);
                    }
                }
                else {
                    // Top of element is at or above the top of the viewport
                    // Calculate the visible element height as the min between
                    // the bottom (if the element starts above the viewport and
                    // ends before the bottom of the viewport) or the windowHeight
                    // (the element extends beyond the top and bottom of viewport
                    // in both diretions).
                    visibleElemHeight = Math.min(bottom, windowHeight);
                }
                if(visibleElemHeight > maxVisibleSectionHeight){
                    maxVisibleSectionHeight = visibleElemHeight;
                    id = elem.children('h2, h3')[0].id;
                }
            });

        } else {
            // single-column view -
            // Determine the section that most recently passed under the
            // TOC header.
            var TOC_height = $('#mobile_toc_accordion_container').outerHeight(true);
            sections.each(function(index) {
                var $element = $(sections.get(index));
                var sectionTop = $element.offset().top - TOC_height;
                var sectionBottom = 0;
                var sect2s = $element.find('.sect2');
                if (sect2s.length > 0) {
                    // If section contains subsections, measure the height of
                    // the section as only to the top of the <h3> subsection.
                    sectionBottom = $(sect2s[0]).offset().top - TOC_height;
                } else {
                    // Section does not contain subsections so height is as expected.
                    sectionBottom = sectionTop + $element.outerHeight(true);
                }


                if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
                    id = $element.children('h2, h3')[0].id;
                    return false;
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
    var guideAttributionText = $("#guide-attribution").siblings().find('p').html();
    if(guideAttributionText){
        $("#guide_attribution").html(guideAttributionText);
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
        $("html").animate({scrollTop: scrollSpot}, 400, function() {
            // Callback after animation.  Change the focus.
            $focusSection.focus();
            $("body").data('scrolling', false);   // Allow the default window scroll listener to process scrolls again.
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

    $(window).on('mousewheel DOMMouseScroll', function(event){
        checkForInertialScrolling(event);
    });

    $(window).on('scroll', function() {
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

    // Handle tabbing order
    $(window).on('keydown', function(e) {     
      var code = e.keyCode || e.which;
      var isShiftPressed = e.shiftKey;
      var elemToFocus;

      // Tab key
      if (code === 9) {
        var elementWithFocus = $(document.activeElement);
        var tabbableElements, firstTabbable, lastTabbable;

        if (elementWithFocus.parents('.sect1').length > 0) { 
            // Tabbing from the guide column
            tabbableElements = elementWithFocus.closest('.stepWidgetContainer').find('[tabindex=0], a[href], button, instruction, action'); //get list of all tabbable elements under current step widgets
            firstTabbable = tabbableElements.first();
            lastTabbable = tabbableElements.last();
            
          if (elementWithFocus[0] === lastTabbable[0]) {
            elemToFocus = $('#code_column'); //if you're tabbing away from the last tabbable element in the section, focus on the code column
          }
        } 
        else if (elementWithFocus.parents('#code_column').length > 0) {
            // Tabbing from the code column
            tabbableElements = $("#code_column").find('[tabindex=0], a[href], button, instruction, action').filter(':visible'); //get list of all tabbable elements under current step widgets
            firstTabbable = tabbableElements.first();
            lastTabbable = tabbableElements.last();
            if(isShiftPressed){
                if(elementWithFocus[0] === firstTabbable){
                    var prevStepHash = $('#toc_container .liSelected').prev().children().attr('href'); //get the next step's toc hash
                    var prevStepData = $('#toc_container .liSelected').prev().children().attr('data-toc'); //data-toc attribute is the same as the data-step attribute
                    

                    if(prevStepHash && prevStep){
                        accessContentsFromHash(prevStepHash.substring(1)); // Simulate a toc selection to focus on prev step
                        var prevStepID = '#' + prevStepData + '_content';
                        var prevTabbableElement = $(prevStepID).find('[tabindex=0], a[href], button, instruction, action').last();
                    } 
                    else {
                        // If there are no previous steps, focus the guide meta.
                        $('#guide_meta').focus();
                    }
                }
            }
            else {
                if(elementWithFocus[0] === lastTabbable[0]) { // If you're tabbing away from the last tabbable element in the widgets, focus needs to go back to the next step content
                    var nextStepHash = $('#toc_container .liSelected').next().children().attr('href'); //get the next step's toc hash
                    var nextStepData = $('#toc_container .liSelected').next().children().attr('data-toc'); //data-toc attribute is the same as the data-step attribute
                    var nextStepID = null;

                    if (nextStepHash && nextStep) {
                        accessContentsFromHash(nextStepHash.substring(1)); // Simulate a toc selection to focus on next step
                        nextStepID = '#' + nextStepData + '_content'; // Need next step's ID to focus on first description div
                    } else {
                        //TODO: may not need this if it's decided that we shouldn't tab to the widgets are disabled on the intro steps
                        //TODO: this only deals with the case at the beginning of the guide. What happens when you're at the last element of the TOC?
                        //This is for the very first time you visit the guide and nothing is selected in the TOC
                        accessContentsFromHash('#what-you-ll-learn');
                        nextStepID = '#Intro_content';
                    }

                    var nextTabbableElement = $(nextStepID).find('[tabindex=0], a[href], button, instruction, action').first(); //get the next tabbable element from the next step content section
                    elemToFocus = nextTabbableElement;
                }
            }            

        } else if (elementWithFocus.attr('id') === 'guide_meta') {
            if(isShiftPressed) {
                // Go to the table of contents if visible
                if($('#tags_container:visible').length > 0){
                    elemToFocus = $('#tags_container a').last();
                }
                // Else go to the breadcrumb
                else {
                    elemToFocus = $('#breadcrumb_row a').last();
                }
            }
            else {
                //the intro step doesn't have elements you can tab to go straight to code_column
                elemToFocus = $('#code_column');
            }
          
        }

        if(elemToFocus){
            // Only stop the default tab/shift+tab behavior if we found a custom element to override the default behavior to tab to.
            e.preventDefault();
            elemToFocus.focus();
        }
      }

      //TODO: need to do the equivalent for shift + tab (code === ). The calls to next() would be prev() and the calls to last() or first() would be the opposite
    });
});
