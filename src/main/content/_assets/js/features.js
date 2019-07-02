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

// With the version control support, cannot just set the hash in the url to trigger 
// the doc loading with the hashchange event. This is because for a title with multiple
// versions, the parent doc has to be loaded first before we know what is the version
// html to be updated in the hash. With that, lastClickElementHref is set whenever
// the hash is updated by the codes and is used to compare the hashchange value to
// determine whether hashchange event should be handled.
var lastClickElementHref; 
var windowFocus = false;

// setup and listen to click on table of content
function addTOCClick() {
    var onclick = function (event) {
        var resource = $(event.currentTarget);
        //setSelectedTOC(resource);
        var currentHref = resource.attr("href");
        
        // handle the click event ourselves so as to take care of updating the hash 
        event.preventDefault();
        event.stopPropagation();

        loadContent(resource, currentHref, true);

        if (isMobileView()) {
            $("#breadcrumb_hamburger").trigger("click");
        }
    }

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

// highlight the selected TOC
function setSelectedTOC(resource) {
    var currentTOCSelected = $(".toc_selected");
    var newHref = resource.attr("href");

    if (currentTOCSelected.length === 1) {      
        currentTOCSelected.removeClass("toc_selected");
    }
    resource.parent().addClass("toc_selected");
}

// Add extra css to the doc, set the doc height, and scroll to the content	
function setupDisplayContent() {	
    addClassToFeaturesThatEnableThisFeature();	
    $('html, body').animate({	
        scrollTop: 0	
    }, 400);	
}

// This function
// - highlight the selected TOC 
// - load the doc for the selected TOC
//   - once the doc is loaded, determine whether it is a version doc. 
//     - if it is a version doc, select the default or version passed in.
//     - if it is not a version doc, update main bread crumb, show the display content, 
//       and update hash if requested
function loadContent(targetTOC, tocHref, addHash, versionHref) {
    $('footer').hide();
    setSelectedTOC(targetTOC);
    $("#feature_content").load(tocHref, function(response, status) {
        if (status === "success") {
            common_feature_title = $('#common_feature_title');
            if (common_feature_title.length === 1) {
                if (versionHref) {
                    addVersionClick(versionHref);
                } else {
                    addVersionClick('default');
                }
                $('footer').show();
            } else {
                updateMainBreadcrumb(targetTOC);
                setupDisplayContent();
                $('footer').show();

                // update hash only if thru normal clicking path
                if (addHash) {
                    updateHashInUrl(tocHref);
                }
            }
            updateTitle(targetTOC);
            $(this).focus(); // switch focus to the content for the reader
        } else {
            $('footer').show();
        }
    });
}

// setup and listen to version click and trigger the default or version passed in to be shown
function addVersionClick(hrefToClick) {
    var onclick = function(event) {
        var resource = $(event.currentTarget);
        var currentHref = resource.attr("href");

        // handle the click event ourselves so as to take care of updating the hash and creating
        // the push state 
        event.preventDefault();
        event.stopPropagation();

        loadVersionContent(resource, currentHref);
        updateHashInUrl(currentHref);
    }

    $("#common_feature_title > .feature_version").off("click").on("click", onclick);

    $("#common_feature_title > .feature_version").off("keypress").on('keypress', function (event) {
        event.stopPropagation();
        // Enter or space key
        if (event.which === 13 || event.keyCode === 13 || event.which === 32 || event.keyCode === 32) {
            $(this).trigger('click');
        }
    });

    // trigger a click on the default or the version passed in
    if (hrefToClick === "default") {
        $("#common_feature_title > .feature_version:first").trigger('click');
    } else {
        var resource = $('#common_feature_title > .feature_version[href="' + hrefToClick + '"]');
        if (resource.length === 1) {
            resource.trigger('click');
        } else {
            $("#common_feature_title > .feature_version:first").trigger('click');
        }
    }

    addOutlineToTabFocus("#common_feature_title > .feature_version");
}

// events to detect keyboard focus and add outline to the element. Outline will not
// be added if the focus is thru mouse event.
function addOutlineToTabFocus(selector) {
    $(selector).off("blur").on("blur", function(event) {
        if ($(this).hasClass('addFocus')) {
            $(this).removeClass('addFocus');
        }
    })

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

// highlight the selected version
function setSelectedVersion(resource) {
    selectedVersions = $("#common_feature_title > .feature_version_selected");
    if (selectedVersions.length > 0) {
        selectedVersions.removeClass('feature_version_selected');
    }
    resource.addClass('feature_version_selected');
}

// highlight selected version, load the version doc, and update the main breadcrumb 
function loadVersionContent(versionElement, versionHref) {
    setSelectedVersion(versionElement);
    $("#common_feature_content").load(versionHref, function(response, status) {
        if (status === "success") {
            $('#feature_title').hide();
            setupDisplayContent();
            updateMainBreadcrumb(versionElement, 'full_title');

            $(this).focus(); // switch focus to the content for the reader
        }
        $('footer').show();
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
    if (href.indexOf("/feature/") !== -1) {
        hashInUrl = href.substring(18);
    }

    lastClickElementHref = hashInUrl;
    window.location.hash = "#" + hashInUrl;
}


// Update title in browser tab to show current page
function updateTitle(currentPage) {
    $("title").text(currentPage.text() + " - Server Features - Open Liberty");
}

// check if mobile view or not
function isMobileView() {
    if ($(window).width() <= mobileWidth) {
        return true;
    } else {
        return false;
    }
}

// add css to features-that-enable-this-feature per design
function addClassToFeaturesThatEnableThisFeature() {
    var featuresThatEnableThisFeature = $("#features-that-enable-this-feature");
    if (featuresThatEnableThisFeature.length === 1) {
        var ulist = featuresThatEnableThisFeature.parent().find('.ulist');
        if (ulist.length === 1) {
            ulist.addClass('enableByList');
        }
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
        updateMainBreadcrumb();
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
function addFeatureContentFocusListener() {
    var mousedown = false;
    $("#feature_content").on('mousedown', function(event) {
        mousedown = true;
    });
    $('#feature_content').on("focusin", function(e) {
        if (!mousedown) {
            adjustParentWindow();
            $('#feature_content').scrollTop(0);
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

// handle version doc in hash
function handleHashInCommonToc(href) {
    if (href.lastIndexOf('-') !== -1) {
        // take out the version from the href and look for the remaining html in the table of content. 
        // It is assumed that the version appears at the end of the file name with the format "-x.x"
        // and before the .html file extension, eg. beanValidation-2.0.html.
        var commonTOCHtml = href.substring(0, href.lastIndexOf('-')) + ".html";
        var tocElement = $("#toc_container").find("div[href='" + commonTOCHtml + "']");
        if (tocElement.length === 1) {
            loadContent(tocElement, commonTOCHtml, false, href);
        }
    }
    return tocElement;
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
        if (lastClickElementHref !== window.location.hash.substring(1)) {
            lastClickElementHref = null;

            if (window.location.hash) {
                var tocHref = "/docs/ref/feature/" + window.location.hash.substring(1);
                var tocElement = $("#toc_container").find("div[href='" + tocHref + "']");
                if (tocElement.length === 1) {
                    loadContent(tocElement, tocHref);
                } else {
                    // check whether it is a hash belonging to a common toc
                    tocElement = handleHashInCommonToc(tocHref);
                }
                if (isMobileView() && $("#toc_column").hasClass('in')) {
                    $(".breadcrumb_hamburger_nav").trigger('click');
                }
                scrollToTOC(tocElement);
            } else {
                if (isMobileView()) {
                    if (!$("#toc_column").hasClass('in')) {
                        $(".breadcrumb_hamburger_nav").trigger('click');
                    }
                } else {
                    scrollToTOC(selectFirstDoc());
                }
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
    addFeatureContentFocusListener();
    addHamburgerClick();
    addHashListener();
    addWindowResizeListener();
    
    //manually tiggering it if we have hash part in URL
    if (window.location.hash) {
        $(window).trigger('hashchange');
    } else {
        selectFirstDoc();
    }
})

// Change height of toc if footer is in view so that fixed toc isn't visible through footer
$(window).scroll(function() {
    $('#toc_inner').height($('footer').offset().top - $('#toc_inner').offset().top);
});