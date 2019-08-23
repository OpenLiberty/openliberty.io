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

 $(document).ready(function() {
    
    var offset;	
    var target;	
    var target_position;	
    var target_width;	
    var target_height;

    $('#preamble').detach().insertAfter('#duration_container');  

    // Read prereqs from json file and add to html
    $.getJSON( "../../guides/guides-common/guide_prereqs.json", function(data) {
        var guide_name = window.location.pathname.replace('.html','').replace('/guides/', '');
        var prereq_html = '';
        $.each(data.prereqs, function(i, prereq) {
            // if guide found in prereqs list, add it to the html
            if (prereq.guides.indexOf(guide_name) > -1) {
                prereq_html += '<div class="prereq_div"><a href=' + '"' + prereq.link + '"' + ' class="prereq" target="_blank">' + prereq.name + '</a></div>';
            }
            // if prereqs list contains * add prereq to all guides except for excluded guides (if they exist)
            else if (prereq.guides.indexOf("*") > -1) {
                if (prereq.exclude) {
                    // if guide not in prereq exclude list, add it to the html
                    if (prereq.exclude.indexOf(guide_name) <= -1) {
                        prereq_html += '<div class="prereq_div"><a href=' + '"' + prereq.link + '"' + ' class="prereq" target="_blank">' + prereq.name + '</a></div>'; 
                    }
                }
                // guides has * but no exclude, add all to html
                else {
                    prereq_html += '<div class="prereq_div"><a href=' + '"' + prereq.link + '"' + ' class="prereq" target="_blank">' + prereq.name + '</a></div>'; 
                }
            }
        });

        $(".prereqs_list").html(prereq_html);
    });

    function handleSectionChanging(event){
        // Get the id of the section most in view
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
                // section.  replaceState updates the URL without causing an
                // onHashChange event.
                history.replaceState(null, null, newPath);

                // Update the selected TOC entry
                updateTOCHighlighting(id);                    
            }
            if(window.innerWidth > twoColumnBreakpoint) {
                // multipane view
                // Match the code block on the right to the new id
                if(typeof(showCorrectCodeBlock) === "function"){
                    showCorrectCodeBlock(id, null, true);
                }
            }
        }
    }

    $('#guide_content pre:not(.no_copy pre):not(.code_command pre):not(.hotspot pre)').hover(function(event) {
        offset = $('#guide_column').position();	
        target = event.currentTarget;	
        var current_target_object = $(event.currentTarget);	
        target_position = current_target_object.position();	
        target_width = current_target_object.outerWidth();	
        target_height = current_target_object.outerHeight();
        var right_position = inSingleColumnView() ? 1 : 46;
         $('#copy_to_clipboard').css({	
            top: target_position.top + 1,	
            right: parseInt($('#guide_column').css('padding-right')) + right_position	
        });	
        $('#copy_to_clipboard').stop().fadeIn();	
     }, function(event) {	
        if(offset){
            var x = event.clientX - offset.left;	
            var y = event.clientY - offset.top + $(window).scrollTop();	
            if(!(x > target_position.left	
            && x < target_position.left + target_width	
            && y > target_position.top	
            && y < target_position.top + target_height)) {	
                $('#copy_to_clipboard').stop().fadeOut();	
                $('#guide_section_copied_confirmation').stop().fadeOut();	
            }
        }          	
     });	

     $('#copy_to_clipboard').click(function(event) {
        event.preventDefault();
        // Target was assigned while hovering over the element to copy.
        copy_element_to_clipboard(target, function(){
            var current_target_object = $(event.currentTarget);
            var position = current_target_object.position();	
            $('#guide_section_copied_confirmation').css({	
                top: position.top - 18,
                right: inSingleColumnView() ? 20 : 50	
            }).stop().fadeIn().delay(3500).fadeOut();
        });	
    });

    // show content for clicked OS tab
    $('.tab_link').click(function(event) {
        // hide all tab content and remove active class from all links
        $(".tab_content").hide();
        $(".tab_link").removeClass("active");
        
        // get class of clicked tab and class of its respective content section
        var class_list = this.classList;
        for (var i = 0; i < class_list.length; i++) {
            var class_name = class_list[i];
            if (class_name !== "tab_link" && class_name.indexOf("_link") > -1) {
                var tab_content = "." + class_name.replace("link", "section");
                var tab_class = "." + class_name;
            }
        }

        // show content of clicked tab and add active class to clicked tab
        $(tab_content).show();
        $(tab_class).addClass("active");
    });

    // determine user's operating system and show prerequisite instructions for that OS
    function setDefaultTab() {
        // set default OS to windows
        var OSName = "windows";
        // get user's operating system
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf("win") != -1) {
            OSName = "windows";
        }
        if (ua.indexOf("mac") != -1) {
            OSName = "mac";
        }
        if (ua.indexOf("linux") != -1) {
            OSName = "linux";
        }
        // hide tab content except for selected tab and add active class to selected tab
        var os_section = "." + OSName + "_section";
        var os_class = "." + OSName + "_link";
        $(".tab_content").hide();
        $(os_section).show();
        $(os_class).addClass("active");
    }

    $(window).on('scroll', function(event) {
        // Check if a scroll animation from another piece of code is taking place and prevent normal behavior.
        if($("body").data('scrolling') === true){
            return;
        }
        handleSectionChanging(event);
    });

    $(window).on('load', function(){
        createEndOfGuideContent();
        setDefaultTab();

        if (location.hash){
            handleFloatingTableOfContent();
            var hash = location.hash;
            accessContentsFromHash(hash);
        }
    });
});
