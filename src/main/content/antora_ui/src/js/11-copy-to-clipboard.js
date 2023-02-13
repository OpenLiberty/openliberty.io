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

var code_blocks_with_copy_to_clipboard = 'pre:not(.no_copy pre)'; // CSS Selector
$(document).ready(function () {
    $(code_blocks_with_copy_to_clipboard).each(function (){
        $(this).wrap('<div class="code_block_wrapper" title="Code block"></div>');  
    })
    $('.code_block_wrapper').each(function (){
        $(this).prepend('<div id="copied_confirmation">Copied to clipboard</div><input type="image" id="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block"/>');
    });

    // Copy target element and show copied confirmation when copy to clipboard button clicked
    $(document).on("click", "#copy_to_clipboard", function(event) {
        event.preventDefault();
        target = $(this).siblings(code_blocks_with_copy_to_clipboard);
        copy_element_to_clipboard(target, function(){});
        $(this).prev().fadeIn().delay(1000).fadeOut()
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
            // Remove <b> tags that contain callouts
            var text = $(target).clone().find('br').prepend('\r\n').end().find("b").remove().end().text().trim();
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
});