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
        if(window.innerWidth > 991){
            if(!$(this).hasClass('open')){
                $(this).toggleClass('open');
            }
        }               
    });

    /* Close the dropdown once the mouse leaves the dropdown list item */
    $('.dropdown_container').on('hoveroff mouseout', function(){
        if(window.innerWidth > 991){
            if($(this).hasClass('open')){
                $(this).toggleClass('open');
            }
        }
    });

    /*  Change the dropdown arrow toggle to the correct open/closed state.
        Input: Show boolean if the dropdown is open or not. */
    var toggleDropdownIcon = function(dropdownMenu, open){
        var img = dropdownMenu.find('.mobile_caret img');
        img.remove();

        var newSVG = $('<img></img>');
        if(open){
            newSVG.attr('src','/img/UpCaretWhite.svg');
            newSVG.attr('alt','Close nav menu');               
        } else{
            newSVG.attr('src','/img/DownCaretWhite.svg');    
            newSVG.attr('alt','Open nav menu');
        }        
        dropdownMenu.find('.mobile_caret').append(newSVG);
    };

    // Listener for right before the dropdown opens
    $('.dropdown_container').on('show.bs.dropdown', function(){
        toggleDropdownIcon($(this), true);
    }); 
    
    // Listener for right before the dropdown closes
    $('.dropdown_container').on('hide.bs.dropdown', function(){
        toggleDropdownIcon($(this), false);
    });
});