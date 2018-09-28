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
    var navbar = $('.navbar');
    var navHeight = navbar.outerHeight();
    var lastScrollTop = 0;

    $(window).on('scroll', function(){
        // Check if scrolling up to apply the stickyNav class.
        var newScrollTop = $(this).scrollTop();
        if (newScrollTop < lastScrollTop){
            // Scrolling up
            var offset = window.scrollY;
            if(offset > navHeight / 2){
                navbar.addClass('stickyNav');             
            } else{
                navbar.removeClass('stickyNav');
            }
        } else{
            // Scrolling down
            // Use a threshold of over 3 pixels so the user doesn't accidentally make the navbar dissapear unless they really scroll down.
            if((newScrollTop - lastScrollTop) > 3){
                navbar.removeClass('stickyNav');
            }            
        }
        lastScrollTop = newScrollTop;        
    });
});