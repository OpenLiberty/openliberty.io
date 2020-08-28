/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

$(document).ready(function() {
    var prevScrollTop = 0;
    
    nav_height = $("#nav_bar").outerHeight();
    console.log("nav_height: ", nav_height);
	$(window).scroll(function () {
        var currScrollTop = $(this).scrollTop();
        if (currScrollTop > nav_height) {
            // make docs toolbar position sticky once you scroll past 60px
            $(".toolbar").css("position", "sticky");

            // if scrolling down, hide nav bar
            if (currScrollTop > prevScrollTop) {
                hideNav();
                $("#toc_column").css("padding-top", "0px");
            } 
            // if scrolling up, show nav bar
            else {
                $("#nav_bar").css("top", "0px");
                showNav();
            }
        }
        else {
            $("#code_column").css({"position": "absolute", "top": ""});
            $(".toolbar").css({"position": "static", "top": ""});
            $(".nav").css("top", "");
        }


        if (currScrollTop == 0) {
            // hideNav(); //messes up features
            $("#nav_bar").removeClass("fixed_top");
            $('body').css("margin-top", "0px");

            // $("#code_column").css({"position":"fixed", "top":"60px"}) //messes up features?
            // $("#code_column").css("position", "absolute");

            // $("#toc_inner").css("top", "60px"); // messes up features
        }

        // make toc scroll off of screen at Nice Work section
        if (typeof isBackgroundBottomVisible === "function") {
            if(isBackgroundBottomVisible()) {
                handleTOCScrolling();
            }
        }

        prevScrollTop = currScrollTop;
    });
});

function showNav() {
    var nav_height = $("#nav_bar").outerHeight();
    console.log("nav_height: ", nav_height);

    $("#nav_bar").addClass("fixed_top");
    $("#toc_column").css("top", "60px");
    // $("#guide_column").css("top", "120px");
    // $("#guides_container").css({"position":"relative", "top":"60px"});
    $("#code_column").css({"position":"fixed", "top":"60px"})
    $("#toc_inner").css("margin-top", "60px");

    $(".toolbar").css("top", nav_height + "px");
    $(".nav").css("top", "60px");
}

function hideNav() {
    $("#nav_bar").removeClass("fixed_top");
    $("#nav_bar").css({"top": "-60px"});
    $("#toc_column").css("top", "0px");
    // $("#guide_column").css("top", "0px");
    // $("#guides_container").css({"position":"", "top":""});
    $("#code_column").css({"position":"fixed", "top":"0px"})
    $("#toc_inner").css("margin-top", "0px");

    $(".toolbar").css("top", "0px");
    $(".nav").css("top", "0px");
    
}

