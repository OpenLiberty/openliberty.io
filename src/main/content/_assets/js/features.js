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
var mobileWidth = 767;

function addTOCClick() {
    var onclick = function (event) {
        var resource = $(event.currentTarget);
        setSelectedTOC(resource);
        var currentHref = resource.attr("href");

        // handle the click event ourselves so as to take care of updating the hash and creating
        // the push state 
        event.preventDefault();
        event.stopPropagation();

        loadContent(currentHref);
        updateMainBreadcrumb(resource);
        updateHashInUrl(currentHref);

        if (isMobileView()) {
            $("#breadcrumb_hamburger").trigger("click");
        }
    }

    $("#toc_container > ul > li > div").off("click").on("click", onclick);

    $("#toc_container > ul > li > div").off("keypress").on('keypress', function (event) {
        event.stopPropagation();
        // Enter key
        if (event.which === 13 || event.keyCode === 13) {
            $(this).click();
        }
    });

    // events to detect keyboard focus and add outline to the element
    $("#toc_container > ul > li > div").off("blur").on("blur", function(event) {
        if ($(this).hasClass('addFocus')) {
            $(this).removeClass('addFocus');
        }
    })

    var mousedown = false;
    $("#toc_container > ul > li > div").off('mousedown').on('mousedown', function(event) {
        mousedown = true;
    });

    $("#toc_container > ul > li > div").off('focusin').on('focusin', function(event) {
        if (!mousedown) {
            $(this).addClass("addFocus");
        }
        mousedown = false;
    });
}

function setSelectedTOC(resource) {
    var currentTOCSelected = $(".toc_selected");
    var newHref = resource.attr("href");

    if (currentTOCSelected.length === 1) {      
        currentTOCSelected.removeClass("toc_selected");
    }
    resource.parent().addClass("toc_selected");
}

function loadContent(href) {
    $('footer').hide();
    $("#feature_content").load(href, function(response, status) {
        if (status === "success") {
            addClassToFeaturesThatEnableThisFeature();
            setContainerHeight();
            $('html, body').animate({
                scrollTop: 0
              }, 400);
            $('footer').show();
            $(this).focus(); // switch focus to the content for the reader
        }
    });
}

function updateMainBreadcrumb(resource, notRemove) {
    if (notRemove === undefined || notRemove === false) {
        var lastBreadcrumb = $(".breadcrumb.fluid-container").find("li:last-child");
        var lastBreadcrumbAnchorTag = lastBreadcrumb.find("a");
        if (lastBreadcrumbAnchorTag.hasClass("inactive_link")) {
            // remove existing inactive link
            lastBreadcrumb.remove();
        }
    }

    if (resource !== undefined) {
        $(".breadcrumb.fluid-container").append("<li><a class='inactive_link'>" + resource.text() + "</a></li>");
    }
}

function updateHashInUrl(href) {
    var hashInUrl = href;
    if (href.indexOf("/feature/") !== -1) {
        hashInUrl = href.substring(9);
    }
    //var state = { href: href }
    //window.history.pushState(null, null, '#' + hashInUrl);
    window.location.hash = "#" + hashInUrl;
}

function isMobileView() {
    if ($(window).width() <= mobileWidth) {
        return true;
    } else {
        return false;
    }
}

function addClassToFeaturesThatEnableThisFeature() {
    var featuresThatEnableThisFeature = $("#features-that-enable-this-feature");
    if (featuresThatEnableThisFeature.length === 1) {
        var ulist = featuresThatEnableThisFeature.parent().find('.ulist');
        if (ulist.length === 1) {
            ulist.addClass('enableByList');
        }
    }
}

function setContainerHeight() {
    if (!isMobileView()) {  
        // the height has to be less than the viewport so that the last toc will be in 
        // view without the need to scroll the outer container
        $("#background_container").css("height", $(window).height() - 150); 
        $("#background_container").css("margin-bottom", "60px");     
    }
}

function selectFirstDoc() {
    if (!isMobileView()) {
        var firstTOCElement = $("#toc_container > ul > li > div").first();
        loadContent(firstTOCElement.attr("href"));
        setSelectedTOC(firstTOCElement);  
        updateMainBreadcrumb();
    }
}

function addHamburgerClick() {
    if (isMobileView()) {
        var hamburger = $(".breadcrumb_hamburger_nav");

        hamburger.on("click", function (e) {
            if ($("#toc_column").hasClass('in')) {
                $("#feature_content").show();
                $("#breadcrumb_hamburger").show();
                $("#breadcrumb_hamburger_title").show();
            } else {
                $("#feature_content").hide();
                $("#breadcrumb_hamburger").hide();
                $("#breadcrumb_hamburger_title").hide();
                $("#background_container").css("height", "auto");
                if (window.location.hash) { 
                    updateHashInUrl("");
                }
            }
        })
    }
}

$(document).ready(function () {  
    addTOCClick();
    addHamburgerClick();

    //attaching the event listener
    $(window).on('hashchange', function () {
        if (window.location.hash) {
            var tocHref = "/feature/" + window.location.hash.substring(1);
            var tocElement = $("#toc_container").find("div[href='" + tocHref + "']");
            if (tocElement.length === 1) {
                loadContent(tocHref);
                setSelectedTOC(tocElement);
                updateMainBreadcrumb(tocElement);

                if (isMobileView() && $("#toc_column").hasClass('in')) {
                    $(".breadcrumb_hamburger_nav").trigger('click');
                }
            }
        } else {
            if (isMobileView()) {
                if (!$("#toc_column").hasClass('in')) {
                    $(".breadcrumb_hamburger_nav").trigger('click');
                }
            } else {
                selectFirstDoc();
            }
        }
    });

    //manually tiggering it if we have hash part in URL
    if (window.location.hash) {
        $(window).trigger('hashchange');
    } else {
        selectFirstDoc();
    }
})