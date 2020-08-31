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
	$(window).scroll(function () {
        var currScrollTop = $(this).scrollTop();
        if (currScrollTop > 60) {
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
    $("#nav_bar").addClass("fixed_top");
    $("#toc_column").css("top", nav_height + "px");
    $("#toc_indicator").css("top", nav_height + "px");

    $('body').css("margin-top", nav_height + "px");
    // $("#guide_column").css("top", "120px");
    // $("#guides_container").css({"position":"relative", "top":"60px"});
    $("#code_column").css({"position": "fixed", "top": nav_height + "px"})
    $("#toc_inner").css("margin-top", nav_height + "px");

    // on /guides, if tablet toc accordion is fixed, move toc accordiom below fixed nav bar
    if ($("#tablet_toc_accordion_container").css("position") === "fixed") {
        var accordion_height = $("#tablet_toc_accordion_container").outerHeight();
        $("#tablet_toc_accordion_container").css("top", accordion_height + "px");
    }

    // in guides, if mobile toc accodion is fixed, move toc accordion below fixed nav bar
    if ($("#mobile_toc_accordion_container").hasClass("fixed_toc_accordion")) {
        var accordion_height = $("#mobile_toc_accordion_container").outerHeight();
        $("#mobile_toc_accordion_container").css("top", accordion_height + "px");

    }

}

function hideNav() {
    $("#nav_bar").removeClass("fixed_top");
    $("#nav_bar").css({"top": "-60px"});
    $('body').css("margin-top", "0px");
    $("#toc_column").css("top", "0px");
    $("#toc_indicator").css("top", "0px");
    // $("#guide_column").css("top", "0px");
    // $("#guides_container").css({"position":"", "top":""});
    $("#code_column").css({"position":"fixed", "top":"0px"})
    $("#toc_inner").css("margin-top", "0px");

    $("#mobile_toc_accordion_container").css("top", "0px");
    $("#tablet_toc_accordion_container").css("top", "0px");

}