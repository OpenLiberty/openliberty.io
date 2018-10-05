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
    var lastScrollTop = 0;

    $(window).on('scroll', function(){
        // Check if scrolling up to apply the stickyNav class.
        var newScrollTop = $(this).scrollTop();
        
        if (newScrollTop < lastScrollTop){
            // SCROLLING UP
            var offset = window.scrollY;
            var floating_nav_point = $('.floating_nav_point').offset().top;
            if(offset > floating_nav_point){ 
                navbar.addClass('stickyNav');
            } else{
                navbar.css('top', '0');
                navbar.removeClass('stickyNav');
            }
        } else{
            // SCROLLING DOWN
            // Use a threshold of over 5 pixels so the user doesn't accidentally make the navbar dissapear unless they really scroll down.
            if((newScrollTop - lastScrollTop) > 5){
                navbar.stop().animate({top: '-75px'}, function(){
                    navbar.css('top', '0');
                    navbar.removeClass('stickyNav');
                });
            }
        }
        lastScrollTop = newScrollTop;        
    });
});