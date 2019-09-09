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

var latest_release_url = '/api/builds/latest';

$(document).ready(function() {

    $.ajax({
        url: latest_release_url
    }).done(function(data) {

        $('#download_link').attr('href', data.runtime.driver_location);
        $('#download_link_size_label').text('(' + Math.floor(data.runtime.size_in_bytes / 1048576) + ' MB)');

    });

    // add custom css to twitter iframe
    $('#twitter_iframe_div').on('DOMSubtreeModified propertychange',"#twitter-widget-0", function() {
        $(".twitter-timeline").contents().find(".timeline-Tweet-media").css("display", "none");
        $(".twitter-timeline").contents().find(".timeline-Tweet-text").css({"font-size": "16px", "margin-bottom": "-10px"});
        $(".twitter-timeline").contents().find(".TweetAuthor-decoratedName").css("display", "inline");
        $(".twitter-timeline").contents().find(".timeline-Body").css("border-bottom", "none");
    });

    function isInViewport(el){
        var rect = el.getBoundingClientRect();
    
        return (
            rect.bottom >= 0 && 
            rect.right >= 0 && 
        
            rect.top <= (
            window.innerHeight || 
            document.documentElement.clientHeight) && 
        
            rect.left <= (
            window.innerWidth || 
            document.documentElement.clientWidth)
        );
    }

    function lazyLoad() {
        var lazy = $('.lazy');

        for (var i = 0; i < lazy.length; i++) {
            if (isInViewport(lazy[i])) {
                lazy[i].src = lazy[i].getAttribute('data-src');
            }
        }
    }

    $(document).ready(function() {
        lazyLoad();
    })
    
    $(window).scroll(function() {
        lazyLoad();
    })


});