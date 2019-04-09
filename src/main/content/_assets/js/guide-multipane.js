/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

var code_sections = {}; // Map guide sections to code blocks to show on the right column. Each guide section maps to its tab and code block.
var recent_sections = {}; // Store the most recently viewed code_section for each guide section

// Map the hotspots for a given file to what index the file is in that section.
// Input: Code_block: the code file
//        Header: the section header for this code file
//        Index: the index of the file in this section
function link_hotspots_to_file(code_block, header, index){
    // Check how many code_column are present in this subsection.
    var sect = code_block.parents('.sect1');
    var num_files = $(header).siblings('.code_column').length;   
    var hotspots;
    if(num_files === 1){
        hotspots = sect.find('code[class*=hotspot], span[class*=hotspot], div[class*=hotspot]');
    }
    else {
        // Find only the hotspots above this code block.
        hotspots = code_block.prevUntil('.code_column', 'code[class*=hotspot], span[class*=hotspot], div[class*=hotspot]');
        hotspots = hotspots.add(code_block.prevUntil('.code_column', '.paragraph').find('code[class*=hotspot], span[class*=hotspot], div[class*=hotspot]'));
    }
    hotspots.each(function(){
        $(this).data('file-index', index);
    });
}

// Highlights a block of code in a code section
// Input code_section: The section of code to highlight.
//       from_line: Integer for what line to start highlighting from.
//       to_line: Integer for what line to end highlighting.
//       scroll: boolean if the code should be scrolled to
function highlight_code_range(code_section, fromLine, toLine, scroll){
    // Wrap each leftover piece of text in a span to handle highlighting a range of lines.
    code_section.find('code').contents().each(function(){
        if (!$(this).is('span')) {
                var newText = $(this).wrap('<span class="string"></span>');
                $(this).replaceWith(newText);
        }
    });
    
    // Wrap code block lines in a div to highlight
    var highlight_start = code_section.find('.line-numbers').filter(function(){
        return parseInt(this.innerText.trim()) === fromLine;
    });
    var highlight_end = code_section.find('.line-numbers').filter(function(){
        return parseInt(this.innerText.trim()) === toLine + 1;
    });
    if(highlight_end.length === 0){
        highlight_end = highlight_start.nextAll('.line-numbers').first();
    }  
    var range = highlight_start.nextUntil(highlight_end);
    range.wrapAll("<div class='highlightSection'></div>");

    if(scroll){
        var scrollTop = $("#code_column_content")[0].scrollTop;
        var position = range.position().top;
        var titleBarHeight = $("#code_column_title_container").outerHeight();
        $("#code_column_content").animate({scrollTop: scrollTop + position - titleBarHeight});
    }        
}

// Remove all highlighting for the code section.
function remove_highlighting(){
    var highlightedSections = $('.highlightSection');
    highlightedSections.each(function(){
        var children = $(this).children('span');
        children.unwrap(); // Remove the wrapped highlighted div from these children.
    });
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
    var fileIndex = hotspot.data('file-index');
    if(!fileIndex){
        fileIndex = 0;
    }
    return code_sections[header.id][fileIndex].code;
}

// Hide other code blocks and show the correct code block based on provided id.
function showCorrectCodeBlock(id, index, switchTabs) {
    if(!id){
        // At the start of the guide where there is no guide section.
        return;
    }
    try{
        if(!index){
            index = 0;
        }
        var tab;
        // Load the most recently viewed tab for this section if viewed before.
        if(recent_sections[id]){
            tab = recent_sections[id].tab;
            index = tab.data('file-index');                
        }
        var code_block = code_sections[id][index].code;
        if(code_block){
            $('#code_column .code_column').not(code_block).hide();
            code_block.show();
            if(switchTabs){
                // Load all of the tabs for this section
                var subsection_files = code_sections[id];
                for(var i = subsection_files.length - 1; i >= 0; i--){
                    setActiveTab(subsection_files[i].tab);
                }
                if(recent_sections[id]) {
                    setActiveTab(tab);
                }
            }
            hideDuplicateTabs(id);
        }
    } catch(e) {
        console.log(e);
    }
}

/**
 * Handle hovering over hotspots. This will look up the corresponding code section on the right and search for the lines to highlight. Debounce is used to prevent multiple hotspots from being hovered over quickly and having the page jump around. It will handle the latest hotspot hovered over once 250 ms has passed.
 * @param hotspot: The snippet hovered over in the guide column.
 * @param highlightCode: boolean if the code should be highlighted
 */
var handleHotspotHover = debounce(function(hotspot){
    // Only highlight the code if the mouse is still hovered over the hotspot after the debounce.
    if(hotspot.data('hovering') == false){
        return;
    }
    $("#github_clone_popup_container").data('hotspot-hovered', true); // Track if a hotspot was hovered over to hide the github popup
    hideGithubPopup();
    var header = get_header_from_element(hotspot);
    var fileIndex = hotspot.data('file-index');
    if(!fileIndex){
        fileIndex = 0;
    }
    var code_block = code_sections[header.id][fileIndex].code;
    if(code_block){            
        // Save the code section for later when the user comes back to this section and we want to show the most recent code viewed.
        recent_sections[header.id] = code_sections[header.id][fileIndex];                
        // Switch to the correct tab
        var tab = code_sections[header.id][fileIndex].tab;
        setActiveTab(tab);                   
        showCorrectCodeBlock(header.id, fileIndex, false);

        // Highlight the code
        var ranges = hotspot.data('highlight-ranges');
        if(ranges){
            ranges = ranges.split(',');
            for(var i = 0; i < ranges.length; i++){
                var lines = ranges[i].split('-');
                if(lines.length === 2){
                    var fromLine = parseInt(lines[0]);
                    var toLine = parseInt(lines[1]);
                    if(fromLine && toLine){   
                        // When multiple ranges are going to be highlighted, only scroll to the first one.                 
                        var shouldScroll = (i === 0);
                        highlight_code_range(code_block, fromLine, toLine, shouldScroll);               
                    }
                }                
            }
        }           
    }
}, 250);

function showGithubPopup(){
    $("#github_clone_popup_container").fadeIn();
    $("#code_column .code_column, #code_column_tabs_container").addClass('dimmed', {duration:400});
    $('.code_column_tab').attr('disabled', true);
    $(".copyFileButton").hide();
    $('#code_column_content').css({
        'overflow-y': 'hidden'
    });
}

function hideGithubPopup(){
    $("#github_clone_popup_container").fadeOut();
    $("#code_column .code_column, #code_column_tabs_container").removeClass('dimmed', {duration:400});
    $('.code_column_tab').attr('disabled', false);
    $(".copyFileButton").show();
    $('#code_column_content').css({
        'overflow-y': 'scroll'
    });
}

/*
   Handle showing/hiding the Github popup.
*/
function handleGithubPopup() {
    var githubPopup = $("#github_clone_popup_container");
    if(githubPopup.length > 0){
        // Check if the first guide section that has code to show on the right has been scrolled past yet.
        // If so, then the Github popup will be dismissed. If the first section hasn't been scrolled past yet but a hotspot is showing on the next section then also hide it.
        var firstCodeSection = $('[data-has-code]').first();
        if(firstCodeSection.length === 0){
            showGithubPopup();
            return;
        }
        if(firstCodeSection.is('h3')){
            firstCodeSection = firstCodeSection.parents('.sect1').find('h2').first();
        }
        var firstCodeSectionTop = Math.round(firstCodeSection[0].getBoundingClientRect().top);
        var navHeight = $('.navbar').height();
        var blurCodeOnRight = (firstCodeSectionTop - navHeight) > 1;

        var firstHotspot = $("#guide_column .hotspot:visible")[0];
        var firstHotspotRect = firstHotspot.getBoundingClientRect();
        var firstHotspotInView = (firstHotspotRect.top > 0) && (firstHotspotRect.bottom <= window.innerHeight);

        // Only show the Github popup if above the first section with code
        // and if hotspots weren't hovered over to reveal the code behind the popup.
        var hotspotHovered = $("#github_clone_popup_container").data('hotspot-hovered');
        if(blurCodeOnRight && !(firstHotspotInView && hotspotHovered)){
            showGithubPopup();
        }
        else{            
            hideGithubPopup();         
        }
    }                
}

// Look through current step's tabs and if a duplicate file was already shown then hide it.
function hideDuplicateTabs(id){
    var visibleTabs = $('#code_column_tabs li:visible');
    var substeps = $("#" + id).parents('.sect1').find('h2, h3');
    var substepIds = [];
    for(var i = 0; i < substeps.length; i++){
        substepIds.push(substeps[i].id);
    }

    // Check to see if any of the visible tabs match the section's tabs
    for(var j = visibleTabs.length-1; j >= 0; --j){
        var tab = $(visibleTabs.get(j));
        var data_id = tab.attr('data-section-id');
        if(!tab.is(":visible")){
            // The tab could have been hidden by a previous iteration so only look for duplicates if it is visible.
            continue;
        }
        var fileName = tab.text();
        var tabsWithSameName = $('#code_column_tabs li:visible').not(tab).filter(function(){
            return this.innerText.trim() === fileName;
        });
        
        if(tabsWithSameName.length > 0){
            // Find duplicates and hide them.
            // The current tab is in this section
            if(substepIds.indexOf(data_id) > -1){  
                var setCurrTabActive = false; 
                if(tabsWithSameName.find('.active').length > 0){
                    // If one of the tabs hidden was active then need to set this tab as active.
                    setCurrTabActive = true;
                }                 
                tabsWithSameName.hide();
                if(setCurrTabActive){
                    setActiveTab(tab);
                }
                continue;
            }
            else{
                // Tab is not part of this section.                    
                for(var k=0; k<tabsWithSameName.length; k++){
                    var tabWithSameName = $(tabsWithSameName.get(k));
                    var data_id2 = tab.attr('data-section-id');
                                           
                    if(substepIds.indexOf(data_id2) > -1){
                        // If other tab is part of this section then hide the current tab                  
                        tab.hide();
                    } else {                               
                        // Tab is not associated with this subsection so hide that one unless it is active.  
                        if(tabWithSameName.find('a').hasClass('active')){
                            continue;
                        }      
                        tabWithSameName.hide();
                    }
                }
            }
            
        }
    }
    // Hide duplicates of the active tab
    var activeTab = $('.code_column_tab > .active').parent();
    var activeDuplicates = $('#code_column_tabs li:visible').not(activeTab).filter(function(){
        return this.innerText.trim() === activeTab.text();
    });
    activeDuplicates.hide();
}

function loadPreviousStepsTabs(){
    // Reveal the files from previous sections in case the user loaded a later step from a bookmarked hash.
    var lastTab = $('#code_column_tabs li:visible').last();
    var previousHiddenTabs = lastTab.prevAll().not(":visible");
    for(var i = previousHiddenTabs.length - 1; i >= 0; --i){
        var tab = previousHiddenTabs.get(i);
        var fileName = tab.innerText.trim();
        // Check that only the most recent tab for this file is showing.
        var visibleTabsWithSameName = $('#code_column_tabs li:visible').filter(function(){
            return this.innerText.trim() === fileName;
        });
        if(visibleTabsWithSameName.length === 0){
            $(tab).show();
        }
    }
}

// Sets the active tab in the code column and moves it to the front of the tab list.
// activeTab: tab to set active
function setActiveTab(activeTab){
    if(activeTab.children('a').hasClass('active')){
        return;
    }
    $('.code_column_tab > a').removeClass('active');
    activeTab.children('a').addClass('active');
    activeTab.show();

    // Adjust the code content to take up the remaining height
    var tabListHeight = $("#code_column_title_container").outerHeight();
    $("#code_column_content").css({
        "height": "calc(100% - " + tabListHeight + "px)"
    });
}

function restoreCodeColumn(){
    if(!inSingleColumnView()){
        $("body").removeClass("unscrollable");
        $("#code_column").css({
            "top": "100px"
        });
        $("#code_column").removeClass("modal");
        remove_highlighting(); // Remove previously highlighted hotspots from mobile view
    }
}

/*
    Hide the comments from the code file including the copyright.
*/
function hide_comments(code_block){
    // Wrap the standalone text in spans so they can be selected between the range of start and end tags
    code_block.find('code').contents().each(function(){
        if (!$(this).is('span')) {
            var newText = $(this).wrap('<span class="string"></span>');
            $(this).replaceWith(newText);
        }
    });

    // Hide the copyright
    var start = code_block.find(".comment:contains('tag::comment[]')");
    start = start.prev('.line-numbers');
    var end = code_block.find(".comment:contains('end::comment[]')");
    if(start.length === 1 && end.length === 1){
        var range = start.nextUntil(end);
        range = range.add(start).add(end);
        range.remove();
    }

    // Hide comments and their line numbers
    code_block.find('.comment').prev('.line-numbers').remove();

    var start_tags = code_block.find('.comment:contains(tag::)');    
    start_tags.each(function(){
        // Wrap the tag in a div for highlighting later
        var text = $(this).text();
        var start_index = text.indexOf('tag::');
        var end_index = text.indexOf('[]');
        var tag_name = text.substring(start_index + 5, end_index);
        var end = $(this).nextAll("span:contains('end::')").first();
        var content = $(this).nextUntil(end);
        // Mark the lines start to end with a data-tag so that the hotspot can highlight them.
        content.attr('data-hotspot-tag', tag_name);
    });

    // Hide start tags
    start_tags.prev('span').remove();
    start_tags.remove();

    // Hide end tags
    var end_tags = code_block.find('.comment:contains(end::)');
    end_tags.next('span').remove();
    end_tags.remove();

    code_block.find('.comment').each(function(){
        $(this).html($(this).html().trim());
    }).css('background-color', 'cyan');

    // Trim extra whitespace
    var code = code_block.find('code');
    code.html(code.html().trim());
}

$(document).ready(function() { 

    $(window).on('resize', function(){
        restoreCodeColumn();
    });
     
     /* Copy button for the github clone command  that pops up initially when opening a guide. */
    $("#github_clone_popup_copy").click(function(event){
        event.preventDefault();
        target = $("#github_clone_popup_repo").get(0);
        copy_element_to_clipboard(target, function(){
            var position = $('#github_clone_popup_container').position();
            $('#code_section_copied_confirmation').css({	
                top: position.top - 20,
                right: 20	
            }).stop().fadeIn().delay(1000).fadeOut();
        });
    });

    // Move the code snippets to the code column on the right side.
    // Each code section is duplicated to show the full file in the right column and just the snippet of code relevant to the guide in the left column in single column / mobile view.
    $('.code_column').each(function(){
        var code_block = $(this);        
        var metadata_sect = code_block.prev().find('p');
        if(metadata_sect.length > 0){
            var fileName = metadata_sect[0].innerText;

            code_block.hide();

            var header = get_header_from_element(code_block);            
            header.setAttribute('data-has-code', 'true');
            var code_section = {};
            code_section.code = code_block;   
            code_section.fileName = fileName;                    

            // Create a title pane for the code section
            code_block.attr('fileName', fileName);

            // Set data attribute for id on the code block for switching to the code when clicking its tab
            code_block.attr('data-section-id', header.id);

            // Hide the comments from the file.
            hide_comments(code_block);

            // Create a tab in the code column for this file.
            var tab = $("<li class='code_column_tab' role='presentation' tabindex='0'></li>");
            tab.attr('data-section-id', header.id);
            var anchor = $("<a>" + fileName + "</a>");
            tab.append(anchor);

            code_section.tab = tab;

            if(!code_sections[header.id]){
                code_sections[header.id] = []; // Create list of code blocks associated with this subsection
            }
            code_sections[header.id].push(code_section);

            // Map the hotspots and tabs in this section to the index of this file in its given guide section.
            var fileIndex = code_sections[header.id].length-1;
            link_hotspots_to_file(code_block, header, fileIndex);
            tab.data('file-index', fileIndex);

            // Remove old title from the DOM
            metadata_sect.detach();            

            // If the same tab exists already in the list, append it in the same order to persist the order it was introduced in the guide.
            var tabAlreadyExists = $('#code_column_tabs li').filter(function(){
                return this.innerText.trim() === fileName;
            });
            if(tabAlreadyExists.length > 0){
                tabAlreadyExists.last().after(tab);
            } 
            else {
                $('#code_column_tabs').append(tab);
            }            

            code_block.addClass('dimmed'); // Dim the code at first while the github popup takes focus.
            code_block.appendTo('#code_column_content'); // Move code to the right column
        }
    });

        

    // Map the guide sections that don't have any code sections to the previous section's code. This assumes that the first section is what you'll learn which has no code to show on the right to begin with.
    var sections = $('.sect1:not(#guide_meta):not(#related-guides) > h2, .sect2:not(#guide_meta):not(#related-guides) > h3');
    var first_section = sections[0];
    var first_code_block = $("#code_column .code_column").first();    
    var first_code_section = {};
    first_code_section.code = first_code_block;
    first_code_section.tab = $('.code_column_tab').first();
    code_sections[first_section.id] = [];
    code_sections[first_section.id].push(first_code_section);
    
    for(var i = 1; i < sections.length; i++){
        var id = sections[i].id;
        if(!code_sections[id]){
            var previous_id = sections[i-1].id;
            code_sections[id] = [];
            for(var j = 0; j < code_sections[previous_id].length; j++){
                code_sections[id].push(code_sections[previous_id][j]);
            }                        
        }
    }    

    // Hide all code blocks except the first
    $('#code_column .code_column:not(:first)').hide();
    $('.code_column_tab').hide();
    setActiveTab($('.code_column_tab').first());

    // Load the correct tab when clicking
    $('.code_column_tab').on('click', function(){
        if(!$(this).attr('disabled')){
            var fileIndex = $(this).data('file-index');
            setActiveTab($(this));

            // Show the code block
            var data_id = $(this).attr('data-section-id');
            var code_block = $($("#code_column .code_column[data-section-id='" + data_id + "']").get(fileIndex));
            // Save the code section for later when the user comes back to this section and we want to show the most recent code viewed.
            recent_sections[data_id] = code_sections[data_id][fileIndex];
            $('#code_column .code_column').not(code_block).hide();
            code_block.show();
        }
    });

    $('.code_column_tab').on('keydown', function(e){
        if(e.which === 13){
            $(this).trigger('click');
        }
    });    

    // Parse the hotspot lines to highlight and store them as a data attribute.
    $('code[class*=hotspot], span[class*=hotspot], div[class*=hotspot]').each(function(){
        var snippet = $(this);
        var classList = this.classList;
        var ranges;

        // Find if the hotspot has a file index set to override the default behavior.
        for(var i = 0; i < classList.length; i++){
            if(classList[i].indexOf('file=') === 0){
                var fileIndex = classList[i].substring(5);
                snippet.data('file-index', parseInt(fileIndex));
            }
        }

        var code_block = get_code_block_from_hotspot(snippet);

        for(i = 0; i < classList.length; i++){
            var className = classList[i];
            if(className.indexOf('hotspot') === 0){
                var fromLine, toLine;
                if(className.indexOf('hotspot=') === 0){
                    // Check if the hotspot is a number or tag
                    var value = className.substring(8);
                    var isNumber = /^[0-9]$/.test(value.charAt(0));
                    if(isNumber){
                        if(value.indexOf('-') > -1){
                            var lines = value.split('-');
                            fromLine = parseInt(lines[0]);
                            toLine = parseInt(lines[1]);
                            ranges = value;
                        } 
                        else {
                            // Only one line to highlight.
                            fromLine = parseInt(value);
                            toLine = parseInt(value);
                            ranges = fromLine + "-" + toLine;
                        }                        
                    }
                    else {
                        // Hotspot is using a tag name.
                        // Find the start line for the tag using tag::<tag_name>[] and the end line for the tag using end::<tag_name>[]
                        var tag_start = code_block.find("span[data-hotspot-tag='" + value + "']").first();
                        var tag_end = code_block.find("span[data-hotspot-tag='" + value + "']").last();
                        fromLine = parseInt(tag_start.next('.line-numbers').text());
                        toLine = parseInt(tag_end.prev('.line-numbers').text()) - 1;                        
                        ranges = fromLine + "-" + toLine;

                        // Trim the extra whitespace in the code
                        var code = code_block.find('code');
                        code.html(code.html().trim());
                    }

                    // Set data attributes to save the lines to highlight
                    if(snippet.data('highlight-ranges')){
                        // Add lines to the hotspot
                        var old_ranges = snippet.data('highlight-ranges');
                        old_ranges += "," + ranges;
                        snippet.data('highlight-ranges', old_ranges);                    
                    }
                    else {
                        snippet.data('highlight-ranges', ranges);
                    }                    
                }                                    
                snippet.addClass('hotspot');
            }              
        }
    });  
    
    // In mobile view if the user clicks a hotspot it shows a modal of the file with the hotspot code highlighted.
    $('.hotspot').on('click', function(){
        if(inSingleColumnView()){
            $("body").addClass("unscrollable");   
            $("#mobile_toc_accordion_container").css({
                "pointer-events" : "none"
            });         
            $("#code_column").addClass("modal");
            

            var top = $(this).offset().top;
            var mobile_toc_height = $("#mobile_toc_accordion").height();
            var scrollTo = top - mobile_toc_height;
            
            // Scroll the hotspot to the top of the page, with the paragraph encompassing the hotspot shown.
            $('html, body').stop().animate({
                scrollTop: scrollTo
            }, 400);

            // Set the top of the code to appear underneath the hotspot that was clicked.
            var hotspot_height = $(this).height();
            var bottom = scrollTo + window.innerHeight - hotspot_height - 5;
            var height = bottom - scrollTo;
            $("#code_column").css({
                "top" : scrollTo + mobile_toc_height + hotspot_height + 5 + "px",
                "height" : height
            });
            handleHotspotHover($(this));
        }
    });

    $('#dismiss_button').on('click', function(){
        $("body").removeClass("unscrollable");
        $("#mobile_toc_accordion_container").css({
            "pointer-events" : "auto"
        });
        $("#code_column").removeClass("modal");
        $("#code_column").css({
            "height" : 'auto'
        });
        remove_highlighting();
    });

    // When hovering over a code hotspot, highlight the correct lines of code in the corresponding code section.
    $('.hotspot').on('hover mouseover', function(){
        if(inSingleColumnView()){
            return;
        }
        $(this).data('hovering', true);
        handleHotspotHover($(this));
    });

    // When the mouse leaves a code 'hotspot', remove all highlighting in the corresponding code section.
    $('.hotspot').on('mouseleave', function(){
        if(inSingleColumnView()){
            return;
        }
        $(this).data('hovering', false);
        remove_highlighting();
    });       

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
        var codeColumn = $("#code_column")[0];
        var codeColumnContent = $("#code_column_content").get(0);

        if(!(this.scrollTop > 0 || this.offsetHeight > codeColumnContent.offsetHeight)){
            // Element is not scrollable. If the code file has no scrollbar, the page will still scroll if the event is propagated to the window scroll listener so we need to prevent propagation.
            event.stopPropagation();
            event.preventDefault();
        }

        // If the code column is at the top and the browser is scrolled down, the element has no scrollTop and does not respond to changing its scrollTop.
        else if(!(dir == 'down' && this.parentElement.scrollTop === 0)){
            var delta = event0.wheelDelta || -event0.detail || -event0.deltaY;
            // Firefox's scroll value is always 1 so multiply by 150 to scroll faster.
            if(delta === 1 || delta === -1){
                delta *= 150;
            }
            codeColumnContent.scrollTop -= delta;
            handleGithubPopup();
            event.preventDefault();  
            event.stopPropagation();
        }            
    });

    // Set the github clone popup top to match the first section
    var firstSection = $(".sect1:not(#guide_meta)").first();
    if(firstSection.length > 0){
        var firstSectionTop = firstSection.get(0).offsetTop;
        $("#github_clone_popup_container").css('top', firstSectionTop);
    }

    $(".copyFileButton").click(function(event){
        event.preventDefault();
        // Remove the line numbers from being copied.
        var target_copy = $("#code_column .code_column:visible .content code").clone();
        target_copy.find('.line-numbers').remove();
        target = target_copy[0];
        copy_element_to_clipboard(target, function(){
            var current_target_object = $(event.currentTarget);
            var position = current_target_object.position();	
            $('#code_section_copied_confirmation').css({	
                top: position.top + 42,	
                right: 25	
            }).stop().fadeIn().delay(1000).fadeOut();
        });
    });

    // Handle enter key presses on the copy file button
    $(".copyFileButton").on('keypress', function(event){
        // Enter key
        if(event.key === "Enter"){
            $(this).trigger('click');
        }
    });  

    $(window).on('scroll', function(event) {
        // Check if a scroll animation from another piece of code is taking place and prevent normal behavior.
        if($("body").data('scrolling') === true){
            return;
        }
        handleGithubPopup();
    });

    $(window).on('load', function(){
        resizeGuideSections();

        if (location.hash){
            var hash = location.hash;
            showCorrectCodeBlock(hash.substring(1), null, true);  // Remove the '#' in front of the id
            loadPreviousStepsTabs();
        }

        if(window.location.hash === ""){
            handleGithubPopup();
        }
    });
});
