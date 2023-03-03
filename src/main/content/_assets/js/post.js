/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

// Read tags from json file and add tag to class
$.getJSON( "../../../../blog_tags.json", function(data) {
    var path = $(location).attr('pathname');
    var post_name = getPostName(path)

    var tags_html = "";
    $.each(data.blog_tags, function(j, tag) {
        if (tag.posts.indexOf(post_name) > -1) {
            tags_html = '<a href="/blog/?search=' + tag.name.replace(" ", "_") + '" class="post_tag blue_link_light_background">' + tag.name + '</a>' + '<span>, </span>';
            $(".post_tags_container").append(tags_html);
        }
    });

});

function getPostName(path) {
    var filename = getFilename(path);
    var post_name = removeFileExtension(filename);
    return post_name;
}

function getFilename(uri) {
    return uri.split('/').pop();
}

function removeFileExtension(filename) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename
}

var code_blocks_with_copy_to_clipboard = 'pre:not(.no_copy pre)'; // CSS Selector

// Show copy to clipboard button when mouse enters code block lacking the .no_copy className
$(code_blocks_with_copy_to_clipboard).on('mouseenter', function(event) {
    target = $(event.currentTarget);
    $('main').append('<div id="copied_confirmation">Copied to clipboard</div><img id="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block">');
    $('#copy_to_clipboard').css({
        top: target.offset().top + 1,
        right: $(window).width() - (target.offset().left + target.outerWidth()) + 1
    }).stop().fadeIn();
// Hide copy to clipboard button when mouse leaves code block (unless mouse enters copy to clipboard button)
}).on('mouseleave', function(event) {
    var x = event.clientX;
    var y = event.clientY + $(window).scrollTop();
    var copy_button_top = $('#copy_to_clipboard').offset().top;
    var copy_button_left = $('#copy_to_clipboard').offset().left;
    var copy_button_bottom = copy_button_top + $('#copy_to_clipboard').outerHeight();
    var copy_button_right = $('#copy_to_clipboard').offset().left + $('#copy_to_clipboard').outerWidth();
    
    if(!(x > copy_button_left
        && x < copy_button_right	
        && y > copy_button_top	
        && y < copy_button_bottom)) {
        $('#copied_confirmation').remove();
        $('#copy_to_clipboard').remove();
        $('#copy_to_clipboard').stop().fadeOut();
    }
});

// Copy target element and show copied confirmation when copy to clipboard button clicked
$(document).on("click", "#copy_to_clipboard", function(event) {
    event.preventDefault();
    // Target was assigned while hovering over the element to copy.
    openliberty.copy_element_to_clipboard(target, function(){
        $('#copied_confirmation').css({	
            top: target.offset().top - 15,
            right: $(window).width() - (target.offset().left + target.outerWidth()) + 1
        }).stop().fadeIn().delay(3500).fadeOut();
    });	
});
