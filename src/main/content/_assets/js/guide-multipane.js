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
                    if(line_nums.indexOf('-') > -1){
                        var lines = line_nums.split('-');
                        fromLine = parseInt(lines[0]);
                        toLine = parseInt(lines[1]);
                    }
                }
            }   

            // Wrap each leftover piece of text in a span to handle highlighting a range of lines.
            code_block.find('code').contents().each(function(){
                if (!$(this).is('span')) {
                     var newText = $(this).wrap('<span class="string"></span>');
                     $(this).replaceWith(newText);
                }
            });

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

            var first_span = code_block.find('.line-numbers:contains(' + fromLine + ')').first(); 
            var last_span = code_block.find('.line-numbers:contains(' + (toLine + 1) + ')').first();

            // Remove spans before the first line number and after the last line number
            if(first_span.length > 0 && last_span.length > 0){
                first_span.prevAll('span').remove();
                last_span.nextAll('span').remove();
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

            // Wrap code block lines in a div to highlight
            var highlight_start = duplicate_code_block.find('.line-numbers:contains(' + fromLine + ')').first();
            var highlight_end = duplicate_code_block.find('.line-numbers:contains(' + (toLine + 1) + ')').first();
            var range = highlight_start.nextUntil(highlight_end);

            range.wrapAll("<div class='highlightSection'></div>");

            // Remove line numbers which were mainly used for highlighting the section.
            code_block.find('.line-numbers').remove();
            duplicate_code_block.find('.line-numbers').remove();
        }    
    });

    // Map the guide sections that don't have any code sections to the previous section's code.
    var sections = $('.sect1:not(#guide_meta):not(#related-guides) > h2, .sect2:not(#guide_meta):not(#related-guides) > h3');
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

    // Slow the scrolling over section headers in the guide
    function handleSectionSnapping(event){
        // Multipane view
        if($(window).width() > twoColumnBreakpoint) {
            var id = getScrolledVisibleSectionID(event);
            if (id) {
                // Remove previous TOC section highlighted and highlight correct step
                updateTOCHighlighting(id);

                // Set URL hash value to be the section id
                location.hash = id;                       

                // Hide other code blocks and show the correct code block.                  
                try{
                    var code_block = code_sections[id].code;
                    var fromLine = code_sections[id].fromLine,
                        toLine = code_sections[id].toLine; // To be used in the future when we have designs for highlighting a range of lines.
                    $('#code_column .code_column').not(code_block).hide();
                    code_block.show();
                
                    // Scroll to the line in the code column if a line number is given
                    if(fromLine){
                        // var target = code_block.find('.line-numbers:contains(' + fromLine + ')').first();                         
                        // $('#code_column').animate({
                        //     scrollTop: target.offset().top
                        // }, 500);
                    } else {
                        $('#code_column').scrollTop('0');
                    }   
                } catch(e) {
                    console.log(e);
                }
                
            }     
        }            
    }
    
    $(window).on('scroll', function(event) {
        handleGithubPopup(false);
        handleSectionSnapping(event);
    });

    $(window).on('load', function(){
        if(window.location.hash === ""){
            handleGithubPopup();            
        }        
    });
});
