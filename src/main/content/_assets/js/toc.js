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
    if (window.innerWidth >= threeColumnBreakpoint) {
        // CURRENTLY IN 3 COLUMN VIEW
        // The top of the TOC is scrolling off the screen, enable floating TOC.
        if(isBackgroundBottomVisible()) {
            handleTOCScrolling();
            shrinkTOCIndicator();
        } else {
            // The entire viewport is filled with the background, so
            // do not need to worry about the TOC flowing out of the background.
            enableFloatingTOC();
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

function enableFloatingTOC() {
    $('#toc_inner').css({"position":"fixed", "top":"100px"});    
}

function calculateTOCHeight(){
    var endOfGuidePosition = $("#end_of_guide")[0].getClientRects()[0].top;
    var headerHeight = $('header').height();
    return endOfGuidePosition - headerHeight;
}

function shrinkTOCIndicator() {
    $('#toc_line').css({
        "position": "", 
        "top": "",
        "height": calculateTOCHeight()
    });
}

function expandTOCIndicator() {
    $('#toc_line').css({
        "position":"fixed",
        "top":"101px",
        "height": calculateTOCHeight()
    });
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

function handleFloatingTOCAccordion() {
    var accordion = $('#mobile_toc_accordion_container');

    var enableFloatingTOCAccordion = function(){
        // Put the TOC accordion back into the page and remove the
        // scroller_anchor <div>.
        accordion.removeClass('fixed_toc_accordion');
        $('.scroller_anchor').css('height', 0);
        // Restore toc location.
        $('#toc_column').css('margin-top', '0px');
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
        } else {
          //mobile_toc_accordion blocks the top part of the TOC column, need to add margin so that 'X' in TOC is visible
          var tocDistanceFromTop = $('#toc_column').offset().top;
          if ($(this).scrollTop() >= tocDistanceFromTop) {
            $('#toc_column').css('margin-top', '40px');
          }
        }
    }
    else{
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
    if(inSingleColumnView()){
        $("#mobile_close_container").trigger('click');
    } else if(window.innerWidth < threeColumnBreakpoint){
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
        // So, this history.pushState will allow us to set the URL without
        // invoking immediate scrolling.  Then we call accessContentsFromHash
        // to perform the smooth scrolling to the requested section.
        history.pushState(null, null, newPath);
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
        $("#toc_column").addClass('inline');
        $("#guide_column").removeClass('expanded');

        $("#toc_line").addClass("open");            
        $("#toc_column").addClass("open");
        $("#guide_column").addClass("open");

        $("#toc_indicator").hide();

        restoreCurrentStep();
    }
}

function close_TOC(){
    $("#toc_title").css('margin-top', '20px');

    // Remove display type from the table of contents
    $("#toc_column").removeClass('inline');

    // Update the width of the guide_column to accomodate the larger space when the browser is in 3 column view.
    $("#guide_column").addClass('expanded');

    // Remove open class to transition back
    $("#toc_line").removeClass("open");
    $("#toc_column").removeClass("open");
    $("#guide_column").removeClass("open");

    $("#toc_indicator").removeClass('open');
    $("#toc_indicator").show();

    restoreCurrentStep();
}

function setInitialTOCLineHeight(){  
    $("#toc_line").css(
        {'height': calculateTOCHeight()}
    );
}


$(document).ready(function() {

    reorganizeTOCElements();
    setInitialTOCLineHeight();    

    // Add listener for clicking on the
    $("#toc_hotspot, #toc_indicator").on('mouseenter', function(){
        // Animate out the arrow and highlight the left side of the screen orange to indicate there is a TOC
        if(!$("#toc_column").hasClass('open')){
            $("#toc_line").css(
                {'background-color': 'rgb(255, 216, 191)'}
            );
            $("#toc_indicator").addClass('open');
        }        
    });

    $("#toc_hotspot").on('mouseleave', function(){
        if(!$("#toc_column").hasClass('open')){
            var x = event.x;
            var y = event.y;
            var headerHeight = $('header').height();
            var indicatorHeight = $("#toc_indicator").outerHeight();
            
            y = y - headerHeight;
            if(x >= 0 && x <= this.offsetWidth && y >= 0 && y <= indicatorHeight){
                // Still hovering over the TOC indicator arrow, so don't remove the orange line and arrow.
                return;
            }

            $("#toc_line").css(
                {'background-color': 'transparent'}
            );  
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
    
    $("#breadcrumb_hamburger").on('click', function(event){
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
        if ($('#mobile_close_container').attr("class").trim().length == 0) { //TOC is visible, doesn't have class 'collapsed'
            $("#mobile_close_container  img").focus(); //focus on 'X'
        }
    });

    //In single column view, close the TOC after tabbing from the last element in the TOC
    //and focus on the first tabbable element in the first step
    $('#tags_container').on('keydown', function(){
      if(inSingleColumnView()) {
        var tagWithFocus = $(document.activeElement);
        var lastTag = $('#tags_container').children().last();
        if (tagWithFocus.is(lastTag)) { //tabbing from the last tag in TOC
          //hide the toc
          $('#mobile_close_container').click();
        }
      }
    });

    //Hide the TOC when the ESC key is hit (in single column view)
    $('#toc_column').on('keydown', function(e){
      if(inSingleColumnView()) {
        if(e.which == 27){ //ESC key code
          //hide the toc
          $('#mobile_close_container').click();
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

    $('#mobile_close_container img').on('keydown', function(event) {
        // Enter key
        if(event.which === 13 || event.keyCode === 13){
            $('#mobile_close_container').click();
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


});
