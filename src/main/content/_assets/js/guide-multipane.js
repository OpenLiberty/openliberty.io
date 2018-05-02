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
    if($(window).width() >= 1171) {
        // CURRENTLY IN DESKTOP VIEW
        if(isBackgroundBottomVisible()) {
            // Set the bottom of the code column to the distance between the top of the related guides section and the bottom of the page.
            var windowHeight = window.innerHeight;
            var relatedGuidesTopValue = $("#related_guides_section")[0].getBoundingClientRect().top;
            if(relatedGuidesTopValue){
                var bottom = windowHeight - relatedGuidesTopValue;
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

    // Move the code snippets to the code column on the right side.
    $('.codecolumn').each(function(){
        var code_block = $(this);
        var sections = $(this).prev().find('p');
        if(sections.length > 0){
            var section_list = sections[0].innerText.toLowerCase();
            // Split the string into sections that should display this code block
            section_list = section_list.split(',');
            
            for(var i = 0; i < section_list.length; i++){
                // Split the string into a pattern of id=line_num
                section_list[i] = section_list[i].trim().replace(/\s+|\’/g, '-');
                // Get the section id and line number from the section
                var equal_index = section_list[i].indexOf('=');
                var id = section_list[i].substring(0, equal_index);
                var line_num = section_list[i].substring(equal_index + 1);

                // Add scroll listener for when the guide_column is scrolled to the given sections
                var elem = $('#' + id);
                if(elem.length > 0){
                    $(window).scroll(function(){       
                        var hT = elem.offset().top,
                        hH = elem.outerHeight(),
                        wH = $(window).height(),
                        wS = $(window).scrollTop();
                        if (wS > (hT+hH-wH) && (hT > wS) && (wS+wH > hT+hH)){
                            // Scroll to the line in the code column
                            if(line_num){
                                var target = code_block.find('.line-numbers:contains(' + line_num + ')').first();

                                // Hide other code blocks and scroll to the correct one
                                $('.codecolumn').not($(this)).hide();
                                code_block.show();

                                // Update the header file name
                                $('.fileName').text(code_block.attr('fileName'));

                                // $('html, #code_column').animate({
                                //     scrollTop: target.offset().top
                                // }, 500);
                            }                
                        }
                    });
                }                
            }
            // Remove the section list from the DOM as it is not needed anymore.
            sections.remove();
        }       

        // Create a title pane for the code section
        var title = $(this).parents('.sect1').find('h3').first();
        var fileName = title.text();
        $(this).attr('fileName', fileName);
        $('.fileName').text(fileName);
        title.detach();

        // title.addClass('codeTitle');
        // $(this).prepend(title.detach());

        $(this).detach().appendTo('#code_column'); // Move code to the right column
    });

    // Hide all code blocks except the first
    $('.codecolumn:not(:first)').hide();

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
    });

    // Handle collapsing the table of contents from full width into the hamburger
    $('#close_container').on('click', function(event){
         // Hide the X button
        $(this).hide();

        // Show the hamburger button and adjust the header to accomodate it
        $('#breadcrumb_hamburger').css('display', 'inline-block');
        $('#breadcrumb_row .breadcrumb').css({
            'width': 'calc(100% - 76px)',
            'float': 'right',
        });
        $("#toc_title").css('margin-top', '20px');        

        // Remove display type from the table of contents
        $("#toc_column").removeClass('inline');

        // Update the width of the guide_column to accomodate the larger space when the browser is in 3 column view.
        if($(window).width() >= 1440){
            $("#guide_column").addClass('expanded');
        }
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

    // Desktop view only: Set the file name in the breadcrumb to be aligned with the code column   
    var alignCodeFileName = function(){
        if($(window).width() >= 767) {
            var codeColumnOffset = $("#code_column").offset().left;
            var lastBreadcrumb = $("#breadcrumb_row li:nth-last-child(3)");
            var endPoint = lastBreadcrumb.offset().left + lastBreadcrumb.width();
            // If the title would overlap the last breadcrumb, then adjust the 'left' location to be to the right of the breadcrumb.
            if(endPoint >= codeColumnOffset){
                codeColumnOffset = endPoint + '5px';
            }
            $("#breadcrumb_row .fileName").css('left', codeColumnOffset);
        }        
    }
    alignCodeFileName();

    $(".copyFileButton").click(function(event){
        event.preventDefault();
        target = $(".codecolumn:visible").get(0);
        window.getSelection().selectAllChildren(target); // Set the github clone command as the copy target.
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
        } else {
            alert('Copy failed. Copy the command manually: ' + target.innerText);
        }        
    });

    var handleGithubPopup = function(){
        // If the page is scrolled down past the top of the page then hide the github clone popup
        var githubPopup = $("#github_clone_popup_container");
        var atTop = $(window).scrollTop() === 0;
        if(atTop){
            githubPopup.fadeIn();
        }
        else{            
            githubPopup.fadeOut();
        }
    }

    // Adjust the window for the sticky header when clicking on a section anchor.
    var shiftWindow = function() { scrollBy(0, -100) };
    if (location.hash){
        shiftWindow();
    } 
    window.addEventListener("hashchange", shiftWindow);

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
        alignCodeFileName();
    });

    // TABLE OF CONTENT
    //
    // Keep the table of content (TOC) in view while scrolling (Desktop only)
    //
    $(window).scroll(function() {
        handleGithubPopup();
        handleFloatingCodeColumn();
    });
});
