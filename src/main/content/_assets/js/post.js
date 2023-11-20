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

var preTags = document.querySelectorAll('pre');
for (var i = 0; i < preTags.length; i++) {
  var preTag = preTags[i];
  preTag.setAttribute('tabindex', '0');
}

// set up html for copy code block accessibility
var code_blocks_with_copy_to_clipboard = 'pre:not(.no_copy pre)'; // CSS Selector
$(document).ready(function () {
    $(code_blocks_with_copy_to_clipboard).each(function (){
        $(this).wrap('<div class="code_block_wrapper" title="Code block"></div>');  
    })
    $('.code_block_wrapper').each(function (){
        $(this).prepend('<div class="copied_confirmation">Copied to clipboard</div><input type="image" class="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block"/>');
    });

    $('#article_body a').each(function() {
        var link = $(this);
        if (link.prop('hostname') === window.location.hostname) {
         return;
        } else {
          link.addClass('external');
        }
      });
})


