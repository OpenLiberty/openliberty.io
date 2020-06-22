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
    post_name = path.substring(17).replace('.html', '');

    var tags_html = "";
    $.each(data.blog_tags, function(j, tag) {
        if (tag.posts.indexOf(post_name) > -1) {
            tags_html = '<a href="/blog/?search=' + tag.name + '" class="post_tag">' + tag.name + '</a>' + '<span>, </span>';
            $(".post_tags_container").append(tags_html);
        }
    });

});

$('pre').on('mouseenter', function(event) {
    target = event.currentTarget;
    var copy_code = '<div id="copied_confirmation"></div><img id="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block">';
    $(this).append(copy_code);
    $('#copy_to_clipboard').css({
        top: 0,
        right: 0
    });
    $('#copy_to_clipboard').stop().fadeIn();

}).on('mouseleave', function(event) {	
    $('#copied_confirmation').remove();
    $('#copy_to_clipboard').remove();
    $('#copy_to_clipboard').stop().fadeOut();
    $('#guide_section_copied_confirmation').stop().fadeOut();
});

$(document).on("click","#copy_to_clipboard", function(event) {
    event.preventDefault();
    // Target was assigned while hovering over the element to copy.
    copy_element_to_clipboard(target, function(){
        $('#copied_confirmation').text("Copied to clipboard");
        var current_target_object = $(event.currentTarget);
        var position = current_target_object.position();
        $('#copied_confirmation').css({	
            top: position.top - 18,
            right: 0	
        }).stop().fadeIn().delay(3500).fadeOut();
    });	
});

/* Copy the target element to the clipboard
target: element to copy
callback: function to run if the copy is successful
*/
function copy_element_to_clipboard(target, callback){
    // IE
    if(window.clipboardData){
        window.clipboardData.setData("Text", target.innerText);
    } 
    else{
        var temp = $('<textarea>');
        temp.css({
            position: "absolute",
            left:     "-1000px",
            top:      "-1000px",
        });       
        
        // Create a temporary element for copying the text.
        // Prepend <br> with newlines because jQuery .text() strips the <br>'s and we use .text() because we don't want all of the html tags copied to the clipboard.
        var text = $(target).clone().find('br').prepend('\r\n').end().text().trim();
        temp.text(text);
        $("body").append(temp);
        temp.trigger('select');
        
        // Try to copy the selection and if it fails display a popup to copy manually.
        if(document.execCommand('copy')) { 
            callback();
        } else {
            alert('Copy failed. Copy the command manually: ' + target.innerText);
        }
        temp.remove(); // Remove temporary element.
    }
}