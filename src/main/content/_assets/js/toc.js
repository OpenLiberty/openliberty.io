/*******************************************************************************
 * Copyright (c) 2018, 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

// make TOC indicator fixed once nav bar scrolls off screen
$(window).on('scroll', function(event) {
    $.fn.isInViewport = function () {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
    
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
    
        return elementBottom > viewportTop && elementTop < viewportBottom;
    };
    var nav_bottom = $('#nav_bar').outerHeight(true);
    if ($(this).scrollTop() > nav_bottom){
        if($("#deprecated_notification").length){
            $('#toc_indicator').css({'position': 'fixed', 'top': $("#deprecated_notification").outerHeight()+'px'});
        } else {
            $('#toc_indicator').css({'position': 'fixed', 'top': '0px'});
        }

        if (window.innerWidth < 1440) {
            $('#toc_column').css({'position': 'fixed', 'top': '0px'});
        }

        if(!($("#end_of_guide").isInViewport())){
            $('#toc_line').css({
                "position": "absolute",
                "top": "0px",
                "height": calculateTOCHeight()
            })
        }
    }
});

// Keep the table of contents (TOC) in view while scrolling (Desktop only)
function handleFloatingTableOfContent() {
    if (window.innerWidth >= threeColumnBreakpoint) {
        // CURRENTLY IN 3 COLUMN VIEW
        // The top of the TOC is scrolling off the screen, enable floating TOC.
        if(isBackgroundBottomVisible()) {
            handleTOCScrolling();
            shrinkTOCIndicator();
        } else {
            // The entire viewport is filled with the background, so
            // do not need to worry about the TOC flowing out of the background.
            expandTOCIndicator();
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

function calculateTOCHeight(){
    var endOfGuidePosition = $("#end_of_guide").offset().top;
    return endOfGuidePosition;
}

function shrinkTOCIndicator() {
    $('#toc_line').css({
        "position": "",
        "top": "0px",
        "height": calculateTOCHeight()
    });
}

function expandTOCIndicator() {
    $('#toc_line').css({
        "position":"fixed",
        "top":"0px",
        "height": calculateTOCHeight()
    });
}

// Remove previous TOC section highlighted and highlight correct step
function updateTOCHighlighting(id) {
    $('.liSelected').removeClass('liSelected');
    var anchor = $("#toc_container a[href='#" + id + "']");
    anchor.parent().addClass('liSelected');
    var targetElm = document.querySelector('.liSelected');
    if (targetElm) {
        targetElm.scrollIntoView();
    }
}

// Handle when the table of content (TOC) is too small to fit completely in the dark background.
// We want to give the end result of the bottom of the TOC sticks to the bottom of the dark background
// and the top of the TOC scrolls off screen.
function handleTOCScrolling() {
    var visible_background_height = heightOfVisibleBackground();
    var toc_height = $('#toc_inner').height();
    if (toc_height > visible_background_height && window.innerWidth >= threeColumnBreakpoint) {
        // The TOC cannot fit in the dark background, allow the TOC to scroll out of viewport
        // to avoid the TOC overflowing out of the dark background
        var negativeNumber = visible_background_height - toc_height + 100;
        $('#toc_inner').css({"position": "fixed", "top": negativeNumber});
    }
}

function handleFloatingTOCAccordion() {
    var accordion = $('#mobile_toc_accordion_container');

    var enableFloatingTOCAccordion = function(){
        // Put the TOC accordion back into the page and remove the
        // scroller_anchor <div>.
        accordion.removeClass('fixed_toc_accordion');
        $('.scroller_anchor').css('height', 0);
        // Restore toc location.
    };
    var disableFloatingTOCAccordion = function(){
        // Change the height of the scroller_anchor to that of the accordion
        // so there is no change in the overall height of the page.
        // Otherwise, when you fix the accordion to the top of the page the
        // overall document height is lessened by the accordion's height
        // which causes a bounce in the page.
        $('.scroller_anchor').css('height', accordion.height());
        // Fix the TOC accordion to the top of the page.
        accordion.addClass('fixed_toc_accordion');
    };

    if(inSingleColumnView()){
        // Get the accordion start location.  It is the same as
        // scroller_anchor, a <div> that initially has a height of 0.
        var scroller_anchor = $(".scroller_anchor").offset().top;
        // Check if user has scrolled and the current scroll position is below
        // where the scroller_anchor starts and the accordion has not yet been
        // fixed to the top of the page.
        if ($(this).scrollTop() >= scroller_anchor && accordion.css('position') !== 'fixed') {
            disableFloatingTOCAccordion();
        } else if ($(this).scrollTop() < scroller_anchor && accordion.css('position') !== 'relative') {
            // When the user scrolls back up past the scroller_anchor, put the
            // accordion back into the page and remove the scroller_anchor <div>.
            enableFloatingTOCAccordion();
        }
    }
    else {
        enableFloatingTOCAccordion();
    }
}

/**
 * onClick method for selecting a TOC entry.
 *
 * @param {*} liElement TOC entry selected
 * @param {*} event
 */
function TOCEntryClick(liElement, event) {
    // 'this' is the li element in the #toc_container.
    // Its first child is the anchor tag pointing to the id of the section to go to.
    var hash = $(liElement).find('a').prop('hash');

    // Handle our own scrolling to the appropriate section so stop event processing.
    event.preventDefault();
    event.stopPropagation();

    // Close the TOC if not in 3 column view
    if (window.innerWidth < threeColumnBreakpoint){
        $("#breadcrumb_hamburger").trigger('click');
    }

    var windowHash = window.location.hash;
    if (windowHash !== hash) {
        // Update the URL hash with where we wish to go....
        var currentPath = window.location.pathname;
        var newPath = currentPath.substring(currentPath.lastIndexOf('/')+1) + hash;
        // Not setting window.location.hash here because that causes the
        // window to scroll immediately to the section.  We want to implement
        // smooth scrolling that is adjusted to account for the sticky header.
        // So, this history.replaceState will allow us to set the URL without
        // invoking immediate scrolling.  Then we call accessContentsFromHash
        // to perform the smooth scrolling to the requested section.
        history.replaceState(null, null, newPath);
    }
    accessContentsFromHash(hash);
}

// Restructure the TOC because Asciidoc nests levels in the TOC and it affects the CSS poorly.
function reorganizeTOCElements(){
    $('#toc_column .sectlevel2').each(function(){
        var li = $(this).parent();
        var sectlevel2 = $(this).detach();
        li.after(sectlevel2);
    });
}

function restoreCurrentStep(){
    // Restore user to section they were viewing after collapsing/expanding the TOC.
    var hash = window.location.hash;
    accessContentsFromHash(hash);
}

function open_TOC(){
    if(!inSingleColumnView()){
        $("#toc_title").css('margin-top', '0px');
        if (window.innerWidth > threeColumnBreakpoint) {
            $("#toc_column").addClass('inline');
        }
        else {
            $("#toc_column").addClass('in');
            $("#close_container img").focus(); //focus on 'X'
        }
        $("#guide_column").removeClass('expanded');

        $("#toc_line").addClass("open");
        $("#toc_column").addClass("open");
        $("#guide_column").addClass("open");

        $("#toc_indicator").addClass('open hidden');

        restoreCurrentStep();
    }
}

function close_TOC(){
    $("#toc_title").css('margin-top', '20px');

    // Remove display type from the table of contents
    if (window.innerWidth > threeColumnBreakpoint) {
        $("#toc_column").removeClass('inline');
    }
    else {
        $("#toc_column").removeClass('in');
    }

    // Update the width of the guide_column to accomodate the larger space when the browser is in 3 column view.
    $("#guide_column").addClass('expanded');

    // Remove open class to transition back
    $("#toc_line").removeClass("open");
    $("#toc_column").removeClass("open");
    $("#guide_column").removeClass("open");

    // if in 3 column view and user closes TOC, show bounce animation
    if (window.innerWidth >= threeColumnBreakpoint) {
        $("#toc_indicator").removeClass('hidden');
        TocIndicatorBounce();
    }
    else {
        $("#toc_indicator").removeClass('open hidden');
    }

    restoreCurrentStep();
}

function setInitialTOCLineHeight(){
    $("#toc_line").css(
        {'height': calculateTOCHeight()}
    );
}

// start the toc_indicator bounce animation
function TocIndicatorBounce() {
    $('#toc_indicator').addClass('open');
    var toc_indicator = document.getElementById("toc_indicator");
    toc_indicator.style.WebkitAnimation = "slide-in-out 1.5s ease 0s 1"; // code for Chrome, Safari and Opera
    toc_indicator.style.animation = "slide-in-out 1.5s ease 0s 1;";     // standard syntax
}

// remove open class once animation is complete
$('body').on('animationend webkitAnimationEnd oAnimationEnd', '#toc_indicator', function () {
    $('#toc_indicator').removeClass('open');
});

$(document).ready(function() {
    if ($(this).outerWidth() >= twoColumnBreakpoint && $(this).outerWidth() <= threeColumnBreakpoint) {
        TocIndicatorBounce();
    }
    reorganizeTOCElements();
    setInitialTOCLineHeight();

    // Add listener for clicking on the
    $("#toc_hotspot, #toc_indicator").on('mouseenter', function(){
        // Animate out the arrow and highlight the left side of the screen orange to indicate there is a TOC
        if(!$("#toc_indicator").hasClass('open')){
            $("#toc_indicator").addClass('open');
        }
    });

    $("#toc_hotspot").on('mouseleave', function(){
        if($("#toc_indicator").hasClass('open')){
            var x = event.x;
            var y = event.y;
            var headerHeight = $('header').height();
            var indicatorHeight = $("#toc_indicator").outerHeight();

            y = y - headerHeight;
            if(x >= 0 && x <= this.offsetWidth && y >= 0 && y <= indicatorHeight){
                // Still hovering over the TOC indicator arrow, so don't remove the orange line and arrow.
                return;
            }

            $("#toc_indicator").removeClass('open');
        }
    });

    $("#toc_indicator").on('click', function(){
        open_TOC();
    });

    $("#toc_indicator").on("keydown", function(e){
        if(e.which === 13){
            open_TOC();
        }
    });

    $("#breadcrumb_hamburger").on('click', function(){
        // Handle resizing of the guide column when collapsing/expanding the TOC in 3 column view.
        if(window.innerWidth >= threeColumnBreakpoint){
            if ($("#toc_column").hasClass('in')) {
                // TOC is expanded
                $("#guide_column").addClass('expanded');
            }
            else {
                // TOC is closed
                $("#guide_column").removeClass('expanded');
            }
            restoreCurrentStep();
        }
        // Handle table of content floating if in the middle of the guide.
        handleFloatingTableOfContent();
    });

    //In single column view, set focus on 'X' initially when TOC is expanded
    $('#toc_column').on('shown.bs.collapse', function(){
        $("#close_container img").focus(); //focus on 'X'
    });

    //In single column view, close the TOC after tabbing from the last element in the TOC
    //and focus on the first tabbable element in the first step
    $('#tags_container').on('keydown', function(){
      if(inSingleColumnView()) {
        var tagWithFocus = $(document.activeElement);
        var lastTag = $('#tags_container').children().last();
        if (tagWithFocus.is(lastTag)) { //tabbing from the last tag in TOC
          //hide the toc
          $('#close_container').click();
        }
      }
    });

    //Hide the TOC when the ESC key is hit (in single column view)
    $('#toc_column').on('keydown', function(e){
      if(inSingleColumnView()) {
        if(e.which == 27){ //ESC key code
          //hide the toc
          $('#close_container').click();
        }
      }
    });

    // Handle collapsing the table of contents from full width back into an orange line on the left side of the page.
    $('#close_container').on('click', function() {
        close_TOC();
    });

    $('#close_container img').on('keydown', function(event) {
        // Enter key
        if(event.which === 13 || event.keyCode === 13){
            $('#close_container').click();
        }
    });

    // These handlers only work for static guides.   At the time this
    // code executes, the TOC items for the interactive guides are not yet built.
    // So the following is basically a no-op for the interactive guides.
    // However, this code is duplicated in
    // ...iguides-common\js\interactive\guides\table-of-contents.js
    // to set the same handlers there.
    $('#toc_container').on('click', 'li', function(event) {
        // 'this' is the li element in the #toc_container
        TOCEntryClick(this, event);
    });
    $('#toc_container').on('keydown', 'li', function(event) {
        // 'this' is the li element in the #toc_container
        if (event.which === 13 || event.which === 32) {   // Spacebar or Enter
          this.click();
        }
    });

    var width = window.innerWidth;
    $(window).on('resize', function() {

        // going from 3 column to 2 column view
        if (width >= threeColumnBreakpoint && $(this).innerWidth() < threeColumnBreakpoint) {
            if (!$('#guide_column').hasClass('expanded')) {
                TocIndicatorBounce();
            }
            $("#toc_inner").css("margin-top", "");
        }

        // going from single column to 2 column view
        if (width < twoColumnBreakpoint && $(this).innerWidth() >= twoColumnBreakpoint) {
            // close_TOC();
            TocIndicatorBounce();
        }

        // going from 2 column to 3 column view
        if (width < threeColumnBreakpoint && $(this).innerWidth() >= threeColumnBreakpoint) {
            console.log("going from 2 col to 3 col view");
            $('#toc_column').css({'position': '', 'top': ''});
        }

        // if toc indicator visible and nav bar fixed to top of page, position toc indiciator below nav bar
        if ($("#toc_indicator").css("display") == "block" && $("#nav_bar").hasClass("fixed_top")) {
            $("#toc_indicator").css("margin-top", $("#nav_bar").outerHeight());
        }

        // update width with new width after resizing
        if ($(this).innerWidth() != width) {
            width = $(this).innerWidth();
        }

    });

});
