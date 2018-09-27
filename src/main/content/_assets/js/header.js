/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
$(document).ready(function(){
    $('#navbar_responsive_button').on('click', function(){
        $(this).toggle();
        $('#mobile_close_button').toggle();
        $('#navbar').toggle();
        $('.navbar').toggleClass('open');
    });

    $('#mobile_close_button').on('click', function(){
        $('#navbar_responsive_button').trigger('click');
    });

    $('#mobile_close_button').on('keydown', function(event){
        // Enter key
        if(event.which == 13){
            $(this).click();
        }      
    });

    /* Open the dropdown menu when hovering over the dropdown list item */
    $('.dropdown_container').on('hover mouseover', function(){
        if(!$(this).hasClass('open')){
            $(this).toggleClass('open');
        }        
    });

    /* Close the dropdown once the mouse leaves the dropdown list item */
    $('.dropdown_container').on('hoveroff mouseout', function(){
        if($(this).hasClass('open')){
            $(this).toggleClass('open');
        }
    });

    // Toggle between down caret and up caret.
    // If focusout is set, then the button was clicked out of so reset to a down caret.
    var toggleDropdownIcon = function(dropdownMenu, focusout){
        // Check if the dropdown menu is open or closed
        var button = dropdownMenu.find('button');
        var open = button.attr('aria-expanded') == "true";

        var img = dropdownMenu.find('.mobile_caret img');
        img.remove();

        var newSVG = $('<img></img>');
        if(open || focusout){
            newSVG.attr('src','/img/downcaret.svg');    
            newSVG.attr('alt','Open nav menu');   
        } else{
            newSVG.attr('src','/img/upcaret.svg');
            newSVG.attr('alt','Close nav menu');   
        }        
        dropdownMenu.find('.mobile_caret').append(newSVG);
    };

    $('.dropdown_container').on('focusout', function(){
        toggleDropdownIcon($(this), true);
    });

    $('.dropdown_container').on('click', function(){
        toggleDropdownIcon($(this));
    });    
});