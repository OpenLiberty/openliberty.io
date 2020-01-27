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
}

// Highlights a block of code in a code section
// Input code_section: The section of code to highlight.
//       from_line: Integer for what line to start highlighting from.
//       to_line: Integer for what line to end highlighting.
//       scroll: boolean if the code should be scrolled to
function highlight_code_range(code_section, fromLine, toLine, scroll){  
    // Wrap code block lines in a div to highlight
    var highlightStart = code_section.find('.line-numbers').filter(function(){
        return parseInt(this.innerText.trim()) === fromLine;        
    });
    var highlightEnd = code_section.find('.line-numbers').filter(function(){
        return parseInt(this.innerText.trim()) === toLine;
    });
    if(highlightEnd.length === 0){
        var lastLine = parseInt(code_section.find('.line-numbers').last().text().trim());
        // If the line number after the last line to highlight was a tag, then search for the next line number.
        while(highlightEnd.length === 0 && toLine < lastLine){
            toLine = toLine + 1;
            highlightEnd = code_section.find('.line-numbers').filter(function(){
                return parseInt(this.innerText.trim()) === toLine;
            });
        }
    }
    var range = highlightStart.nextUntil(highlightEnd);
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
    $("#prereqs_container").data('hotspot-hovered', true); // Track if a hotspot was hovered over to hide the prereqs popup
    hidePrereqsPopup();
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
                        highlight_code_range(code_block, fromLine, toLine + 1, shouldScroll);               
                    }
                }                
            }
        }           
    }
}, 250);

function showPrereqsPopup(){
    $("#prereqs_container").fadeIn();
    $("#code_column .code_column, #code_column_tabs_container").addClass('dimmed', {duration:400});
    $('.code_column_tab').attr('disabled', true);
    $(".copyFileButton").hide();
    $('#code_column_content').css({
        'overflow-y': 'hidden'
    });
}

function hidePrereqsPopup(){
    $("#prereqs_container").fadeOut();
    $("#code_column .code_column, #code_column_tabs_container").removeClass('dimmed', {duration:400});
    $('.code_column_tab').attr('disabled', false);
    $(".copyFileButton").show();
    $('#code_column_content').css({
        'overflow-y': 'scroll'
    });
}

/*
   Handle showing/hiding the prereqs popup.
*/
function handlePrereqsPopup() {
    var prereqsPopup = $("#prereqs_container");
    if(prereqsPopup.length > 0){
        // Check if the first guide section that has code to show on the right has been scrolled past yet.
        // If so, then the prereqs popup will be dismissed. If the first section hasn't been scrolled past yet but a hotspot is showing on the next section then also hide it.
        var firstCodeSection = $('[data-has-code]').first();
        if(firstCodeSection.length === 0){
            showPrereqsPopup();
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

        // Only show the prereqs popup if above the first section with code
        // and if hotspots weren't hovered over to reveal the code behind the popup.
        var hotspotHovered = $("#prereqs_container").data('hotspot-hovered');
        if(blurCodeOnRight && !(firstHotspotInView && hotspotHovered)){
            showPrereqsPopup();
        }
        else{            
            hidePrereqsPopup();         
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
    Parse the start/end tags in the code file.
    If the asciidoc specifies to remove a certain tag then remove the tag and its contents.
    Otherwise, mark the contents of the tag for highlighting later and remove the start and end tag.
*/
function parse_tags(code_block){
    // Wrap the standalone text in spans so they can be selected between the range of start and end tags using jQuery's nextUntil()
    code_block.find('code').contents().each(function(){
        if (!$(this).is('span')) {
            var newText = $(this).wrap('<span class="string"></span>');   
            $(this).replaceWith(newText);           
        }
    });

    // Remove the line numbers before the start/end tags and space between the line numbers and start/end tags
    code_block.find("span:contains('tag::'), span:contains('end::')").each(function(){
        var line_num = $(this).prevAll('.line-numbers').first();
        line_num.nextUntil($(this)).addBack().remove();
    });

    // Parse the tags that should be hidden.
    var hideList;
    var classList = code_block[0].classList;
    for(var i=0; i < classList.length; i++){
        if(classList[i].indexOf("hide_tags=") > -1){
            hideList = classList[i].substring(10).split(",");
            break;
        }
    }

    var start_tags = code_block.find('span:contains(tag::)');
    var end_tags = code_block.find('span:contains(end::)');
    
    start_tags.each(function(){
        var text = $(this).text();
        var start_index = text.indexOf('tag::') + 5;
        var end_index = text.indexOf('[]');
        var tag_name = text.substring(start_index, end_index);
        var end = $(this).nextAll("span:contains('end::" + tag_name + "')").first();
        var content = $(this).nextUntil(end);

        // Check if the tag should be hidden
        var hide = false;
        if(hideList){
            for(var i=0; i<hideList.length; i++){
                if(hideList.indexOf(tag_name) > -1){
                    hide = true;
                    break;
                }
            }
        }        
        // If the tag is in the list of tags that should be hidden then hide it instead of just marking it.
        if(hide){
            content.remove();
        }
        else {
            // Mark the lines start to end with a data-tag so that the hotspot can highlight them.
            content.each(function(){
                // Check if element already has a tag.
                var tag = $(this).attr('data-hotspot-tag');
                if(tag){
                    // Add a comma delimited list of tags so that nested tags can work.
                    tag = tag + "," + tag_name;
                    $(this).attr('data-hotspot-tag', tag);
                }
                else {
                    $(this).attr('data-hotspot-tag', tag_name);
                }
            });
        }
    });

    // Remove the whitespace after the start and end tags up until the next line number.
    start_tags.add(end_tags).each(function(){
        var next_line_num = $(this).nextAll('.line-numbers').first();
        if(next_line_num.length > 0){
            var empty_space = $(this).nextUntil(next_line_num);
            empty_space.remove();
        }        
    });

    start_tags.remove();
    end_tags.remove();

    // Trim extra whitespace
    var code = code_block.find('code');
    code.html(code.html().trim());
}


$(document).ready(function() { 

    $(window).on('resize', function(){
        restoreCodeColumn();
    });

    // Move the code snippets to the code column on the right side.
    // Each code section is duplicated to show the full file in the right column and just the snippet of code relevant to the guide in the left column in single column / mobile view.
    $('.code_column').each(function(){
        var code_block = $(this);
        
        // Add extra line number at the end of the code block
        // This prevents whitespace from getting highlighted when there are nested tags at the end of a file
        var hiddenNode = document.createElement('span');
        hiddenNode.className = 'line-numbers';
        var lastLine = parseInt(code_block.find('.line-numbers').last().text().trim());
        hiddenNode.innerHTML = lastLine + 1;
        code_block.find('code')[0].appendChild(hiddenNode);

        var metadata_sect = code_block.prev().find('p');
        if(metadata_sect.length > 0){
            var fileName = metadata_sect[0].innerText;

            // code_block.hide();
            $('#code_column .code_column:not(:first)').hide();

            var header = get_header_from_element(code_block);            
            header.setAttribute('data-has-code', 'true');
            var code_section = {};
            code_section.code = code_block;   
            code_section.fileName = fileName;                    

            // Create a title pane for the code section
            code_block.attr('fileName', fileName);

            // Set data attribute for id on the code block for switching to the code when clicking its tab
            code_block.attr('data-section-id', header.id);

            // Parse out the tags in the code file.
            parse_tags(code_block);

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

            code_block.addClass('dimmed'); // Dim the code at first while the prereqs popup takes focus.
            code_block.appendTo('#code_column_content'); // Move code to the right column
        }
    });

    // Add file path to title attribute for code column tabs
    // get project id of guide and build request url to get readme for guide
    project_id = window.location.pathname.replace("/guides/", "").replace(".html", "");
    request_url = "https://api.github.com/repos/OpenLiberty/guide-" + project_id + "/readme";

    $.ajax({
        headers: {          
            Accept: "application/vnd.github.v3.raw" 
        }, 
        url: request_url,
        type: "GET",
        success: function(response) {
            // create array that contains paths to files
            var path_array = [];
            var match;
            re = /include::finish(\/.+)+(\.[a-z]+)?/g;
            while ((match = re.exec(response)) != null) {
                path_array.push(match[0].replace("include::finish/", "").replace(/ *\[[^\]]*]/g, ""));
            }

            // add titles to code column tabs
            $('.code_column_tab').each(function() {
                tab_name = ($(this).find("a")).text();

                // check if file name in tab is found in array of paths
                found = path_array.find(function(el) {
                    return el.includes(tab_name);
                });
                
                // if not found in array and file name contains slash, use tab text as title
                // if found in array, then use path as title
                if (!found && tab_name.indexOf("/" > -1)) {
                    $(this).attr('title', tab_name);
                }
                else {
                    $(this).attr('title', found);
                }
            });
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
                        // Hotspot is a tag name.
                        // Find the start line for the tag using tag::<tag_name>[] and the end line for the tag using end::<tag_name>[]
                        var line_numbers = code_block.find(".line-numbers[data-hotspot-tag]").filter(function(){
                            var hotspot_tag = $(this).attr("data-hotspot-tag");
                            var tags = hotspot_tag.split(",");
                            for(var i =0; i <tags.length; i++){
                                var tag = tags[i];
                                if(tag === value){
                                    return true;
                                }
                            }
                            return false;
                        });
                        var tag_start = line_numbers.first();
                        var tag_end = line_numbers.last();

                        fromLine = parseInt(tag_start.text());
                        toLine = parseInt(tag_end.text());                     
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

    $('#code_column').on('mouseenter', function() {
        if(!inSingleColumnView()){
            var page_width = window.innerWidth; // Page width with scrollbar
            var document_width = document.documentElement.clientWidth; // Page width without scrollbar  
            var scrollbar_width = page_width - document_width;
            if(scrollbar_width <= 0){
                return;
            }

            // Adjust the body with padding to account for no scrollbar
            $("html").css("padding-right", scrollbar_width);
            $("html").addClass("unscrollable");

            // Move code column to the left to adjust its position with no scrollbar.
            $("#code_column").css("left", "calc(100% - " + (780 + scrollbar_width) + "px)");
        }        
    }).on('mouseleave', function() {
        if(!inSingleColumnView()){
            $("html").removeClass("unscrollable");
            $("html").css("padding-right", 0);            
            $("#code_column").css("left", "calc(100% - 780px)");
        }
    });

    // Set the prereqs popup top to match the first section
    var firstSection = $(".sect1:not(#guide_meta)").first();
    if(firstSection.length > 0){
        var firstSectionTop = firstSection.get(0).offsetTop;
    }

    $(".copyFileButton").on('click', function(event){
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
        handlePrereqsPopup();
    });
});

$(window).on("load", function(){
    $.ready.then(function(){
       // Both ready and loaded
       console.log("load called in guide-multipane.js (ready and loaded)");
        resizeGuideSections();

        if (location.hash){
            var hash = location.hash;
            showCorrectCodeBlock(hash.substring(1), null, true);  // Remove the '#' in front of the id
            loadPreviousStepsTabs();
        }

        if(window.location.hash === ""){
            handlePrereqsPopup();
        }
    });
 })
