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
var commandDocsFolder = "/docs/ref/commands/server/";
var windowFocus = false;

// setup and listen to click on table of content
function addTOCClick() {
    var onclick = function (event) {
        var resource = $(event.currentTarget);
        var currentHref = resource.attr("href");

        // handle the click event ourselves so as to take care of updating the hash 
        event.preventDefault();
        event.stopPropagation();

        loadContent(resource, currentHref, true);

        if (isMobileView()) {
            $("#breadcrumb_hamburger").trigger("click");
        }
    };

    $("#toc_container > ul > li > div").off("click").on("click", onclick);

    $("#toc_container > ul > li > div").off("keypress").on('keypress', function (event) {
        event.stopPropagation();
        // Enter or space key
        if (event.which === 13 || event.keyCode === 13 || event.which === 32 || event.keyCode === 32) {
            $(this).trigger('click');
        }
    });

    addOutlineToTabFocus("#toc_container > ul > li > div");

    $(window).off('focus').on('focus', function(event) {
        windowFocus = true;
    })
}

// setup and listen to click on the See Also section
function addReferenceClick() {
    var onclick = function (event) {
        var resource = $(event.currentTarget);
        var currentHref = resource.attr("href");
        var matchingTOCElement = getTOCElement(currentHref);

        // check that link isn't a full url containing http before updating hash
        if (currentHref.indexOf("http") == -1) {
            // handle the click event ourselves so as to take care of updating the hash 
            event.preventDefault();
            event.stopPropagation();

            loadContent(matchingTOCElement, commandDocsFolder + currentHref, true);

            return false;
        }
    };

    $("#command_content .sect1 .sectionbody p > a").off("click").on("click", onclick);

    $("#command_content .sect1 .sectionbody p > a").off("keypress").on('keypress', function (event) {
        event.stopPropagation();
        // Enter or space key
        if (event.which === 13 || event.keyCode === 13 || event.which === 32 || event.keyCode === 32) {
            $(this).trigger('click');
        }
    });
}

// highlight the selected TOC
function setSelectedTOC(resource) {
    deselectedTOC();
    resource.parent().addClass("toc_selected");
}

// deselect current TOC
function deselectedTOC(r) {
    var currentTOCSelected = $(".toc_selected");
    if (currentTOCSelected.length === 1) {      
        currentTOCSelected.removeClass("toc_selected");
    }
}


function getTOCElement(href) {
    return $("#toc_container > ul > li > div[href$='" + href + "']");    
}

// Add extra css to the doc, set the doc height, and scroll to the content
function setupDisplayContent() {
    adjustParentWindow();
    $('#command_content').animate({
        scrollTop: 0
    }, 400);
}

// This function
// - highlight the selected TOC 
// - load the doc for the selected TOC
// - update main bread crumb 
// - show the display content, 
// - update hash if requested
function loadContent(targetTOC, tocHref, addHash) {
    if (targetTOC.length === 1) {
        setSelectedTOC(targetTOC);
    } else {
        deselectedTOC();
    }
    $("#command_content").load(tocHref, function(response, status) {
        var doc_adoc = /[^/]*$/.exec(tocHref)[0].replace("html", "adoc");
        $("#open_issue_link").attr("href", "https://github.com/OpenLiberty/docs/issues/new");
        $("#edit_topic_link").attr("href", "https://github.com/OpenLiberty/docs/edit/master/ref/commands/server/" + doc_adoc);
        if (status === "success") {
            updateMainBreadcrumb(targetTOC);
            updateTitle(targetTOC);
            setupDisplayContent();

            // update hash only if thru normal clicking path
            if (addHash) {
                updateHashInUrl(tocHref);
            }

            $(this).focus(); // switch focus to the content for the reader

            addReferenceClick();
        }
    });
}

// events to detect keyboard focus and add outline to the element. Outline will not
// be added if the focus is thru mouse event.
function addOutlineToTabFocus(selector) {
    $(selector).off("blur").on("blur", function(event) {
        if ($(this).hasClass('addFocus')) {
            $(this).removeClass('addFocus');
        }
    });

    var mousedown = false;
    $(selector).off('mousedown').on('mousedown', function(event) {
        mousedown = true;
    });

    $(selector).off('focusin').on('focusin', function(event) {
        if (!mousedown && !windowFocus) {
            $(this).addClass("addFocus");
            // scroll the parent window back up if it is scroll down
            adjustParentWindow();
        }
        mousedown = false;
        windowFocus = false;
    });
}

// update the main breadcrumb
function updateMainBreadcrumb(resource, attrForTitle) {
    var lastBreadcrumb = $(".breadcrumb.fluid-container").find("li:last-child");
    var lastBreadcrumbAnchorTag = lastBreadcrumb.find("a");
    if (lastBreadcrumbAnchorTag.hasClass("inactive_link")) {
        // remove existing inactive link
        lastBreadcrumb.remove();
    }

    if (resource !== undefined) {
        // use default title or title retrieved from the passed in attribute
        var title = resource.text();
        if (attrForTitle) {
            title = resource.attr(attrForTitle);
        }
        $(".breadcrumb.fluid-container").append("<li><a class='inactive_link'>" + title + "</a></li>");
    }
}

// update hash in the url and set lastClickElementHref to be the same value as set in the hash
// so that when hashchange is triggered, there is no need to handle the event.
function updateHashInUrl(href) {
    var hashInUrl = href;
    if (href.indexOf(commandDocsFolder) !== -1) {
        hashInUrl = href.substring((commandDocsFolder).length);
    }

    //lastClickElementHref = hashInUrl;
    window.location.hash = "#" + hashInUrl;
}

// Update title in browser tab to show current page
function updateTitle(currentPage) {
    $("title").text(currentPage.text() + " - Server Commands - Open Liberty");
}

// check if mobile view or not
function isMobileView() {
    if ($(window).width() <= mobileWidth) {
        return true;
    } else {
        return false;
    }
}

// set the container height so that the table of content is using the viewport to display its content
// without scrolling issue
function setContainerHeight() {
    if (!isMobileView()) {  
        // the height is viewport - header so that the last toc will be in 
        // view without the need to scroll the outer container
        $("#background_container").css("height", $(window).height() - $('header').height()); 
        $("#background_container").css("margin-bottom", "60px");     
    }
}

// select the first doc in the table of content
function selectFirstDoc() {
    if (!isMobileView()) {
        var firstTOCElement = $("#toc_container > ul > li > div").first();
        loadContent(firstTOCElement, firstTOCElement.attr("href"));
        return firstTOCElement;
    }
}

// If parent window is scrolled down to the footer, it will shift the top of toc and doc content up
// behind the fixed header. As a result, the backward tabbing towards the top (either toc or doc content)
// would result in not seeing the toc or top of the doc. This function will shift the parent window back
// to the top.
function adjustParentWindow() {
    if ($(window.parent.document).scrollTop() > 0) {
        $(window.parent.document).scrollTop(0);
    }    
}

// If the doc content is in focus by means of other than a mouse click, then goto the top of the 
// doc.
function addContentFocusListener() {
    var mousedown = false;
    $("#command_content").on('mousedown', function(event) {
        mousedown = true;
    });
    $('#command_content').on("focusin", function(e) {
        if (!mousedown) {
            adjustParentWindow();
            $('#command_content').scrollTop(0);
        }
        mousedown = false;
    });
}

// setup and listen to hamburger click event
function addHamburgerClick() {
    if (isMobileView()) {
        var hamburger = $(".breadcrumb_hamburger_nav");

        hamburger.on("click", function (e) {
            if ($("#toc_column").hasClass('in')) {
                $("#command_content").show();
                $("#breadcrumb_hamburger").show();
                $("#breadcrumb_hamburger_title").show();
            } else {
                $("#command_content").hide();
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

// scroll the selected table of content in viewport
function scrollToTOC(tocElement) {
    if (!isMobileView()) {
        var headerHeight = $('header').height();
        var currentTOCTop = $('#toc_column').scrollTop();
        // factor in the header height as the element top is still a positive number when the
        // element is behind the header
        var elementTop = tocElement[0].getBoundingClientRect().top - headerHeight;
        var tocClientHeight = $('#toc_column')[0].clientHeight;
        var tocScrollHeight = $('#toc_column')[0].scrollHeight;
       
        if (elementTop < 0 || (elementTop > 0 && 
                            elementTop > tocClientHeight)) {
            var scrollTo = currentTOCTop + elementTop - headerHeight + 50;
            // if we cannot scroll the element to the top cuz the end of the TOC has reached,
            // adjust the scrollTo position to show the last page of TOC elements
            if (scrollTo + tocClientHeight > tocScrollHeight) {
                scrollTo = tocScrollHeight - tocClientHeight + headerHeight + 50;
            }
            $('#toc_column').animate({
                scrollTop: scrollTo
            }, 400);
        }
        
    }
}

//attach the hashchange event listener
function addHashListener() {
    $(window).on('hashchange', function () {
        if (window.location.hash) {
            var tocHref = commandDocsFolder + window.location.hash.substring(1);
            var tocElement = $("#toc_container").find("div[href='" + tocHref + "']");
            if (tocElement.length === 1) {
                scrollToTOC(tocElement);
            }
            // attempt to load as it could be a reference doc that is not in table of content
            loadContent(tocElement, tocHref);
            if (isMobileView() && $("#toc_column").hasClass('in')) {
                $(".breadcrumb_hamburger_nav").trigger('click');
            }
        } else {
            if (isMobileView()) {
                if (!$("#toc_column").hasClass('in')) {
                    $(".breadcrumb_hamburger_nav").trigger('click');
                }
            } else {
                scrollToTOC(selectFirstDoc());
            }
        }
    });
}

// Take care of displaying the table of content, comand content, and hamburger correctly when
// browser window resizes from mobile to non-mobile width and vice versa.
function addWindowResizeListener() {
    $(window).resize(function() {
        if (isMobileView()) {
            addHamburgerClick();
        } else {
            if (!$('#toc_column').hasClass('in')) {
                $(".breadcrumb_hamburger_nav").trigger('click');
            }
            $("#breadcrumb_hamburger").hide();
            $("#breadcrumb_hamburger_title").hide();
        }
    });
}

$(document).ready(function () {  
    addTOCClick();
    addContentFocusListener();
    addHamburgerClick();
    addHashListener();
    addWindowResizeListener();

    //manually tiggering it if we have hash part in URL
    if (window.location.hash) {
        $(window).trigger('hashchange');
    } else {
        selectFirstDoc();
    }
});

// Change height of toc if footer is in view so that fixed toc isn't visible through footer
$(document).scroll(function() {
    $('#toc_inner').height($('footer').offset().top - $('#toc_inner').offset().top);
});