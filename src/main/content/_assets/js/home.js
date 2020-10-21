/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

// Determine if an element is in the viewport
$.fn.isInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

// start hovering ufo animation
function startAnimation() {
    $('#person_1').css("animation", "object_hovering 4.1s 3");
    $('#coffee').css("animation", "object_hovering 4s 3");
    $('#shoe').css("animation", "object_hovering 3.5s 3");
    $('#laptop').css("animation", "object_hovering 5.5s 2");
    $('#ball').css("animation", "object_hovering 3.6s 3");
    $('#dog').css("animation", "object_hovering 3.5s 3");
    $('#phone').css("animation", "object_hovering 5s 2");
    $('#mouse').css("animation", "object_hovering 5.5s 2");
    $('#person_2').css("animation", "object_hovering 4s 3");
}

$(document).ready(function() {
    // add custom css to twitter iframe
    $('#twitter_iframe_div').on('DOMSubtreeModified propertychange',"#twitter-widget-0", function() {
        $(".twitter-timeline").contents().find(".timeline-Tweet-media").css("display", "none");
        $(".twitter-timeline").contents().find(".timeline-Tweet-text").css({"font-size": "16px", "margin-bottom": "-10px"});
        $(".twitter-timeline").contents().find(".timeline-Body").css("border-bottom", "none");
    });

    $(window).on('scroll', function(event) {
        // start animation if images are in viewport
        if ($('#beam').isInViewport()) {
            startAnimation();
        }
    });
});

$(window).on("load", function(){
    $.ready.then(function(){
        // start animation if images are in viewport
        if ($('#beam').isInViewport()) {
            startAnimation();
        }
    });
});