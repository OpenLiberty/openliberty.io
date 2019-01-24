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
    var target;
    $('#preamble').detach().insertAfter('#duration_container');
    

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
            if(!document.execCommand('copy')) {
                alert('Copy failed. Copy the command manually: ' + target.innerText);
            } 
            temp.remove(); // Remove temporary element.
        }               
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
                // section.  pushState updates the URL without causing an
                // onHashChange event.
                history.pushState(null, null, newPath);

                // Update the selected TOC entry
                updateTOCHighlighting(id);                    
            }
            // Steven call the code file now
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
         $('.copy_to_clipboard').css({	
            top: target_position.top + 8,	
            right: parseInt($('#guide_column').css('padding-right')) + 55	
        });	
        $('.copy_to_clipboard').stop().fadeIn();	
     }, function(event) {	
        if(offset){
            var x = event.clientX - offset.left;	
            var y = event.clientY - offset.top + $(window).scrollTop();	
            if(!(x > target_position.left	
            && x < target_position.left + target_width	
            && y > target_position.top	
            && y < target_position.top + target_height)) {	
                $('.copy_to_clipboard').stop().fadeOut();	
                $('#guide_section_copied_confirmation').stop().fadeOut();	
            }
        }          	
     });	

     $('.copy_to_clipboard').click(function(event) {	        	
        event.preventDefault();	
        window.getSelection().selectAllChildren(target);	
        if(document.execCommand('copy')) {	
            window.getSelection().removeAllRanges();	
            var current_target_object = $(event.currentTarget);	
            var position = current_target_object.position();	
            $('#guide_section_copied_confirmation').css({	
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
        handleSectionChanging(event);
    });

    $(window).on('load', function(){
        createEndOfGuideContent();

        if (location.hash){
            handleFloatingTableOfContent();
            var hash = location.hash;
            accessContentsFromHash(hash);
        }
    });
});
