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

    $("#mobile_github_clone_popup_copy").click(function(event){
        event.preventDefault();
        target = $("#mobile_github_clone_popup_repo > span").get(0);
        copy_element_to_clipboard(target, function(){
            var current_target_object = $(event.currentTarget);
            var position = current_target_object.position();	
            $('#guide_section_copied_confirmation').css({	
                top: position.top - 20,	
                right: 25	
            }).stop().fadeIn().delay(1000).fadeOut();
        });
    });

    $("#github_clone_popup_copy, #mobile_github_clone_popup_copy").on('keydown', function(event){
        if(event.which === 13 || event.keyCode === 13){
            $(this).trigger('click');
        }
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
        var last_paragraph = $(this).prevAll(".paragraph:not(.tab_link)").first();
        var next_paragraph = $(this).nextAll(".paragraph:not(.tab_link)").first();
        var tab_contents = last_paragraph.nextUntil(next_paragraph, ".tab_content");
        var tab_links = last_paragraph.nextUntil(next_paragraph, ".tab_link");

        // if no previous paragraphs use siblings instead
        if (!(last_paragraph[0])) {
            tab_contents = $(this).siblings(".tab_content");
            tab_links = $(this).siblings(".tab_link");
        }

        tab_contents.hide();

        tab_links.removeClass("active");
        
        // show content of clicked tab and add active class to clicked tab
        var class_list = this.classList;
        for(var i = 0; i < class_list.length; i++){
            var class_name = class_list[i];
            if(class_name !== "tab_link" && class_name.indexOf("_link") > -1){
                var tab_content = class_name.replace("link", "section");
                var content = tab_contents.filter(function(){
                    return $(this).hasClass(tab_content);
                });
                $(content).show();
                break;
            }
        }
        
        $(this).addClass("active");
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
