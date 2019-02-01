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
function onAppleDevice(){
    return (/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
}
function onIE(){
    return (/(MSIE|Trident\/|Edge\/)/i.test(navigator.userAgent));
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
                if (prevSection.offset() !== undefined) {
                    scrollPosition = prevSection.offset().top - windowHeight + prevSectionHeight;
                }
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
    whatYouLearned.attr('tabindex', '0');
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

    // Create anchor to the end of the guide
    var li = $("<li></li>");
    var a = $("<a></a>");
    var end_of_guide_title = $('#end_of_guide > h2').first().text();
    a.attr('href', '#end_of_guide');    
    a.text(end_of_guide_title);
    li.append(a);
    $("#toc_container > ul").append(li);
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
 * @param callback      Optional callback to execute after the window has animated to the new section. This can be used to focus a specific element on the new section.
 */
function accessContentsFromHash(hash, callback) {
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
        $("html, body").animate({scrollTop: scrollSpot}, 400, function() {
            // Callback after animation.  Change the focus.
            $focusSection.focus();
            $("body").data('scrolling', false);   // Allow the default window scroll listener to process scrolls again.
            // Check if the section was actually focused
            if ($focusSection.is(":focus")) {
                if(callback){
                    callback();
                }
                return false;
            } else {
                // Add a tabindex to section header since they aren't focusable.
                // tabindex = -1 means that the element should be focusable,
                // but not via sequential keyboard navigation.
                $focusSection.attr('tabindex', '-1');
                $focusSection.focus();
                if(callback){
                    callback();
                }
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
        resizeGuideSections();
        handleFloatingCodeColumn();
    });

    // Check if on Apple device or Internet Explorer/Edge before enabling inertia scrolling since it doesn't work well.
    if(!onAppleDevice() && !onIE()){
        $(window).on('mousewheel DOMMouseScroll', function(event){
            checkForInertialScrolling(event);
        });
    }

    $(window).on('scroll', function() {
        handleFloatingTOCAccordion();
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

    // Handle tabbing from inside the guide column
    function getGuideColumnFocusElement(elementWithFocus, shiftIsPressed){
        var elemToFocus;
        // Get list of all tabbable elements under the current step
        var tabbableElements = elementWithFocus.closest('.sect1').find('[tabindex=0], a[href], button, instruction, action').filter(':visible:not(:disabled):not(.unavailable)');
        var firstTabbable = tabbableElements.first();
        var lastTabbable = tabbableElements.last();
        if(shiftIsPressed){
            // Shift tab from the guide column
            // Check if on the first tabbable element or there are no tabbable elements
            if(elementWithFocus[0] === firstTabbable[0] || tabbableElements.length === 0){
                // Trigger loading the previous step and go to the code column
                var prevStepHash = $('#toc_container .liSelected').prev().children().attr('href'); // Get the next step's toc hash
                if(prevStepHash){
                    if(inSingleColumnView()){
                        // Focus the previous guide section's last element
                        var step = $(prevStepHash);
                        elemToFocus = step.closest('.sect1').find('[tabindex=0], a[href], button, instruction, action').filter(':visible:not(:disabled):not(.unavailable)').last();
                        if(elemToFocus.length === 0){
                            // If no tabbable elements are found within the step, tab to the step.
                            elemToFocus = step;
                        }
                    }
                    else {
                        accessContentsFromHash(prevStepHash, function(){
                            $("#code_column").find('[tabindex=0], a[href], button, instruction, action').filter(':visible:not(:disabled)').last().focus();
                        });
                    }
                }
                else {
                    // On the first actual guide step. Send focus to the guide meta section.
                    if (inSingleColumnView()){
                      //In single column view, the TOC hamburger button is in between the first guide step and guide_meta section
                      $('.breadcrumb_hamburger toc-toggle collapsed').focus();
                    } else {
                      elemToFocus = $('#guide_meta');
                    }
                }
            }
        }
        else {
            // Regular tab from the guide column
            // If the focused element is not the last tabbable, then we will return nothing so the next default element to tab to will not be overriden.
            if (elementWithFocus[0] === lastTabbable[0] || tabbableElements.length === 0) {
                if(inSingleColumnView()){
                    var nextStepHash = $('#toc_container .liSelected').next().children().attr('href');
                    if (nextStepHash) {
                        // Load the next step
                        accessContentsFromHash(nextStepHash, function(){
                            $(nextStepHash).focus();
                        });
                    } else{
                        // The very first time you visit the guide and nothing is selected in the TOC, tab to the first step.
                        if($('#toc_container .liSelected').length === 0){
                            var firstStepHash = $('#toc_container li').first().children().attr('href');
                            accessContentsFromHash(firstStepHash);
                        }
                    }
                }
                else{
                    // If tabbing away from the last tabbable element in the section or there are no tabbable elements in the guide section, focus on the code column
                    elemToFocus = $('#code_column');
                }
            }
        }

        return elemToFocus;
    }


    // Handle tabbing from inside the code column
    function getCodeColumnFocusElement(elementWithFocus, shiftIsPressed) {
        var elemToFocus;
        var tabbableElements = $("#code_column").find('[tabindex=0], a[href], button, instruction, action').filter(':visible:not(:disabled)'); // Get list of all tabbable elements under current step widgets.
        var lastTabbable = tabbableElements.last();
        if(shiftIsPressed){
            // Shift tab from the code column
            if(elementWithFocus[0] === $("#code_column")[0]){
                var thisStepHash = $('#toc_container .liSelected').children().attr('href'); // Get the next step's toc hash
                if(thisStepHash){
                    var step = $(thisStepHash);
                    elemToFocus = step.closest('.sect1').find('[tabindex=0], a[href], button, instruction, action').filter(':visible:not(:disabled):not(.unavailable)').last();
                    if(elemToFocus.length === 0){
                        // If no tabbable elements are found within the step, tab to the step.
                        // Check if the step is on the screen to focus it. If it isn't on the screen, it needs to be scrolled to.
                        var pageTop = window.scrollY;
                        var headerHeight = $('nav').height();
                        var pageOffset = Math.round(pageTop + headerHeight);
                        var stepOffset = Math.round(step.offset().top);
                        if(stepOffset > pageOffset){
                            elemToFocus = step;
                        }
                        else {
                            accessContentsFromHash(thisStepHash);
                        }
                    }
                }
                else {
                    // If there are no previous steps, focus the guide meta.
                    elemToFocus = $('#guide_meta');
                }
            }
        }
        else {
            // Regular tab from the code column
            if(elementWithFocus[0] === lastTabbable[0]) { // If you're tabbing away from the last tabbable element in the widgets, focus needs to go back to the next step content
                var nextStepHash = $('#toc_container .liSelected').next().children().attr('href'); //get the next step's toc hash
                var nextStepID = null;

                if (nextStepHash) {
                    // Load the next step
                    accessContentsFromHash(nextStepHash, function(){
                        $(nextStepHash).focus();
                    });
                } else {
                    // The very first time you visit the guide and nothing is selected in the TOC, tab to the first step.
                    if($('#toc_container .liSelected').length === 0){
                        var firstStepHash = $('#toc_container li').first().children().attr('href');
                        accessContentsFromHash(firstStepHash);
                    }
                    // On the last step's code column, tab to the end of guide
                    else if($('#toc_container li').last().hasClass('liSelected')){
                        $('#end_of_guide_left_section').focus();
                    }
                }

                if(nextStepID){
                    var nextTabbableElement = $(nextStepID).find('[tabindex=0], a[href], button, instruction, action').filter(':visible:not(:disabled)').first(); // Get the next tabbable element from the next step content section
                    elemToFocus = nextTabbableElement;
                }
            }
        }
        return elemToFocus;
    }

    // Handle manual tabbing order through the guide. The tabbing order is: header, breadcrumb, table of contents, #guide_meta, github popup if present, first guide section, through all of the guide section's tabbable elements, to the respective code on the right for that given guide section, through all of its tabbable elements, etc. until the last guide section and code are tabbed through, then to the end of guide section. Shift + tab goes in the reverse order.
    $(window).on('keydown', function(e) {
      if($("body").data('scrolling') === true){
         e.preventDefault();
         e.stopPropagation();
         return;
      }
      var code = e.keyCode || e.which;
      var shiftIsPressed = e.shiftKey;
      var elemToFocus;

      // Tab key
      if (code === 9) {
        var elementWithFocus = $(document.activeElement);
        if (elementWithFocus[0] == $("#guide_column")[0] || elementWithFocus.parents('#guide_column').length > 0) {
            if (elementWithFocus.attr('id') === 'guide_meta') {
                // Tabbing from the initial section before the guide starts
                if(shiftIsPressed) {
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
                    // The intro step doesn't have elements you can tab to go straight to code_column
                    if(!inSingleColumnView()){
                        // Do not prevent the default tab behavior in single column view.
                        elemToFocus = $('#code_column');
                    }
                }
            }
            else {
                elemToFocus = getGuideColumnFocusElement(elementWithFocus, shiftIsPressed);
            }
        }
        // Handle tabbing from code column
        else if (elementWithFocus[0] == $("#code_column")[0] || elementWithFocus.parents('#code_column').length > 0) {
            elemToFocus = getCodeColumnFocusElement(elementWithFocus, shiftIsPressed);
        }

        if(elemToFocus && elemToFocus.length > 0){
            // Only stop the default tab/shift+tab behavior if we found a custom element to override the default behavior to tab to.
            e.preventDefault();
            elemToFocus.focus();
        }
      }
    });
});
