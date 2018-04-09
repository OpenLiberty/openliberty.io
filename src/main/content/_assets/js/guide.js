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

// Handle when to float the table of contents when the browser width is 1440 pixels or greater.
function handleFloatingTableOfContent() {
    if($(window).width() >= 1440) {
        // CURRENTLY IN DESKTOP VIEW
        if($(window).scrollTop() > $('#toc_column').offset().top) {
            // The top of the TOC is scrolling off the screen, enable floating TOC.

            // Get the initial width of the TOC before applying position:fixed
            var toc_width = $('#toc_inner').width();
            
            // position:fixed loses the original TOC width.  Restore original width when
            // applying position fixed.
            $('#toc_inner').width(toc_width);
            if(isBackgroundBottomVisible()) {
                handleTOCScolling();
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
        // CURRENTLY IN MOBILE VIEW
        // Remove any floating TOC when on mobile
        disableFloatingTOC();
    }
}

function disableFloatingTOC() {
    $('#toc_inner').width("").css({"position": "", "top": ""});
}

function enableFloatingTOC() {
    $('#toc_inner').css({"position":"fixed", "top":"0"});
}

// Handle when the table of content (TOC) is too small to fit completely in the dark background.
// We want to give the end result of the bottom of the TOC sticks to the bottom of the dark background
// and the top of the TOC scrolls off screen.
function handleTOCScolling() {
    var visible_background_height = heightOfVisibleBackground();
    var toc_height = $('#toc_inner').height();
    if(toc_height > visible_background_height) {
        // The TOC cannot fit in the dark background, allow the TOC to scroll out of viewport
        // to avoid the TOC overflowing out of the dark background
        var negativeNumber = visible_background_height - toc_height;
        $('#toc_inner').css({"position":"fixed", "top":negativeNumber});
    }
}

$(document).ready(function() {

    var offset;
    var target;
    var target_position;
    var target_width;
    var target_height;

    $('#preamble').detach().insertAfter('#duration_container');

    // Move the code snippets to the code column on the right
    $('.rightside').each(function(){
        var code_block = $(this);
        var sections = $(this).prev().find('p');
        if(sections.length > 0){
            var section_list = sections[0].innerText.toLowerCase();
            // console.log(sections);
            // Split the string into sections that should display this code block
            section_list = section_list.split(',');
            
            for(var i = 0; i < section_list.length; i++){
                // Split the string into pattern of id=line_num
                section_list[i] = section_list[i].trim().replace(/\s+|\’/g, '-');
                // console.log(section_list[i]);
                // Get the section id and line number from the section
                var equal_index = section_list[i].indexOf('=');
                var id = section_list[i].substring(0, equal_index);
                var line_num = section_list[i].substring(equal_index + 1);

                // Add scroll listener for when the guide_column is scrolled to the given sections
                var elem = $('#' + id);
                if(elem.length > 0){
                    // $(window).scroll(function(){       
                    //     var hT = elem.offset().top,
                    //     hH = elem.outerHeight(),
                    //     wH = $(window).height(),
                    //     wS = $(window).scrollTop();
                    //     if (wS > (hT+hH-wH) && (hT > wS) && (wS+wH > hT+hH)){
                    //         // Scroll to the line in the code column
                    //         if(line_num){
                    //             // var target = $('#code_column .line-numbers:contains(' + scrollTo + ')').first();
                    //             var target = code_block.find('.line-numbers:contains(' + line_num + ')').first();
                    //             $('html, #code_column').animate({
                    //                 scrollTop: target.offset().top
                    //             }, 500);
                    //             // scrollTo(target.offset().top);
                    //         }                
                    //     }
                    // });
                }                
            }
            // Remove the section list from the DOM as it is not needed anymore.
            sections.remove();
        }       

        $(this).detach().appendTo('#code_column'); // Move code to the right column
    });
    // $(".rightside").detach().appendTo('#code_column'); // Move code to the right pane

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

    // RELATED GUIDES
    //
    // Add Related guides link to the table of contents, if needed
    //
    if( $('#related-guides').length ) {
        // Add _one_ Related guides link to the very bottom of the table of contents.
        // The assumption is that the TOC only contains one `sectlevel1` class.
        $('#toc_container ul.sectlevel1').append('<li><a href="#related-guides">Related guides</a></li>');
    }

    // TABLE OF CONTENT
    //
    // Keep the table of content (TOC) in view while scrolling (Desktop only)
    //
    $(window).scroll(function() {
        handleFloatingTableOfContent();
    });

    $(window).scroll(function() {
        // Check if there is a scrollToLine element in the viewport
        $('div[class*=scrollToLine-').each(function(index){
            var elem = $(this);
            var hT = elem.offset().top,
            hH = elem.outerHeight(),
            wH = $(window).height(),
            wS = $(window).scrollTop();
            if (wS > (hT+hH-wH) && (hT > wS) && (wS+wH > hT+hH)){
                // Get the line to scroll to
                var classList = this.classList;
                var scrollTo;
                for(var i=0; i<classList.length; i++){
                    if(classList[i].indexOf('scrollToLine-') > -1){
                        scrollTo = classList[i].substring(13);
                        break;
                    }
                }
                // Scroll to the line in the code column
                if(scrollTo){
                    var target = $('#code_column .line-numbers:contains(' + scrollTo + ')').first();
                    // $('html, #code_column').animate({
                    //     scrollTop: target.offset().top
                    // }, 500);
                    // scrollTo(target.offset().top);
                }                
            }
        });        
   });
});
