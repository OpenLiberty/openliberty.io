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

var subSectionClass = "subsection";
var subHeadingClass = "subHeading";
var maxIndentLevel = 7;
var minIndentLevel = 3;
var contentBreadcrumbHeight = 0;
var mobileWidth = 767;
var ipadWidth = 1024;

function addTOCClick() {
    var onclick = function (event) {
        // clean out the breadcrumb so that it cannot be clicked on while loading/repositioning the doc
        $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").remove();
        var resource = $(event.currentTarget);
        setSelectedTOC(resource, false);
        var currentHref = resource.attr("href");

        if (isMobileView() || isIPadView()) {
            $("#breadcrumb_hamburger").trigger("click");
            $('.nav-container .nav-panel-menu').removeClass('is-active'); // Hide the nav menu
            $('footer').hide();
        }

        if (currentHref.indexOf("#") === -1) {
            // loading initial content
            // - update main breadcrumb 
            // Note: content breadcrumb not visible with initial loading
            updateMainBreadcrumb(resource);
            updateTitle(resource.text());
        } else {
            // positioning to one of the 2nd level subtitiles
            // - enable content breadcrumb
            // - scroll to the 2nd level subtitle
            // Note: main breadcrumb only contains main title not 2nd level subtitle
            handleContentBreadcrumbVisibility(true);
        }
        updateHashInUrl(currentHref);
        createClickableBreadcrumb(getContentBreadcrumbTitle(), true);
    };

    $(".nav-container .nav-panel-menu a").off("click").on("click", onclick);

    $(".nav-container .nav-panel-menu a").off('keypress').on('keypress', function (event) {
        event.stopPropagation();
        // Space key
        if (event.which === 13 || event.keyCode === 13 || event.which === 32 || event.keyCode === 32) {
            $(this).trigger('click');
        }
    });
}

// Add css to selected TOC. If scrollTo is specified, scroll the TOC element into viewport.
function setSelectedTOC(resource, scrollTo) {
    var currentTOCSelected = $(".nav-menu .toc_sub_selected .is-current-page");
    var newHref = resource.attr("href");
    
    if(newHref){
        if (currentTOCSelected.length === 1) {
            var href = currentTOCSelected.find("a").attr("href");
            if (href.indexOf("#") !== -1) {
                href = href.substring(0, href.indexOf("#"));
            }
            // remove all hash href created based on the content if a different TOC element is clicked
            if (newHref.indexOf(href) === -1) {
                removeHashRefTOC(href);
            }
            currentTOCSelected.removeClass("is-current-page");
            if (currentTOCSelected.hasClass("toc_main_selected")) {
                currentTOCSelected.removeClass("toc_main_selected");
            } else if (currentTOCSelected.hasClass("toc_sub_selected")) {
                currentTOCSelected.removeClass("toc_sub_selected");
            }
        }
        resource.parent().addClass("is-current-page");
        if (newHref.indexOf("#") === -1) {
            resource.parent().addClass("toc_main_selected");
        } else {
            resource.parent().addClass("toc_sub_selected");
        }
    } else {
        // should not be here
    }
}

// Remove the 2nd level subtitles from TOC
function removeHashRefTOC(href) {
    var hashHref = $(".nav-container .nav-panel-menu").find("a[href^='" + href + "#']");
    $(hashHref).each(function () {
        $(this).parent().remove();
    });
}

// Update doc header breadcrumb with the current TOC title
function updateMainBreadcrumb(resource) {
    var currentHref = resource.attr("href");
    // main breadcrumb only includes the main href without any hash to land to a subheading
    if (currentHref !== undefined && currentHref.indexOf("#") === -1) {
        var lastBreadcrumb = $(".breadcrumb.fluid-container").find("li:last-child");
        var lastBreadcrumbAnchorTag = lastBreadcrumb.find("a");
        var lastBreadcrumbHref = lastBreadcrumbAnchorTag.attr("doc-href");
        if (currentHref !== lastBreadcrumbHref) {
            if (lastBreadcrumbAnchorTag.hasClass("inactive_link")) {
                // remove existing inactive link
                lastBreadcrumb.remove();
            }
            $(".breadcrumb.fluid-container").append("<li><a class='inactive_link' doc-href='" + resource.attr("href") + "'>" + resource.text() + "</a></li>");
        }
    }
}

// Update title in browser tab to show current page
function updateTitle(currentPage) {
    $("title").text(currentPage + " - Server Config - Open Liberty");
}

// History: 
//      From what we can recall from memory, the reason why we have this method is because
//      in smaller resolutions, for some reason, we need to animate the scroll to allow
//      a delay for the scrollTop to work.  In large resolutions, the animation scroll is
//      is not needed.
// Method:
function scrollToPos(pos) {
    return;
    if (isMobileView()) {
        // $("#background_container").css('height', iframeContents.height() + "px");
        $('html, body').animate({
            scrollTop: pos
        }, 400);
        $('footer').show();
    } else {
        $('html, body').animate({
            scrollTop: pos
        }, 400);
    }
}

// Handle history event involving expand/collapse toggle button
function handleExpandCollapseState(titleId, isExpand) {
    var hrefElement = $("article.doc").find('a[id="' + titleId + '"]');
    if (hrefElement.length === 1) {
        if (!hrefElement.is(":visible")) {
            // make its parent(s) visible
            var titleSplits = titleId.split("/");
            var parentTitleId = titleSplits[0];
            for (var i = 1; i < titleSplits.length - 1; i++) {
                parentTitleId += "/" + titleSplits[i];
                var parentToggleButton = $("article.doc").find("a[id='" + parentTitleId + "']").parent().find(".toggle");
                if (parentToggleButton.attr("collapsed") === "true") {
                    handleExpandCollapseToggleButton(parentToggleButton, false);
                }
            }
        }
        var toggleButton = $("article.doc").find("a[id='" + titleId + "']").parent().find(".toggle");
        if ((isExpand === true && (toggleButton.attr("collapsed") === "true")) ||
            (isExpand === false && (toggleButton.attr("collapsed") === "false"))) {
            handleExpandCollapseToggleButton(toggleButton, false);
        }
    }
}

// Add a browser history event with pushState. The event is to be used by the window.onpopstate to handle
// the forward and backward history events.
// The state contains two pieces of info: 
//   href: the content url including hash to point to the nested title
//   expand: use only if the event is triggered by the toggle button to expand/collapse the content
function updateHashInUrl(href, isExpand) {
    var hashInUrl = href;
    if (href.indexOf("/config/") !== -1) {
        hashInUrl = href.substring(17);
    }
    // a null is used by mobile for the TOC page
    var state = null;
    if (href !== "") {
        state = { href: href };
    }
    if (isExpand !== undefined) {
        if (isExpand) {
            hashInUrl += "&expand=true";
            state.expand = true;
        } else {
            hashInUrl += "&expand=false";
            state.expand = false;
        }
    }
    window.history.pushState(state, null, '#' + hashInUrl);
}

/// Modify the flat hierachary of the content to include nested levels with expand/collapse button
function handleSubHeadingsInContent() {
    var contentTitle = getContentBreadcrumbTitle();
    var anchors = $("article.doc div.paragraph > p > a");
    var deferAddingExpandAndCollapseToggleButton = [];

    if (anchors.length === 0) {
        addAnchorToSubHeadings();
        anchors = $("article.doc div.paragraph > p > a");
    }

    // in reverse order so that we can hide all the nested headings
    $($(anchors).get().reverse()).each(function () {
        var subHeading = $(this).parent();
        var anchorTitle = modifySubHeading(subHeading, contentTitle);
        var table = getTableForSubHeading(subHeading);
        var anchorTitleId = $(this).attr("id");
        var indentLevels = calcIndentAndAddClass(subHeading, anchorTitle, table, anchorTitleId);

        if (indentLevels >= minIndentLevel) {
            if (table) {
                addExpandAndCollapseToggleButtons(subHeading, anchorTitleId);
            } else {
                deferAddingExpandAndCollapseToggleButton.push({ heading: subHeading, anchorTitleId: anchorTitleId });
            }
        }
    });

    handleDeferredExpandCollapseElements(deferAddingExpandAndCollapseToggleButton);
}

function addAnchorToSubHeadings() {
    var subHeadings = $("article.doc > div.paragraph > p > strong");
    $($(subHeadings)).each(function() {
        var parent = $(this).parent();
        var id = parent.text().replace(/ > /g, "/");
        var anchorElement = $('<a id="' + id + '"></a>');
        parent.prepend(anchorElement);
    });
}

// Extract the first part of the content title as the breadcrumb title
function getContentBreadcrumbTitle() {
    var title = $('article.doc h1.page').text();
    var parsedTitle = getTitle(title);
    return parsedTitle;
}

function getTitle(title) {
    var retTitle = title;
    var openParamIndex = title.indexOf("(");
    var closeParamIndex = title.indexOf(")");
    if (openParamIndex !== -1 & closeParamIndex != -1) {
        retTitle = title.substring(openParamIndex + 1, closeParamIndex);
    }
    return retTitle.trim();
}

// remove strong from the last heading
function modifySubHeading(subHeadingElement, contentTitle) {
    var strong = subHeadingElement.find("strong");
    var anchorTitle;
    if (strong.length > 0) {
        anchorTitle = strong.text();
    } else {
        anchorTitle = subHeadingElement.text();
    }
    if (anchorTitle !== undefined) {
        var title = contentTitle + " > " + anchorTitle;
        var lastIndex = title.lastIndexOf(">");
        if (lastIndex !== -1) {
            var titleStrong = title.substring(0, lastIndex + 1);
            var titlePlain = title.substring(lastIndex + 1);
            strong.remove();
            subHeadingElement.append("<strong>" + titleStrong + "</strong>" + titlePlain);
        }

        // fix incomplete tag id cuz of colon
        if (title.indexOf(".") !== -1) {
            var titleId = title.replace(/ > /g, "/");
            subHeadingElement.find("a").attr("id", titleId);
        }
    }
    return title;
}

// get the table belonging to the subheading
function getTableForSubHeading(subHeadingElement) {
    var next = subHeadingElement.parent().next();
    while ((next.length === 1) && !next.is("table") && (next.find("p > a").length === 0)) {
        next = next.next();
    }
    if (next.is("table")) {
        return next;
    } else {
        return undefined;
    }
}

// calculate the heading indentation
function calcIndentAndAddClass(subHeadingElement, title, table, dataId) {
    var levels;
    if (title) {
        var splits = title.split(">");
        levels = splits.length;
        if (levels > maxIndentLevel) {
            levels = maxIndentLevel;
        }
        var marginLeft;
        if (levels > minIndentLevel) {
            marginLeft = (levels - minIndentLevel) * 49 + 69;
        }

        subHeadingElement.addClass(subHeadingClass);
        if (levels >= minIndentLevel) {
            subHeadingElement.addClass(subSectionClass);
            setDataId(subHeadingElement, dataId);
            if (marginLeft !== undefined) {
                subHeadingElement.css("margin-left", marginLeft + "px");
            }
            // add subsection class + extra left margin indentation
            var next = subHeadingElement.parent().next();
            while ((next.length === 1) && !next.is("table") && (next.find("p > a").length === 0)) {
                next.addClass(subSectionClass);
                setDataId(next, dataId);
                if (marginLeft !== undefined) {
                    next.css("margin-left", marginLeft + "px");
                }
                next = next.next();
            }
            if (table) {
                table.addClass(subSectionClass);
                setDataId(table, dataId);
                var width = parseInt(table.css("width").replace("px", ""));
                if (marginLeft !== undefined) {
                    table.css("margin-left", marginLeft - 10 + "px");
                    var marginValue = marginLeft - 10;
                    table.css("width", "calc(100% + 20px - " + marginLeft + "px - 10px)");
                } else {
                    table.css("width", "calc(100% + 20px - 59px)");
                }
            }
        }
    }
    return levels;
}

function setDataId(element, dataId) {
    element.attr("data-id", dataId);
}

function getDataId(element) {
    return element.attr("data-id");
}

function addExpandAndCollapseToggleButtons(subHeading, titleId) {
    var toggleButton = $('<div class="toggle" collapsed="true" tabindex=0><img src="../../../_/img/all_guides_plus.svg" alt="Expand" aria-label="Expand" /></div>');
    handleExpandCollapseTitle(titleId, false);
    toggleButton.on('click', function () {
        handleExpandCollapseToggleButton($(this), true);
    });
    toggleButton.on('keypress', function (event) {
        event.stopPropagation();
        // Enter or space key
        if (event.which === 13 || event.keyCode === 13 || event.which === 32 || event.keyCode === 32) {
            toggleButton.trigger('click');
        }
    });

    // listen for focus causing by tab. not mouse
    var mousedown = false;
    toggleButton.on('mousedown', function() {
        mousedown = true;
    });
    toggleButton.on('focus', function() {
        mousedown = false;
    });

    subHeading.prepend(toggleButton);
}

function handleExpandCollapseToggleButton(buttonElement, updateUrl) {
    var collapsed = buttonElement.attr('collapsed');
    var titleId = getDataId(buttonElement.parent());
    if (collapsed === "true") {
        // Expand to show the table and nested elements
        buttonElement.empty().append($('<img src="../../../_/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse"/>'));
        buttonElement.attr('collapsed', false);
        // this call needs to be done after collapsed is set to false
        handleExpandCollapseTitle(titleId, true);
    } else {
        // Collapse the table and nested elements
        handleExpandCollapseTitle(titleId, false);
        buttonElement.empty().append($('<img src="../../../_/img/all_guides_plus.svg" alt="Expand" aria-label="Expand"/>'));
        buttonElement.attr('collapsed', true);
    }
    if (updateUrl) {
        var href = getSelectedDocHtml() + "#";
        updateHashInUrl(href + titleId, true);
    }
}

function handleExpandCollapseTitle(titleId, isShow) {
    var content = $('article.doc');
    var matchingElements = content.find('[data-id^="' + titleId + '"]');
    var hideElements = [];
    $(matchingElements).each(function () {
        var dataId = getDataId($(this));
        if (isShow) {
            // don't show already collapsed element
            var toggleButton = $(this).find(".toggle");
            if (toggleButton.length === 1) {
                if (toggleButton.attr("collapsed") === "true") {
                    var elements = content.find("[data-id^='" + dataId + "']");
                    $(elements).each(function () {
                        var nestedDataId = getDataId($(this));
                        if ((nestedDataId === dataId && $(this).is("table")) ||
                            /* detect id with same string + more such as http-method-omission when matching http-method */
                            (nestedDataId !== dataId && (nestedDataId.indexOf(dataId + "/") === 0))) {
                            hideElements.push($(this));
                        }
                    })
                }
            }

            if (dataId === titleId && $(this).is("div") && $(this).hasClass("collapseMargin")) {
                $(this).removeClass("collapseMargin");
            }
            $(this).show();
        } else {
            // don't hide the clicked toggle element title and description
            if ((dataId === titleId && $(this).is("table")) || (dataId !== titleId && (dataId.indexOf(titleId + "/") === 0))) {
                $(this).hide();
            } else if (dataId === titleId && $(this).is("div")) {
                $(this).addClass("collapseMargin");
            }
        }
    });
    $(hideElements).each(function () {
        $(this).hide();
    })
    if (!isMobileView()) {
        content.trigger("scroll"); // trigger a scroll event to update the breadcrumb
    }
}

function handleDeferredExpandCollapseElements(deferredElements) {
    $(deferredElements).each(function () {
        var subHeading = $(this).attr("heading");
        var titleId = $(this).attr("anchorTitleId");
        var matchingElements = $('article.doc').find('[data-id^="' + titleId + '"]');
        $(matchingElements).each(function () {
            var dataId = getDataId($(this));
            if (dataId !== titleId && (dataId.indexOf(titleId + "/") === 0)) {
                addExpandAndCollapseToggleButtons(subHeading, titleId);
                return false;
            }
        });
    });
}

// change the evenly divided fixed cell width (25%)
function modifyFixedTableColumnWidth() {
    var article = $('article.doc');
    var colgroups = article.find("colgroup");
    var colWidths = [];
    if (!isMobileView()) {
        colWidths[4] = ["25%", "15%", "15%", "45%"];
    // } else {
    //     colWidths[4] = ["25%", "25%", "15%", "35%"];
    }
    $(colgroups).each(function () {
        if (isMobileView()) {
            $(this).remove();
        } else {
            var cols = $(this).find("col");
            var currentColWidths = colWidths[cols.length];
            if (currentColWidths) {
                $(cols).each(function (index) {
                    $(this).css("width", currentColWidths[index]);
                })
            }
        }
    })
}

// Find the table of content element for the content. If processHash is specified, return
// the TOC sub element corresponding to the hash. If there is no TOC sub element for it
// (as in the case of the hash populated by clicking on the content breadcrumb), return undefined.
function findTOCElement(processHash) {
    // Remove the path and version from the url
    var configIndex = location.href.indexOf('/config/');
    var href = location.href.substring(configIndex + 8);
    var slashIndex = href.indexOf('/');
    href = href.substring(slashIndex + 1); // Remove Antora version from href
    var hashIndex = href.indexOf('#');
    if(hashIndex !== -1){
        var hash = href.substring(hashIndex);
        href = href.substring(0, hashIndex);
    }    

    var matchingTOCElement;
    if (!processHash) {
        matchingTOCElement = $(".nav-container .nav-panel-menu a[href='" + href + "']");
    } else {
        if (hash !== undefined && hash !== "") {
            href = href + hash;
            matchingTOCElement = $(".nav-container .nav-panel-menu a[href='" + href + "']");
            if (matchingTOCElement.length === 0) {
                matchingTOCElement = undefined;
            }
        }
    }
    return matchingTOCElement;
}

// add the second level headings to the TOC
function handleSubHeadingsInTOC(TOCElement) {
    var href = getSelectedDocHtml();
    removeHashRefTOC(href);

    var anchors = $("article.doc > div.paragraph > p > a");
    var anchorLI = TOCElement.parent();
    var anchorHref = TOCElement.attr("href");
    $(anchors).each(function () {
        var subHeading = $(this).parent();
        if (subHeading.hasClass("subsection") === false) {
            var anchorTitleId = $(this).attr("id");
            var anchorTitleText = subHeading.text();
            var anchorTitleTextIndex = anchorTitleText.lastIndexOf(" > ");
            if (anchorTitleTextIndex !== -1) {
                anchorTitleText = anchorTitleText.substring(anchorTitleTextIndex + 3);
            }
            var tocLI = $('<li class="nav-item" style="margin-left: 18px"><a href="' + anchorHref + '#' + anchorTitleId + '">' + anchorTitleText + '</a></li>');
            anchorLI.after(tocLI);
            anchorLI = tocLI;
        }
    });
    addTOCClick();
}

function getSelectedDocHtml() {
    var currentTOCSelected = $(".is-current-page > a");
    var href = "";
    if (currentTOCSelected.length === 1) {
        href = currentTOCSelected.attr("href");
        if (href.indexOf("#") !== -1) {
            href = href.substring(0, href.indexOf("#"));
        }
    }
    return href;
}

function handleContentScrolling() {
    if (!isMobileView()) {
        var article = $('article.doc');
        var lastViewPos = -99999;
        
        var onContentScroll = function () {
            // determine whether it is scrolling up or down
            var scrollDown = false;
            var currentScrollTop = $(this).scrollTop();
            if (lastViewPos < currentScrollTop) {
                scrollDown = true;
            }

            lastViewPos = currentScrollTop;
            var breadcrumbVisible = $('.contentStickyBreadcrumbHeader').is(':visible');

            if(article.find('.page').text() == "Server configuration overview") {
                // No top breadcrumb bar for overview pages,
                // therefore skip all the breadcrumb handling code
                return;
            }

            // content breadcrumb only appears after content title and its first table are out of view
            var initialContentInView = isInitialContentInView(lastViewPos);
            if (breadcrumbVisible && !scrollDown) {
                // breadcrumb is visible and a scrolling up case, check whether initial content is back in view to
                // determine whether breadcrumb stays visible or not
                if (initialContentInView) {
                    breadcrumbVisible = false;
                    handleContentBreadcrumbVisibility(false);
                }
            } else if (!breadcrumbVisible && scrollDown) {
                // breadcrumb is not visible and a scrolling down case, check whether initial content is out of view to
                // determine whether breadcrumb switches to visible
                if (!initialContentInView) {
                    breadcrumbVisible = true;
                    handleContentBreadcrumbVisibility(true);
                }
            }
            if (breadcrumbVisible) {
                // go through subheadings to determine the content of breadcrumb
                var anchors = article.find("div.paragraph > p > a");
                var closestAnchor = {};
                $(anchors).each(function () {
                    if ($(this).parent().is(":visible") && isInViewport($(this), closestAnchor)) {
                        return false;
                    }
                });

                if (closestAnchor.element && !closestAnchor.inView) {
                    var title = closestAnchor.element.parent().text();
                    createClickableBreadcrumb(title, true);
                } else {
                    createClickableBreadcrumb(getContentBreadcrumbTitle(), true);
                }
            }
        };

        $(window.parent.document).off('scroll').on('scroll', onContentScroll);
    }
}

function isInitialContentInView(currentViewPos) {
    var inViewPort = true;
    var article = $('article.doc');
   
    // look for the last element for the initial content
    var firstSubheadingElement = article.find("div.paragraph > p > a").first();
    if (firstSubheadingElement.length === 1) {
        var lastInitialContentElement = firstSubheadingElement.parent().parent().prev();
        var lastInitialContentElementRect = lastInitialContentElement[0].getBoundingClientRect();
        var breadcrumbHeight = 0;
        if ($(".contentStickyBreadcrumbHeader").is(':visible')) {
            breadcrumbHeight = $(".contentStickyBreadcrumbHeader").outerHeight();
        }
        if (lastInitialContentElementRect.top + lastInitialContentElementRect.height - breadcrumbHeight < currentViewPos) {
            inViewPort = false;
        }
    }

    return inViewPort;
}

function isInViewport(anchorElement, closestAnchor) {
    var element = anchorElement.parent();
    var elementTop = element[0].getBoundingClientRect().top;
    // factor in the fixed header height including the main header if the parent scrollbar is scrolled to the 
    // bottom to reveal the footer
    var headerHeight = contentBreadcrumbHeight + 101; // Nav height is 101 but we can't calculate it.

    // timing problem that the height could be overriden and be 1. Stepping thru debugger won't have the problem.
    //var contentBreadcrumbHeight = $(".contentStickyBreadcrumbHeader").outerHeight();

    var contentTop = elementTop - headerHeight;
    var contentBottom = contentTop + parseInt(element.css("height"));
    var viewportHeight = document.documentElement.clientHeight;
    var contentHeight = viewportHeight - headerHeight;
    if ((contentTop >= 0 || contentBottom > 0) && contentBottom <= contentHeight) {
        // element is not covered by the breadcrumb and is in the viewport - we're done
        // if the next element is the second level subheading and is near the top of the viewport,
        // return it to be used as the breadcrumb
        if (element.text().split(">").length === 2 && contentTop < 50) {
            closestAnchor.top = contentTop;
            closestAnchor.element = element;
            closestAnchor.inView = true;
        }
        return true;
    } else if (contentTop > 0) {
        // for case when there is no subheading shown in the viewport and no need to go thru the rest of the subheadings once
        // a subheading is found out of viewport
        return true;
    } else if (contentTop < 0) {
        // element is covered by breadcrumb
        closestAnchor.top = contentTop;
        closestAnchor.element = element;
        closestAnchor.inView = false;
        return false;
    } else {
        // should not be here
        return false;
    }
}

function createClickableBreadcrumb(breadcrumbText, highlightLastItem) {
    if (!isMobileView() && !isIPadView()) {
        $('.contentStickyBreadcrumbHeader .stickyBreadcrumb').remove();
        // hide it for now until the font size is determined
        $(".contentStickyBreadcrumbHeader").append("<div class='stickyBreadcrumb'/>");
        $('.contentStickyBreadcrumbHeader .stickyBreadcrumb').hide();
        if (breadcrumbText.length > 0) {
            var breadcrumbTextSplits = breadcrumbText.split(" > ");
            var href = getSelectedDocHtml();
            var stickyHeaderBreadcrumb = "";
            for (var i = 0; i < breadcrumbTextSplits.length; i++) {
                if (i === 1) {
                    href = href + "#";
                }
                if (i > 1) {
                    href = href + "/";
                }
                if (i > 0) {
                    href = href + breadcrumbTextSplits[i];
                    stickyHeaderBreadcrumb = stickyHeaderBreadcrumb + " > ";
                }

                if (highlightLastItem && (i === breadcrumbTextSplits.length - 1)) {
                    stickyHeaderBreadcrumb = stickyHeaderBreadcrumb + "<a class='lastParentItem'>" + breadcrumbTextSplits[i] + "</a>";
                } else {
                    stickyHeaderBreadcrumb = stickyHeaderBreadcrumb + "<a href='" + href + "'>" + breadcrumbTextSplits[i] + "</a>";
                }
            }
            $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").append(stickyHeaderBreadcrumb);

            // adjust the breadcrumb font if its width is larger than the page width
            var paddingWidth = parseInt($(".contentStickyBreadcrumbHeader").css("padding-left")) +
                parseInt($(".contentStickyBreadcrumbHeader").css("padding-right"));
            var breadcrumbWidth = $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").width() + paddingWidth;
            var contentWindowWidth = $('article.doc').width();
            var fontSize = 32;
            while (breadcrumbWidth > contentWindowWidth && fontSize > 0) {
                $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").css("font-size", fontSize + "px");
                breadcrumbWidth = $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").width() + paddingWidth;
                fontSize = fontSize - 2;
            }
            $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").show();

            addContentBreadcrumbClick();
        }
    }
}

function addContentBreadcrumbClick() {
    // listen to breadcrumb element that has a href in it
    $(".stickyBreadcrumb a[href]").off("click").on("click", function (event) {
        event.preventDefault();
        var href = $(event.currentTarget).attr("href");
        updateHashInUrl(href);

        // Find anchor and jump to it
        var scrollTop = 0;
        var hashIndex = href.indexOf('#');
        var hash = href.substring(hashIndex + 1); 
        var anchor = $('article.doc').find("div.paragraph > p > a[id='" + hash + "']");
        if(anchor.length == 1){
            scrollTop = anchor.offset().top;
        }    
        $('html,body').animate({scrollTop: scrollTop - 101}, 500);         
    });
}

// When the parent window scrolls, it affects the viewport of the content. Hence needs to adjust
// the content breadcrumb.
function handleParentWindowScrolling() {
    if (!isMobileView() && !isIPadView()) {
        $(window.parent.document).on('scroll', function (e) {
            var breadcrumbVisible = $('.contentStickyBreadcrumbHeader').is(':visible');
            // for parent window scrolling, need to adjust breadcrumb only when content breadcrumb is visible
            if (breadcrumbVisible) {
                // go through subheadings to determine the content of breadcrumb
                var article = $('article.doc');
                var anchors = article.find("div.paragraph > p > a");
                var closestAnchor = {};
                $(anchors).each(function () {
                    if ($(this).parent().is(":visible") && isInViewport($(this), closestAnchor)) {
                        return false;
                    }
                });

                if (closestAnchor.element && !closestAnchor.inView) {
                    // normal scrolling elements
                    var title = closestAnchor.element.parent().text();
                    createClickableBreadcrumb(title, true);
                } else {
                    // scrolling when the previous 2nd level title and its nested titles are all
                    // scrolled passed the viewport and the next 2nd level title comes in view
                    createClickableBreadcrumb(getContentBreadcrumbTitle(), true);
                }
            }
        })
    }
}

// If the doc content is in focus by means of other than a mouse click, then goto the top of the 
// doc.
function addConfigContentFocusListener() {
    var mousedown = false;
    $("#config_content").on('mousedown', function(event) {
        mousedown = true;
    });
    $('#config_content').on("focusin", function(e) {
        if (!mousedown) {
            scrollToPos(0);
        }
        mousedown = false;
    });
}

// Handle content loading based on the url
function handleInitialContent() {
    // if hash is included in the url, load the content document and replace the
    // history state. Otherwise, load the first document.
    if (window.location.hash !== "" && window.location.hash !== undefined) {
        updateTitle(window.location.hash.replace("#", "").replace(".html", ""));
    } else {
        updateTitle("OVERVIEW");
    }
}

function handlePopstate() {
    window.onpopstate = function (event) {
        if (event.state) {
            var popstateHrefPathname = event.state.href;
            if (event.state.href.indexOf("#") !== -1) {
                popstateHrefPathname = event.state.href.substring(0, event.state.href.indexOf("#"));
            }

            if (location.pathname === popstateHrefPathname) {
                // if content document is already loaded, 
                // - expand/collapse the subheading if the expand property is set
                // - scroll to the matching heading
                if (event.state.expand !== undefined && event.state.href.indexOf("#") !== -1) {
                    var titleId = event.state.href.substring(event.state.href.indexOf('#') + 1);
                    handleExpandCollapseState(titleId, event.state.expand);
                }
                if (event.state.href.indexOf("#") !== -1) {
                    handleContentBreadcrumbVisibility(true);
                } else {
                    handleContentBreadcrumbVisibility(false);
                }

                // select TOC
                var TOCSubElement = $(".nav-container .nav-panel-menu").find("a[href='" + event.state.href + "']");
                if (TOCSubElement.length === 1) {
                    setSelectedTOC(TOCSubElement, true);
                }
            }

            // hamburger for TOC is in expanded state, collapse it and display the content 
            if (isMobileView() && $("#toc_column").hasClass('in')) {
                $(".breadcrumb_hamburger_nav").trigger('click');
            }
        } else {
            if (isMobileView()) {
                // hamburger for TOC is in collapsed state, expand it and hide the content
                if (!$("#toc_column").hasClass('in')) {
                    $(".breadcrumb_hamburger_nav").trigger('click');
                }
            }
        }
    }
}

// Determine the content breadcrumb visibility:
// - content breadcrumb not display in initial content
// - once the overview of the content is scrolled thru, display the content breadcrumb right before the
//   first 2nd subtitle is scrolled into.
function initialContentBreadcrumbVisibility() {
    if (!isMobileView() && !isIPadView()) {
        // save the content breadcrumb height to be used later as the height could be 1 during the transition 
        // to display it in isInViewPort function
        contentBreadcrumbHeight = $(".contentStickyBreadcrumbHeader").outerHeight();
        var href = location.href;
        var hashPos = href.indexOf("#");
        // no breadcrumb when there is no hash or a trailing # 
        if (hashPos === -1 || hashPos === href.length - 1) {
            handleContentBreadcrumbVisibility(false);
        } else {
            handleContentBreadcrumbVisibility(true);
        }
    }
}

// Enable/disable content breadcrumb visibility
function handleContentBreadcrumbVisibility(isShow) {
    if (!isMobileView() && !isIPadView()) {
        if (isShow && !$('.contentStickyBreadcrumbHeader').is(":visible")) {
            // with scrolling listener not on the content anymore, disable scrolling listener until animation is done
            $(window.parent.document).off('scroll');
            $('.contentStickyBreadcrumbHeader').slideDown(500, function() {
                handleContentScrolling();
            });
        } else if (!isShow && $('.contentStickyBreadcrumbHeader').is(":visible")) {
            // with scrolling listener not on the content anymore, disable scrolling listener until animation is done
            $(window.parent.document).off('scroll')
            $('.contentStickyBreadcrumbHeader').slideUp(500, function() {
                handleContentScrolling();
            });
            $('article.doc').css("padding-top", "0px");
        }
    }
}

// Handling the hamburger for TOC to hide/display config content
function addHamburgerClick() {
    if (isMobileView()) {
        var hamburger = $(".breadcrumb_hamburger_nav");

        hamburger.on("click", function (e) {
            if ($("#toc_column").hasClass('in')) {
                $("#config_content").show();
                $("#breadcrumb_hamburger").show();
                $("#breadcrumb_hamburger_title").show();
            } else {
                $("#config_content").hide();
                $("#breadcrumb_hamburger").hide();
                $("#breadcrumb_hamburger_title").hide();
                // reset the container height to show table of content
                $("#background_container").css("height", "auto");
                $("#toc_inner").css("height", "auto");
                // since the opening/closing of the toc container is managed by the hamburger,
                // it always scrolls back to the top of the TOC. The codes here cannot override  
                // the scrolling position as the default hamburger click event has not been fired
                // yet.
                // $("#toc_column").show();
                // var selectedTOC = $(".is-current-page");
                // // move the TOC back to the previously selected spot
                // $('#toc_column').scrollTop(selectedTOC[0].getBoundingClientRect().top);

                if (window.location.hash) { 
                    updateHashInUrl("");
                }
            }
        })
    }
}

function isMobileView() {
    if ($(window).width() <= mobileWidth) {
        return true;
    } else {
        return false;
    }
}

function isIPadView() {
    if ($(window).width() <= ipadWidth && $(window).width() > mobileWidth) {
        return true;
    } else {
        return false;
    }
}

// function updateHashAfterRedirect() {
//     var hashValue = window.location.hash;
//     var href = "";
//     if (hashValue !== "" && hashValue.indexOf("#rwlp_config_") !== -1) {
//         hashValue = hashValue.substring("#rwlp_config_".length);
//         //hashValue = hashValue.substring(1);
//         if (hashValue.indexOf("&") !== -1) {
//             href = "/docs/ref/config/" + hashValue.substring(0, hashValue.indexOf("&"));
//         } else {
//             href = "/docs/ref/config/" + hashValue;
//         }
    
//         if (location.pathname + location.hash === href) {
//             replaceHistoryState('#' + hashValue);
//         }
//     }
// }

function replaceHistoryState(hashToReplace) {
    var fullHref = "/docs/ref/config/" + hashToReplace.substring(1);
    var isExpand = undefined;
    if (fullHref.indexOf("&") !== -1) {
        fullHref = fullHref.substring(0, fullHref.indexOf("&"));
        if (hashToReplace.indexOf("&expand=true") !== -1) {
            isExpand = true;
        } else if (hashToReplace.indexOf("&expand=false") !== -1) {
            isExpand = false;
        }
    }
    var state = { href: fullHref };
    if (isExpand !== undefined) {
        state.expand = isExpand;
    }
    window.history.replaceState(state, null, hashToReplace);
    return fullHref;
}

// Take care of displaying the table of content, comand content, and hamburger correctly when
// browser window resizes from mobile to non-mobile width and vice versa.
function addWindowResizeListener() {
    $(window).on('resize', function() {
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

// This function was written for the Server Configuration overview pages only.
// When we have a page that has an anchor that references another section in the same page,
// the browser scrolls that section, on the same page, into view.
// When the scrolling occurs, the whole page was being scrolled "under" our top navigation bar.
// rather than the whole page
function addOverviewPageClickAndScroll() {
    var article = $('article.doc');
    var allHashAnchorsInOverviewPages = 'div[id="overview_content"] a[href^="#"]';
    var overviewAnchors = article.find(allHashAnchorsInOverviewPages);
    overviewAnchors.on("click",function (event) {
        event.preventDefault();
        var hash = this.hash;
        var target = article.find(hash);
        var newTop = target.offset().top;
        scrollToPos(newTop);
    });
}

$(document).ready(function () {
    addTOCClick();
    addConfigContentFocusListener();
    handleInitialContent();
    addHamburgerClick();
    addWindowResizeListener();
    handlePopstate();

    addOverviewPageClickAndScroll();
    initialContentBreadcrumbVisibility();
    modifyFixedTableColumnWidth();
    handleSubHeadingsInContent();
    var TOCElement = findTOCElement();
    handleSubHeadingsInTOC(TOCElement); // this adds the sub elements to li so check here for the hash usage
    var TOCSubElement = findTOCElement(true);
    if (TOCSubElement) {
        setSelectedTOC(TOCSubElement, true);
    } else if (TOCElement) {
        setSelectedTOC(TOCElement, true);
    }
    createClickableBreadcrumb(getContentBreadcrumbTitle(), true);
    if (TOCElement) {
        updateMainBreadcrumb(TOCElement);
    }

    if (!isMobileView() && !isIPadView()) {         
        handleContentScrolling();
    } 

    if (window.location.hash !== "" && window.location.hash !== undefined &&
        window.location.hash.indexOf("&expand=") !== -1) {
        var isExpand;
        if (window.location.hash.indexOf("&expand=true") !== -1) {
            isExpand = true;
        } else if (window.location.hash.indexOf("&expand=false") !== -1) {
            isExpand = false;
        }
        var hash = window.location.hash.substring(1);
        if (hash.indexOf("#") !== -1) {
            var titleId = hash.substring(hash.indexOf('#') + 1, hash.indexOf("&"));
            handleExpandCollapseState(titleId, isExpand);
        }
    }

    // update hash if it is redirect
    // updateHashAfterRedirect();

    if (isMobileView() && $("#toc_column").hasClass('in')) {
        $(".breadcrumb_hamburger_nav").trigger('click');
    }
});