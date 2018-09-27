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
    var hoveringNavbar = false; // Lock to keep the navbar present when the debounce ends.
    var navHeight = navbar.outerHeight();
    var lastScrollTop = 0;

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate){
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow){
                func.apply(context, args);
            } 
        };
    }    

    /* Fade away the floating nav after 500 ms of no scrolling */
    var fadeNavBar = debounce(function(){
        // Cancel fading the navbar debounce.
        if(!hoveringNavbar){
            navbar.removeClass('stickyNav');
        }
    }, 500);

    $('.navbar').on('hover mouseover', function(){        
        hoveringNavbar = true;
    });

    $('.navbar').on('hoveroff mouseleave', function(){
        hoveringNavbar = false;
        fadeNavBar();
    });

    $(window).on('scroll', function(event){
        // Check if scrolling up to apply the stickyNav class.
        var newScrollTop = $(this).scrollTop();
        if (newScrollTop < lastScrollTop){
            // Scrolling up
            var offset = window.scrollY;
            if(offset > navHeight / 2){
                navbar.addClass('stickyNav');
                fadeNavBar();                
            } else{
                navbar.removeClass('stickyNav');
            }
        } else{
            navbar.removeClass('stickyNav');
        }
        lastScrollTop = newScrollTop;        
    });
});