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
$(document).ready(function () {
    $(code_blocks_with_copy_to_clipboard).each(function (){
        $(this).wrap('<div class="code_block_wrapper" title="Code block"></div>');  
    })
    $('.code_block_wrapper').each(function (){
        $(this).prepend('<div id="copied_confirmation">Copied to clipboard</div><input type="image" id="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block"/>');
    });
    $(document).on("click", "#copy_to_clipboard", function(event) {
        event.preventDefault();
        target = $(this).siblings(code_blocks_with_copy_to_clipboard);
        openliberty.copy_element_to_clipboard(target, function(){});
        $(this).prev().fadeIn().delay(1000).fadeOut()
    });
})
