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

    var target;

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

            // Split the string into file name and line numbers to show
            metadata = metadata.split(',');
            var fileName = metadata[0];

            // Clone this code block so the full file can be shown in the right column and only a duplicate snippet will be shown in the single column view or mobile view.
            // The duplicated code block will be shown on the right column.
            var duplicate_code_block = code_block.clone();
            code_block.hide();

            var header = get_header_from_element(code_block);                       
            guide_sections.push(header);
            code_sections[header.id] = duplicate_code_block;

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

    // Highlights a block of code in a code section
    // Input code_section: The section of code to highlight.
    //       from_line: Integer for what line to start highlighting from.
    //       to_line: Integer for what line to end highlighting.
    function highlight_code_range(code_section, fromLine, toLine){
        // Wrap each leftover piece of text in a span to handle highlighting a range of lines.
        code_section.find('code').contents().each(function(){
            if (!$(this).is('span')) {
                 var newText = $(this).wrap('<span class="string"></span>');
                 $(this).replaceWith(newText);
            }
        });
        
        // Wrap code block lines in a div to highlight
        var highlight_start = code_section.find('.line-numbers:contains(' + fromLine + ')').first();
        var highlight_end = code_section.find('.line-numbers:contains(' + (toLine + 1) + ')').first();        
        var range = highlight_start.nextUntil(highlight_end);
        range.wrapAll("<div class='highlightSection'></div>");
        var scrollTop = $("#code_column")[0].scrollTop;
        var position = range.position().top;
        $("#code_column").animate({scrollTop: scrollTop + position - 50});
    }

    // Remove all highlighting for the code section.
    // Input code_section: The section of code to highlight.
    function remove_highlighting(code_section){
        var highlightedSections = code_section.find('.highlightSection');
        highlightedSections.each(function(){
            var children = $(this).find('span');
            children.unwrap(); // Remove the wrapped highlighted div from these children.
        });
        
    }

    // Creates a clone of the code highlighted by hotspots in desktop view, so that they can be shown in mobile.
    // Inputs: snippet: Hotspot in the guide column.
    //         code_block: The source code block.
    //         fromLine: The line in the code block to start copying from.
    //         toLine: The line in the code block to end copying.
    function create_mobile_code_snippet(snippet, code_block, fromLine, toLine){
        var duplicate_code_block = code_block.clone();
        duplicate_code_block.removeClass('dimmed_code_column'); // Remove the blur from the original code block;
        duplicate_code_block.addClass('mobile_code_snippet'); // Add class to this code snippet in the guide column to only show up in mobile view.
        duplicate_code_block.removeClass('code_columnn');
        duplicate_code_block.removeAttr('filename');
        duplicate_code_block.find('.code_column_title_container').remove();

        // Wrap each leftover piece of text in a span to handle selecting a range of lines.
        duplicate_code_block.find('code').contents().each(function(){
            if (!$(this).is('span')) {
                var newText = $(this).wrap('<span class="string"></span>');
                $(this).replaceWith(newText);
            }
        });
        var first_span = duplicate_code_block.find('.line-numbers:contains(' + fromLine + ')').first();
        var last_span = duplicate_code_block.find('.line-numbers:contains(' + (toLine + 1) + ')').first();

        // Remove spans before the first line number and after the last line number
        if(first_span.length > 0){
            first_span.prevAll('span').remove();            
        }
        if(last_span.length > 0){
            last_span.nextAll('span').remove();
        }
        snippet.after(duplicate_code_block);
    }

    // Returns the header of the element passed in. This checks if the element is in a subsection first before checking the main section header.
    function get_header_from_element(element){
        var header;
        var subsection = element.parents('.sect2');
        if(subsection.length > 0){
            header = subsection.find('h3')[0];
        }
        else{
            var section = element.parents('.sect1').first();
            header = section.find('h2')[0];
        }  
        return header;
    }

    // Returns the code block associated with a code hotspot.
    // Inputs: hotspot: The 'hotspot' in desktop view where hovering over the block will highlight certain lines of code in the code column relevant to what the guide is talking about.
    function get_code_block_from_hotspot(hotspot){
        var header = get_header_from_element(hotspot);
        return code_sections[header.id];
    }

    // Parse the hotspot lines to highlight and store them as a data attribute.
    $('.hotspot').each(function(){
        var snippet = $(this);
        var metadata = snippet.prev().find('p');
        if(metadata.length > 0){
            var metadata_text = metadata[0].innerText;
            if(metadata_text.indexOf('highlight_lines=') > -1){
                var line_nums = metadata_text.substring(16);
                if(line_nums.indexOf('-') > -1){
                    var lines = line_nums.split('-');
                    var fromLine = parseInt(lines[0]);
                    var toLine = parseInt(lines[1]);
                    // Set data attributes to save the lines to highlight
                    snippet.data('highlight_from_line', fromLine);
                    snippet.data('highlight_to_line', toLine);

                    var code_block = get_code_block_from_hotspot(snippet);
                    create_mobile_code_snippet(snippet, code_block, fromLine, toLine);
                }
            }             
        }
        // Remove old title from the DOM
        metadata.detach();
    });

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate){
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow){
                func.apply(context, args);
            } 
        };
    }

    /**
     * Handle hovering over hotspots. This will look up the corresponding code section on the right and search for the lines to highlight. Debounce is used to prevent multiple hotspots from being hovered over quickly and having the page jump around. It will handle the latest hotspot hovered over once 250 ms has passed.
     * @param hotspot: The snippet hovered over in the guide column.
     */
    var handleHotspotHover = debounce(function(hotspot){
        // Only highlight the code if the mouse is still hovered over the hotspot after the debounce.
        if(hotspot.data('hovering') == false){
            return;
        }
        var header = get_header_from_element(hotspot);
        var code_block = code_sections[header.id];
        if(code_block){
            var fromLine = hotspot.data('highlight_from_line');
            var toLine = hotspot.data('highlight_to_line');
            if(code_block && fromLine && toLine){
                highlight_code_range(code_block, fromLine, toLine);
            }            
        }
    }, 250);

    // When hovering over a code hotspot, highlight the correct lines of code in the corresponding code section.
    $('.hotspot').on('hover mouseover', function(event){
        $(this).data('hovering', true);
        handleHotspotHover($(this));
    });

    // When the mouse leaves a code 'hotspot', remove all highlighting in the corresponding code section.
    $('.hotspot').on('mouseleave', function(event){
        $(this).data('hovering', false);
        var header = get_header_from_element($(this));
        var code_block = code_sections[header.id];
        if(code_block){
            remove_highlighting(code_block);
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

    // Prevent scrolling the page when scrolling inside of the code panel, but not one of the code blocks.
    $('#code_column').on('wheel mousewheel DOMMouseScroll', function(event){
        event.stopPropagation();
        var target = $(event.target);
        if(!(target.is('.code_column') || target.parents('.code_column').length > 0)){   
            // Prevent scrolling the page when scrolling outside of lines of code but still inside of the code column.
            event.preventDefault();
        } 
    });

    // Handle scrolling in the code column.
    // Prevents the default scroll behavior which would scroll the whole browser.
    // The code column scrolling is independent of the guide column.
    $('.code_column').on('wheel mousewheel DOMMouseScroll', function(event){
        if(inSingleColumnView()){
            return;
        }
        $(this).stop(); // Stop animations taking place with this code section.

        var event0 = event.originalEvent;
        var dir = (event0.deltaY) < 0 ? 'up' : 'down';        
        var hasVerticalScrollbar = false;
        var codeColumn = $("#code_column").get(0);

        // Check if element is scrollable.
        if(this.scrollTop > 0 || this.offsetHeight > this.parentElement.offsetHeight){
            hasVerticalScrollbar = true;
        }

        if(!hasVerticalScrollbar){
            // If the code file has no scrollbar, the page will still scroll if the event is propagated to the window scroll listener.
            event.stopPropagation();
            event.preventDefault();
        }
        // If the code column is at the top and the browser is scrolled down, the element has no scrollTop and does not respond to changing its scrollTop.
        else if(!(dir == 'down' && codeColumn.scrollTop === 0)){
            var delta = event0.wheelDelta || -event0.detail || -event0.deltaY;
            // Firefox's scroll value is always 1 so multiply by 150 to scroll faster.
            if(delta === 1 || delta === -1){
                delta *= 150;
            }
            codeColumn.scrollTop -= delta;
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
    $("#github_clone_popup_copy, #mobile_github_clone_popup_copy").click(function(event){
        event.preventDefault();
        target = $("#github_clone_popup_repo").get(0);
        // IE
        if(window.clipboardData){
            window.clipboardData.setData("Text", target.innerText);
        } 
        else{
            var temp = $('<div>');
            temp.css({
                position: "absolute",
                left:     "-1000px",
                top:      "-1000px",
            });
            // Create a temporary element for copying the text.
            temp.text(target.innerText);
            $("body").append(temp);
            var range = document.createRange();
            range.selectNodeContents(temp.get(0));
            selection = window.getSelection();
            selection.removeAllRanges(); // Remove previous selections
            selection.addRange(range);
            
            // Try to copy the selection and if it fails display a popup to copy manually.
            if(document.execCommand('copy')) {                
                $("#github_clone_popup_container").fadeOut("slow");
                $(".code_column").removeClass('dimmed_code_column', {duration:400});
            } else {
                alert('Copy failed. Copy the command manually: ' + target.innerText);
            } 
            temp.remove(); // Remove temporary element.
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
                // Check if the "What You'll Learn" section is scrolled past yet.
                var whatYoullLearnTop = $("#what-youll-learn, #what-you-ll-learn")[0].getBoundingClientRect().top;
                var navHeight = $('.navbar').height();
                atTop = (whatYoullLearnTop - navHeight) > 0;
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

    // Hide other code blocks and show the correct code block based on provided id.
    function showCorrectCodeBlock(id) {
        try{
            var code_block = code_sections[id];
            if(code_block){
                $('#code_column .code_column').not(code_block).hide();
                code_block.show();
            }
        } catch(e) {
            console.log(e);
        }
    }

    // Slow the scrolling over section headers in the guide
    function handleSectionSnapping(event){
        // Multipane view
        if(window.innerWidth > twoColumnBreakpoint) {
            var id = getScrolledVisibleSectionID();
            if (id !== null) {
                var windowHash = window.location.hash;
                var scrolledToHash = id === "" ? id : '#' + id;
                if (windowHash !== scrolledToHash) {
                    // Update the URL hash with new section we scrolled into....
                    var currentPath = window.location.pathname;
                    var newPath = currentPath.substring(currentPath.lastIndexOf('/')+1) + scrolledToHash;
                    // Not setting window.location.hash here because that causes an
                    // onHashChange event to fire which will scroll to the top of the
                    // section.  pushState updates the URL without causing an
                    // onHashChange event.
                    history.pushState(null, null, newPath);

                    // Update the selected TOC entry
                    updateTOCHighlighting(id);

                    // Match the code block on the right to the new id
                    showCorrectCodeBlock(id);
                }
            }
        }
    }

    $('#guide_content pre:not(.code_command pre):not(.hotspot pre)').hover(function(event) {
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

    $(window).on('scroll', function(event) {
        // Check if a scroll animation from another piece of code is taking place and prevent normal behavior.
        if($("body").data('scrolling') === true){
            return;
        }
        handleGithubPopup(false);
        handleSectionSnapping(event);
    });

    $(window).on('load', function(){
        resizeGuideSections();
        createEndOfGuideContent();

        $.scrollify({
            section: '.sect1',
            interstitialSection: "#guide_meta",
            offset : -1 * $('header').height(),
            updateHash: false
        });

        if (location.hash){
            handleFloatingTableOfContent();
            var hash = location.hash;
            accessContentsFromHash(hash);
            showCorrectCodeBlock(hash.substring(1));  // Remove the '#' in front of the id
        }

        if(window.location.hash === ""){
            handleGithubPopup();
        }
    });
});
