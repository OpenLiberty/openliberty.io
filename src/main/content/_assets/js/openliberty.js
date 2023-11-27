/*******************************************************************************
 * Copyright (c) 2019, 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
setTimeout(() => {
     var openliberty = (function() {
    $(document).ready(function() {
        var scrollAllowed = true;
        var prevScrollTop = 0;
        $(window).scroll(function() {
            if(!scrollAllowed){
                return;
            }
            var currScrollTop = $(this).scrollTop();
            // if scrolled past nav bar, determine whether to hide or show nav bar
            if (currScrollTop > $("#nav_bar").outerHeight()) {
            // make docs toolbar position sticky once you scroll past nav bar
                $(".toolbar").css("position", "sticky");

                // if scrolling down, hide nav bar
                if (currScrollTop > prevScrollTop) {
                    hideNav();
                }
                // if scrolling up, show nav bar
                else {
                    showNav();
                }
            }
            else {
                $(".toolbar").css({"position": "static", "top": ""});
                $(".nav").css("top", "");
            }

            // When page scrolled back to top: Make nav bar no longer fixed, reset body margin-top
            if (currScrollTop == 0) {
                $("#nav_bar").removeClass("fixed_top");
                $('body').css("margin-top", "0px");
                $('#toc_column').css({'position': '', 'top': ''});
            }

            // make toc scroll off of screen at Nice Work section in guides
            if (typeof isBackgroundBottomVisible === "function") {
                 if(isBackgroundBottomVisible()) {
                    handleTOCScrolling();
                } 
            }

            prevScrollTop = currScrollTop;
        });

        $(window).on('resize', function() {
            if ($(".toolbar").css("position") == "sticky" && $("#nav_bar").hasClass("fixed_top")) {
                $(".toolbar").css("top", $("#nav_bar").outerHeight() + "px");
            }
        });

        $(document).on('click', '.copy_to_clipboard', function (event) {
            event.preventDefault();
            target = $(this).parent().find('pre, codeblock, div.content pre, div.content codeblock');
            openliberty.copy_element_to_clipboard(target, function () {});
            $(this).prev().fadeIn().delay(500).fadeOut()
        });
    });

    // slide nav bar into view, move down elements that are fixed to top of screen
    function showNav() {
        var nav_height = $("#nav_bar").outerHeight();

        // fix nav bar to top of screen
        $("#nav_bar").addClass("fixed_top");
        $("#nav_bar").removeClass("hide_nav");

        // push toc column, toc indicator and code column down below nav bar
        $("#toc_column").css("top", nav_height + "px");
        $("#toc_indicator").css("margin-top", nav_height + "px");

        // add margin-top to body so page doesn't jump when nav slides into view
        $('body').css("margin-top", nav_height + "px");

        // on /guides, if tablet toc accordion is fixed to top of screen, move toc accordion below fixed nav bar
        if ($("#tablet_toc_accordion_container").css("position") === "fixed") {
            $("#tablet_toc_accordion_container").css("top", nav_height + "px");
        }

        // adjust docs toolbar and nav position
        $(".toolbar").css("top", nav_height + "px");
        if (window.innerWidth < 1024) {
            $(".nav-container").css("top", nav_height + $(".toolbar").outerHeight() + "px");
            $(".nav").css("top", "");
        }
        else {
            $(".nav").css("top",  nav_height + "px");
        }

        // move config breadcrumb down when nav bar in view
        $(".contentStickyBreadcrumbHeader").css("top", nav_height + $(".toolbar").outerHeight() + "px");
    }

    // slide nav bar back out of view, reset elements that were pushed down
    function hideNav() {
    // reset nav bar and move off screen
        $("#nav_bar").removeClass("fixed_top");
        $("#nav_bar").addClass("hide_nav");
        
        // reset toc column, toc indicator and code column position
        $("#toc_column").css("top", "0px");
        $("#toc_indicator").css("margin-top", "0px");

        // reset body margin-top
        $('body').css("margin-top", "0px");

        // fix mobile and tablet toc accordion to top of screen again
        $("#tablet_toc_accordion_container").css("top", "0px");

        // adjust docs toolbar and nav position
        $(".toolbar").css("top", "0px");
        if (window.innerWidth < 1024) {
            $(".nav-container").css("top", $(".toolbar").outerHeight() + "px");
            $(".nav").css("top", "");
        }
        else {
            $(".nav-container").css("top", "");
            $(".nav").css("top", "");
        }

        // move config breadcrumb back up when nav bar slides out of view
        $(".contentStickyBreadcrumbHeader").css("top", $(".toolbar").outerHeight() + "px");
    }

    // Copy the target element to the clipboard
    // target: element to copy
    // callback: function to run if the copy is successful
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

    function preventScrolling(){
        scrollAllowed = false;
    }

    function allowScrolling(){
        scrollAllowed = true;
    }

    return {
        preventScrolling: preventScrolling,
        allowScrolling: allowScrolling,
        copy_element_to_clipboard: copy_element_to_clipboard
    };
})() },1000);
