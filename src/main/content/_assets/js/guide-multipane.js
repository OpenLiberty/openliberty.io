/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
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

function handleFloatingCodeColumn(){
    if($(window).width() > 1170) {
        // CURRENTLY IN DESKTOP VIEW
        if(isBackgroundBottomVisible()) {
            // Set the bottom of the code column to the distance between the top of the related guides section and the bottom of the page.
            var windowHeight = window.innerHeight;
            var relatedGuidesTopPosition = $("#related_guides_section")[0].getBoundingClientRect().top;
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

$(document).ready(function() {

    var offset;
    var target;
    var target_position;
    var target_width;
    var target_height;

    $('#preamble').detach().insertAfter('#duration_container');
    

    var guide_sections = [];
    var code_sections = {}; // Map guide sections to code blocks to show on the right column.

    // Move the code snippets to the code column on the right side.
    // Each code section is duplicated to show the full file in the right column and just the snippet of code relevant to the guide in the left column in single column / mobile view.
    $('.code_column').each(function(){
        var code_block = $(this);             
        var metadata_sect = code_block.prev().find('p');
        if(metadata_sect.length > 0){
            var metadata = metadata_sect[0].innerText;
            var fileName, 
                line_nums,
                fromLine,
                toLine;

            // Split the string into file name and line numbers to show
            metadata = metadata.split(',');
            fileName = metadata[0];

            if(metadata.length === 2){
                line_nums = metadata[1];

                if(line_nums.indexOf('lines=') > -1){
                    line_nums = line_nums.substring(6);
                    // Show the entire file
                    if(line_nums === '*'){
                        fromLine = 0;
                        toLine = code_block.find('.line-numbers').last().text();
                    }
                    if(line_nums.indexOf('-') > -1){
                        var lines = line_nums.split('-');
                        fromLine = lines[0];
                        toLine = lines[1];
                    }
                    else{
                        fromLine = line_nums;
                        toLine = -1;
                    }
                }
            }          

            // Clone this code block so the full file can be shown in the right column and only a duplicate snippet will be shown in the single column view or mobile view.
            // The duplicated code block will be shown on the right column.
            var duplicate_code_block = code_block.clone();

            var guide_section = code_block.parents('.sect1').first();
            var header = guide_section.find('h2')[0];
            guide_sections.push(header);

            code_sections[header.id] = {
                'code': duplicate_code_block,
                'fromLine': fromLine,
                'toLine': toLine
            }

            if(line_nums !== '*'){
                var first_span = code_block.find('.line-numbers:contains(' + fromLine + ')').first(); 
                var last_span = code_block.find('.line-numbers:contains(' + toLine + ')').first(); 

                // Remove spans before the first line number and after the last line number
                if(first_span.length > 0 && last_span.length > 0){
                    first_span.prevAll('span').remove();
                    last_span.nextAll('span').remove();
                } 
            }      

            // Create a title pane for the code section
            duplicate_code_block.attr('fileName', fileName);

            // Move file name to the code column
            var title_section = $("<div class='code_column_title_container'></div>");
            var title_div = $("<div class='code_column_title'>" + fileName + "</div>");
            title_section.append(title_div);

            // Remove old title from the DOM
            metadata_sect.detach();

            // Add a copy file button and add it to the title section
            var copyFileButton = $("<div class='copyFileButton' tabindex=0>");
            var img = $("<img src='/img/guide_copy_button.svg' alt='Copy file contents' />");
            copyFileButton.append(img);
            title_section.append(copyFileButton);

            duplicate_code_block.prepend(title_section);
            duplicate_code_block.addClass('dimmed_code_column'); // Dim the code at first while the github popup takes focus.
            duplicate_code_block.appendTo('#code_column'); // Move code to the right column  
        }    
    });

    // Map the guide sections that don't have any code sections to the previous section's code.
    var sections = $('.sect1:not(#guide_meta) > h2, .sect2:not(#guide_meta) > h3');
    for(var i = 1; i < sections.length; i++){
        var id = sections[i].id;
        if(!code_sections[id]){
            guide_sections.push($(sections[i]));
            var previous_id = sections[i-1].id;
            code_sections[id] = code_sections[previous_id];
        }
    }

    // Hide all code blocks except the first
    $('#code_column .code_column:not(:first)').hide();

    $("#breadcrumb_hamburger").on('click', function(event){
        // Handle resizing of the guide column when collapsing/expanding the TOC in 3 column view.
        if($(window).width() >= 1440){
            if($("#toc_column").hasClass('in')){
                // TOC is expanded
                $("#guide_column").addClass('expanded');
            }
            else{
                // TOC is closed
                $("#guide_column").removeClass('expanded');
            }
        }
        // Handle table of content floating if in the middle of the guide.
        handleFloatingTableOfContent();
    });

    // Handle scrolling in the code column.
    // Prevents the default scroll behavior which would scroll the whole browser.
    // The code column scrolling is independent of the guide column.
    $('#code_column').on('wheel mousewheel DOMMouseScroll', function(event){
        $(this).stop(); // Stop animations taking place with this code section.

        var event0 = event.originalEvent;
        var dir = (event0.deltaY) < 0 ? 'up' : 'down';        
        var hasVerticalScrollbar = false;     

        // Check if element is scrollable.
        if(this.scrollTop > 0 || this.scrollHeight > document.documentElement.clientHeight){
            hasVerticalScrollbar = true;
        }

        if(!hasVerticalScrollbar){
            // If the code file has no scrollbar, the page will still scroll if the event is propagated to the window scroll listener.
            event.stopPropagation();
            event.preventDefault();
        }
        // If the code column is at the top and the browser is scrolled down, the element has no scrollTop and does not respond to changing its scrollTop.
        else if(!(dir == 'down' && this.scrollTop === 0)){
            var delta = event0.wheelDelta || -event0.detail || -event0.deltaY;
            // Firefox's scroll value is always 1 so multiply by 150 to scroll faster.
            if(delta === 1 || delta === -1){
                delta *= 150;
            }
            this.scrollTop -= delta;
            handleGithubPopup(true);
            event.preventDefault();  
        }            
    });

    // Handle collapsing the table of contents from full width into the hamburger
    $('#close_container').on('click', function(event){
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

    $('#guide_content pre:not(.no_copy pre)').hover(function(event) {

        offset = $('#guide_column').position();
        target = event.currentTarget;
        var current_target_object = $(event.currentTarget);
        target_position = current_target_object.position();
        target_width = current_target_object.outerWidth();
        target_height = current_target_object.outerHeight();

        $('#copy_to_clipboard').css({
            top: target_position.top + 8,
            right: parseInt($('#guide_column').css('padding-right')) + 55
        });
        $('#copy_to_clipboard').stop().fadeIn();

    }, function(event) {

        var x = event.clientX - offset.left;
        var y = event.clientY - offset.top + $(window).scrollTop();
        if(!(x > target_position.left
        && x < target_position.left + target_width
        && y > target_position.top
        && y < target_position.top + target_height)) {
            $('#copy_to_clipboard').stop().fadeOut();
            $('#copied_to_clipboard_confirmation').stop().fadeOut();
        }  

    });

    $('#copy_to_clipboard').click(function(event) {
        
        event.preventDefault();
        window.getSelection().selectAllChildren(target);
        if(document.execCommand('copy')) {
            window.getSelection().removeAllRanges();
            var current_target_object = $(event.currentTarget);
            var position = current_target_object.position();
            $('#copied_to_clipboard_confirmation').css({
                top: position.top - 25,
                right: 50
            }).stop().fadeIn().delay(3500).fadeOut();
        } else {
            alert('To copy press CTRL + C');
        }

    });

    // Set the github clone popup top value to the same as the what you'll learn section.
    var whatYoullLearn = $("#what-you-ll-learn");
    if(whatYoullLearn.length > 0){
        var githubCloneTop = whatYoullLearn.get(0).offsetTop;
        $("#github_clone_popup_container").css('top', githubCloneTop);
    }

    $(".copyFileButton").click(function(event){
        event.preventDefault();
        target = $("#code_column .code_column:visible .content").get(0);
        window.getSelection().selectAllChildren(target); // Set the file contents as the copy target.
        if(document.execCommand('copy')) {
            window.getSelection().removeAllRanges();
        } else {
            alert('Copy failed. Copy the code manually: ' + target.innerText);
        }
    });

    // Handle enter key presses on the copy file button
    $(".copyFileButton").on('keypress', function(event){
        // Enter key
        if(event.key === "Enter"){
            $(this).click();
        }
    });
    

    /* Copy button for the github clone command  that pops up initially when opening a guide. */
    $("#github_clone_popup_copy").click(function(event){
        event.preventDefault();
        target = $("#github_clone_popup_repo").get(0);
        window.getSelection().selectAllChildren(target); // Set the github clone command as the copy target.
        if(document.execCommand('copy')) {
            window.getSelection().removeAllRanges();
            $("#github_clone_popup_container").fadeOut("slow");
            $(".code_column").removeClass('dimmed_code_column', {duration:400});
        } else {
            alert('Copy failed. Copy the command manually: ' + target.innerText);
        }        
    });

    $("#down_arrow").on('click', function(){
        // Scroll to the next guide section
       var nextHeader = $("#guide_content p:visible").first().next('.sect1'); 
    })

    function handleDownArrow() {
        if($(window).width() < 1171){
            $("#down_arrow").hide();
            return;
        }
        var atTop = $(window).scrollTop() === 0;
        atTop ? $("#down_arrow").fadeIn() : $("#down_arrow").fadeOut();
    }

    /*
       Handle showing/hiding the Github popup.
       @Param isCodeColumn boolean for telling if the scroll happened in the code column instead of the overall window.
    */
    function handleGithubPopup(isCodeColumn) {
        // If the page is scrolled down past the top of the page then hide the github clone popup
        var githubPopup = $("#github_clone_popup_container");
        if(githubPopup.length > 0){
            var atTop;
            if(isCodeColumn){
                // Only show the Github popup for the first code column
                if(!$('#code_column .code_column:first').is(":visible")){
                    return;
                }
                atTop = $("#code_column").scrollTop() === 0;
            } else {
                atTop = $(window).scrollTop() === 0;
            }
            if(atTop){
                githubPopup.fadeIn();
                $("#code_column .code_column").addClass('dimmed_code_column', {duration:400});
            }
            else{            
                githubPopup.fadeOut();
                $("#code_column .code_column").removeClass('dimmed_code_column', {duration:400});
            }
        }                
    }

    // TABLE OF CONTENT
    //
    // Keep the table of content (TOC) in view while scrolling (Desktop only)
    //
    function handleFloatingTableOfContent() {
        if($(window).width() > 1440) {
            // CURRENTLY IN 3 COLUMN VIEW
            if($(window).scrollTop() >= $('#toc_column').offset().top) {
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

    // Handle when the table of content (TOC) is too small to fit completely in the dark background.
    // We want to give the end result of the bottom of the TOC sticks to the bottom of the dark background
    // and the top of the TOC scrolls off screen.
    function handleTOCScrolling() {
        var visible_background_height = heightOfVisibleBackground();
        var toc_height = $('#toc_inner').height();
        if(toc_height > visible_background_height) {
            // The TOC cannot fit in the dark background, allow the TOC to scroll out of viewport
            // to avoid the TOC overflowing out of the dark background
            var negativeNumber = visible_background_height - toc_height + 100;
            $('#toc_inner').css({"position":"fixed", "top":negativeNumber});
        }
    }

    // Slow the scrolling over section headers in the guide
    function handleSectionSnapping(event){
        var origEvent = event.originalEvent;        
        var target = origEvent.target;
        var dir = (origEvent.deltaY) < 0 ? 'up' : 'down';
        var delta = origEvent.wheelDelta || -origEvent.detail || -origEvent.deltaY;
        // Multipane view
        if($(window).width() > 1170) {
            var sections = $('.sect1:not(#guide_meta) > h2');
            sections.each(function(index){
                var elem = sections.get(index);
                var rect = elem.getBoundingClientRect();
                var elemTop = rect.top - 100; // Offset by the sticky header's height
                var elemBottom = rect.bottom;

                // Check if the next section in the direction the user is scrolling shows up
                var isVisible;
                if(dir === 'down'){
                    // Element top is visible and bottom is not visible
                    isVisible = elemTop < window.innerHeight && elemBottom >= window.innerHeight;
                } else if(dir === 'up'){
                    // isVisible = elemBottom >= 0 && elemBottom < window.innerHeight;
                    isVisible = elemBottom >= 0 && elemBottom < window.innerHeight;
                }

                if(isVisible){
                    // Remove previous TOC section highlighted and highlight correct step
                    updateTOCHighlighting(this.id);

                    // Scroll to the section coming into view if scrolling down the page
                    // if(dir === 'down' || (dir === 'up' && elemTop < 0)){
                        // const y = elemTop + window.scrollY;
                        // $('html, body').stop().animate({
                        //     scrollTop: y,
                        //     easing: 'linear'
                        // });
                    // }
                    

                    // Set URL hash value to be the section id
                    if(elem.id){
                        location.hash = elem.id;
                    }
                       

                    // Hide other code blocks and show the correct code block.
                    var id = elem.id;
                    try{
                        var code_block = code_sections[id].code;
                        var fromLine = code_sections[id].fromLine,
                            toLine = code_sections[id].toLine; // To be used in the future when we have designs for highlighting a range of lines.
                        $('#code_column .code_column').not(code_block).hide();
                        code_block.show();
        
                        // Scroll to the line in the code column if a line number is given
                        if(fromLine){
                            var target = code_block.find('.line-numbers:contains(' + fromLine + ')').first();                         
                            $('#code_column').animate({
                                scrollTop: target.offset().top
                            }, 500);
                        } else {
                            $('#code_column').scrollTop('0');
                        }   
                    } catch(e) {
                        console.log(e);
                    }

                    return false; // Break out of loop        
                }             
            });      
        }            
    };

    function updateTOCHighlighting(id){
        // Remove previous TOC section highlighted and highlight correct step
        $('.liSelected').removeClass('liSelected');
        var anchor = $("#toc_container a[href='#" + id + "']");
        anchor.parent().addClass('liSelected');
    }

    $("#toc_container a").on('click', function(event){
        var id = this.hash.substring(1);
        updateTOCHighlighting(id);
    });

    // Adjust the window for the sticky header when clicking on a section anchor.
    function shiftWindow() {
        scrollBy(0, -100);
    };
    if (location.hash){
        shiftWindow();
        handleFloatingTableOfContent();
    } 
    window.addEventListener("hashchange", function(){
        shiftWindow();
    });

    // Resize the guide sections so that there is clear separation between each section and the code column transitions better.
    function resizeGuideSections(){
        // Two column view or three column view.
        if($(window).width() > 1170){
            var viewportHeight = window.innerHeight;
            var headerHeight = $('header').height();
            var sectionTitleHeight = $("#guide_content h2").first().height();
            var newSectionHeight = viewportHeight - headerHeight - (2 * sectionTitleHeight);
            $('.sect1:not(#guide_meta)').css({
                'min-height': newSectionHeight + 'px'
            });
        }
        // Use initial height for single column view / mobile
        else {
            $('.sect1:not(#guide_meta)').css({
                'min-height': 'initial'
            });
        }
    };

    resizeGuideSections();

    // RELATED GUIDES
    //
    // Add Related guides link to the table of contents, if needed
    //
    if( $('#related-guides').length ) {
        // Add _one_ Related guides link to the very bottom of the table of contents.
        // The assumption is that the TOC only contains one `sectlevel1` class.
        $('#toc_container ul.sectlevel1').append('<li><a href="#related-guides">Related guides</a></li>');
    }

    $(window).on('resize', function(){
        handleFloatingTableOfContent(); // Handle table of content view changes.
        handleDownArrow();
        handleFloatingCodeColumn();
        resizeGuideSections();        
    });

    $(window).on('wheel mousewheel DOMMouseScroll', function(event) {
        handleGithubPopup(false);
        handleDownArrow();
        handleFloatingTableOfContent();
        handleFloatingCodeColumn();
        handleSectionSnapping(event);  
    });

    // Show the github popup for the first section.
    $(window).on('load', function(){
        if(window.location.hash === ""){
            handleGithubPopup();
        }
    });
});
