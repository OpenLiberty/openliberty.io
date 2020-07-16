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

        var div = document.getElementById("nav_bar");
        var rect = div.getBoundingClientRect();
        var bottom = rect.bottom;
        // console.log("bottom: ", bottom);
        var currScrollTop = $(this).scrollTop();
        console.log("currScrollTop:", currScrollTop);
        if (currScrollTop > 60) {
            // $("#nav_bar").css("display", "none");
            console.log("scrolled past 60px");
            // if scrolling down, hide nav bar
            if (currScrollTop > prevScrollTop) {
                console.log("scrolling down");
                hideNav();
                $("#toc_column").css("padding-top", "0px");

            } 
            // if scrolling up, show nav bar
            else {
                console.log("scrolling up");
                $("#nav_bar").css("top", "0px");
                showNav();
            }
        }
        // else {
        //     $("#code_column").css({"position": "fixed", "top": bottom + "px"})
        // }

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
        prevScrollTop = currScrollTop;
    });
});

function hideNav() {
    $("#nav_bar").removeClass("fixed_top");
    $('body').css("margin-top", "0px");
    // $("#toc_column").css("padding-top", "0px");
    $("#code_column").css({"position":"fixed", "top":"0px"})
    $("#toc_inner").css("top", "0px");
}

function showNav() {
    $("#nav_bar").addClass("fixed_top");
    $('body').css("margin-top", "60px");
    // $("#toc_column").css("padding-top", "60px");
    $("#code_column").css({"position":"fixed", "top":"60px"})
    $("#toc_inner").css("top", "60px");

}