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

function addTOCClick() {
    var onclick = function(event){
        // clean out the breadcrumb so that it cannot be clicked on while loading/repositioning the doc
        $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").remove();
        var resource = $(event.currentTarget);
        setSelectedTOC(resource);
        var currentHref = resource.attr("href");

        // handle the click event ourselves so as to take care of updating the hash and creating
        // the push state 
        event.preventDefault();
        event.stopPropagation();
        if (currentHref.indexOf("#") === -1) {
            setIframeLocationHref(currentHref);
            updateMainBreadcrumb(resource);
        } else {
            //event.preventDefault();
            handleIFrameDocPosition(currentHref);
        }
        updateHashInUrl(currentHref);

        createClickableBreadcrumb(getTOCTitle(resource));
    }

    $("#toc_container a").off("click").on("click", onclick);
}

function setSelectedTOC(resource) {
    var currentTOCSelected = $(".toc_selected");
    var newHref = resource.attr("href");

    if (currentTOCSelected.length === 1) {
        var href = currentTOCSelected.find("a").attr("href");
        if (href.indexOf("#") !== -1) {
            href = href.substring(0, href.indexOf("#"));
        }
        // remove all hash href created based on the content if a different TOC element is clicked
        if (newHref.indexOf(href) === -1) {
            removeHashRefTOC(href);
        }
        currentTOCSelected.removeClass("toc_selected");
    }
    resource.parent().addClass("toc_selected");
}

function removeHashRefTOC(href) {
    var hashHref = $("#toc_container").find("a[href^='" + href + "#']");
    $(hashHref).each(function () {
        $(this).parent().remove();
    })
}

function setIframeLocationHref(href) {
    var iframeContent = $('iframe[name="contentFrame"]').contents();
    if (iframeContent.attr("location").href !== href) {    
        iframeContent.attr("location").replace(href);
    }
}

function updateMainBreadcrumb(resource) {
    var currentHref = resource.attr("href");
    // not adding subHeading to the breadcrumb
    if (currentHref !== undefined && currentHref.indexOf("#") === -1) {
        var lastBreadcrumb = $(".breadcrumb.fluid-container").find("li:last-child");
        var lastBreadcrumbAnchorTag = lastBreadcrumb.find("a");
        var lastBreadcrumbHref = lastBreadcrumbAnchorTag.attr("doc-href");
        if (currentHref !== lastBreadcrumbHref) {
            if (lastBreadcrumbAnchorTag.hasClass("inactive_link")) {
                // remove existing inactive link
                lastBreadcrumb.remove();
            }
            $(".breadcrumb.fluid-container").append("<li><a class='inactive_link' doc-href='" + resource.attr("href") + "' target='contentFrame'>" + resource.text() + "</a></li>");
        }
    }
}

// Using anchor href to jump to a heading in the doc within an iframe causes the parent window to scroll too.
// To avoid the scrolling of the parent window, manually scroll to the position of the heading.
function handleIFrameDocPosition(href) {
    var hrefElement = "";
    var index = href.indexOf("#");
    var iframeContents = $('iframe[name=contentFrame]').contents();
    adjustParentScrollView(); 
    if (index !== -1) {
        if (href.length === index + 1) {
            // handle positioning to the top
            iframeContents.scrollTop(0);
        } else {
            // get the id of the anchor from the href
            var hrefHashId = href.substring(index + 1);

            // locate the anchor within the iframe
            var hrefElement = iframeContents.find('a[id="' + hrefHashId + '"]');
            if (hrefElement.length === 1) {
                // get the offset position of the target anchor
                var elementTop = hrefElement.offset().top;
                // get the height of its parent
                var elementHeight = hrefElement.parent().height();
                // factor in the fixed content breadcrumb height 
                var contentBreadcrumbHeight = $(".contentStickyBreadcrumbHeader").outerHeight();

                // scroll to the position that will show the target anchor below the fixed content breadcrumb
                iframeContents.scrollTop(elementTop - elementHeight - contentBreadcrumbHeight);
            }
        }
    } else {
        iframeContents.scrollTop(0);
    }
}

// add a browser history entry with pushState to be used by the window.onpopstate to handle
// the forward and backward history events.
function updateHashInUrl(href) {
    var hashInUrl = href;
    if (href.indexOf("/config/") !== -1) {
        hashInUrl = href.substring(8);
    }
    window.history.pushState(href, null, '#' + hashInUrl);
}

// display the first doc content by default
function selectFirstDoc() {
    var firstTOCElement = $("#toc_container a").first();
    var href = firstTOCElement.attr("href");
    var iframeContents = $('iframe[name=contentFrame]').contents();
    iframeContents.attr("location").replace(href);

    //firstTOCElement.click();
    //updateMainBreadcrumb(firstTOCElement);
    //createClickableBreadcrumb(getTOCTitle(firstTOCElement));
    //window.history.pushState(null, null, null);
}

/// modify the flat hierachary of the content to include nested levels with expand/collapse button
function handleSubHeadingsInContent() {
    var contentTitle = getContentBreadcrumbTitle();
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var anchors = iframeContents.find("div.paragraph > p > a");
    var deferAddingExpandAndCollapseToggleButton = [];

    $(anchors).each(function () {
        var subHeading = $(this).parent();
        var anchorTitle = modifySubHeading(subHeading, contentTitle);
        var table = getTableForSubHeading(subHeading);
        var anchorTitleId = $(this).attr("id");
        var indentLevels = calcIndentAndAddClass(subHeading, anchorTitle, table, anchorTitleId);

        if (indentLevels >= minIndentLevel) {
            if (table) {
                addExpandAndCollapseToggleButtons(subHeading, anchorTitleId);
            } else {
                deferAddingExpandAndCollapseToggleButton.push({heading: subHeading, anchorTitleId: anchorTitleId});
            }
        }
    });

    handleDeferredExpandCollapseElements(deferAddingExpandAndCollapseToggleButton);
}

// Extract the first part of the content title as the breadcrumb title
function getContentBreadcrumbTitle() {
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var contentTitle = iframeContents.find("#config_title").text();
    if (contentTitle.indexOf(" - ") !== -1) {
        contentTitle = contentTitle.substring(0, contentTitle.indexOf(" - "));
    }
    return contentTitle;
}

function getTOCTitle(resource) {
    var tocTitle = resource.text();
    if (tocTitle.indexOf(" - ") !== -1) {
        tocTitle = tocTitle.substring(0, tocTitle.indexOf(" - "));
    }
    return tocTitle;
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
    var toggleButton = $('<div class="toggle" collapsed="false" tabindex=0><img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse" /></div>');
    toggleButton.on('click', function () {
        var collapsed = $(this).attr('collapsed');
        if (collapsed === "true") {
            // Expand to show the table and nested elements
            $(this).empty().append($('<img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse"/>'));
            $(this).attr('collapsed', false);
            // this call needs to be done after collapsed is set to false
            handleExpandCollapseTitle(titleId, true);
        }
        else {
            // Collapse the table and nested elements
            handleExpandCollapseTitle(titleId, false);
            $(this).empty().append($('<img src="/img/all_guides_plus.svg" alt="Expand" aria-label="Expand"/>'));
            $(this).attr('collapsed', true);
        }
        //updateContentBreadcrumb($(this).parent().text());
    });
    toggleButton.on('keypress', function (event) {
        event.stopPropagation();
        // Enter key
        if (event.which === 13 || event.keyCode === 13) {
            toggleButton.click();
        }
    });
    subHeading.prepend(toggleButton);    
}

function handleExpandCollapseTitle(titleId, isShow) {
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var matchingElements = iframeContents.find('[data-id^="' + titleId + '"]');
    var hideElements = [];
    $(matchingElements).each(function () {
        var dataId = getDataId($(this));
        if (isShow) {
            // don't show already collapsed element
            var toggleButton = $(this).find(".toggle");
            if (toggleButton.length === 1) {
                if (toggleButton.attr("collapsed") === "true") {
                    var elements = iframeContents.find("[data-id^='" + dataId + "']");
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
    $(hideElements).each(function() {
        $(this).hide();
    })
    $('iframe[name=contentFrame]').contents().trigger("scroll"); // trigger a scroll event to update the breadcrumb
}

function handleDeferredExpandCollapseElements(deferredElements) {
    var iframeContents = $('iframe[name=contentFrame]').contents();
    $(deferredElements).each(function() {
        var subHeading = $(this).attr("heading");
        var titleId = $(this).attr("anchorTitleId");
        var matchingElements = iframeContents.find('[data-id^="' + titleId + '"]');
        $(matchingElements).each(function() {
            var dataId = getDataId($(this));
            if (dataId !== titleId && (dataId.indexOf(titleId + "/") === 0)) {
                addExpandAndCollapseToggleButtons(subHeading, titleId);
                return false;
            }
        })
    })
}

// change the evenly divided fixed cell width (25%)
function modifyFixedTableColumnWidth() {
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var colgroups = iframeContents.find("colgroup");
    var colWidths = [];
    colWidths[4] = ["25%", "15%", "15%", "45%"];
    $(colgroups).each(function() {
        var cols = $(this).find("col");
        var currentColWidths = colWidths[cols.length];
        if (currentColWidths) {
            $(cols).each(function(index) {
                $(this).css("width", currentColWidths[index]);
            })
        }
    })
}

// Find the table of content element for the content. If processHash is specified, return
// the TOC sub element corresponding to the hash. If there is no TOC sub element for it
// (as in the case of the hash populated by clicking on the content breadcrumb), return undefined.
function findTOCElement(processHash) {
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var href = iframeContents.attr("location").pathname;
    var matchingTOCElement;
    if (!processHash) {
        matchingTOCElement = $("#toc_container a[href='" + href + "']");
    } else {
        var hash = iframeContents.attr("location").hash;
        if (hash !== undefined && hash !== "") {
            href = href + hash;
        
            matchingTOCElement= $("#toc_container a[href='" + href + "']");
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

    var iframeContents = $('iframe[name=contentFrame]').contents();
    var anchors = iframeContents.find("div.paragraph > p > a");
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
            var tocLI = $('<li style="margin-left: 18px"><a href="' + anchorHref + '#' + anchorTitleId + '" target="contentFrame">' + anchorTitleText + '</a></li>');
            anchorLI.after(tocLI);
            anchorLI = tocLI;
        }
    });
    addTOCClick();
}

function getSelectedDocHtml() {
    var currentTOCSelected = $(".toc_selected > a");
    var href = "";
    if (currentTOCSelected.length === 1) {
        href = currentTOCSelected.attr("href");
        if (href.indexOf("#") !== -1) {
            href = href.substring(0, href.indexOf("#"));
        }
    }
    return href;
}

function handleDocScrolling() {
    var frameContents = $('iframe[name="contentFrame"]').contents();

    var onScroll = function(e) {
        var frameView = $(this);
        var anchors = frameContents.find("div.paragraph > p > a");
        var closestAnchor = {};
        $(anchors).each(function() {
            if ($(this).parent().is(":visible") && isInViewport($(this), frameView, closestAnchor)) {
                return false;
            }
        })

        if (closestAnchor.element) {
            var title = closestAnchor.element.parent().text();
            if (title.lastIndexOf(" > ") !== -1) {
                title = title.substring(0, title.lastIndexOf(" > "));
            }

            createClickableBreadcrumb(title, true);
        }

        adjustParentScrollView();
    }

    frameContents.off('scroll').on('scroll', onScroll);
}

function isInViewport(anchorElement, viewWindow, closestAnchor) {    
    var closestTop = -999999;
    if (closestAnchor.top) {
        closestTop = closestAnchor.top;
    }
    var element = anchorElement.parent();
    var elementTop = element[0].getBoundingClientRect().top;
    //var mainBreadcrumbHeight = $(".navbar").outerHeight();
    var contentBreadcrumbHeight = $(".contentStickyBreadcrumbHeader").outerHeight();
    var contentTop = elementTop - contentBreadcrumbHeight; 
    var contentBottom = contentTop + parseInt(element.css( "height" )) ;
    var viewportHeight = viewWindow[0].documentElement.getBoundingClientRect().height;
    var contentHeight = viewportHeight - contentBreadcrumbHeight;
    // element is not covered by the breadcrumb and is in the viewport
    if ((contentTop >= 0 || contentBottom > 0) && contentBottom <= contentHeight) {
        closestAnchor.top = contentTop;
        closestAnchor.element = element;
        closestAnchor.inView = true;
        return true;
    } else if (contentTop > 0) {
        // for case when there is no subheading shown in the viewport and no need to go thru the rest of the subheadings once
        // a subheading is found out of viewport
        return true;
    } else if (contentTop < 0) {
        closestAnchor.top = contentTop;
        closestAnchor.element = element;
        closestAnchor.inView = false;
        return false;
    } else {
        return false;
    }
}

function createClickableBreadcrumb(breadcrumbText, highlightLastItem) {
    $('.contentStickyBreadcrumbHeader .stickyBreadcrumb').remove();
    // hide it for now until the font size is determined
    $(".contentStickyBreadcrumbHeader").append("<div class='stickyBreadcrumb'/>");
    $('.contentStickyBreadcrumbHeader .stickyBreadcrumb').hide();
    var breadcrumbTextSplits = breadcrumbText.split(" > ");
    var href = getSelectedDocHtml() + "#";
    var stickyHeaderBreadcrumb = "";
    for (var i = 0; i < breadcrumbTextSplits.length; i++) {
        if (i > 1) {
            href = href + "/";
        }
        if (i > 0) {
            href = href + breadcrumbTextSplits[i];
            stickyHeaderBreadcrumb = stickyHeaderBreadcrumb + " > ";
        }
        // don't highlight if there is only one item in the breadcrumb 
        if (highlightLastItem && (i === breadcrumbTextSplits.length - 1) && (i !== 0)) {
            stickyHeaderBreadcrumb = stickyHeaderBreadcrumb + "<a class='lastParentItem' href='" + href + "' target='contentFrame'>" + breadcrumbTextSplits[i] + "</a>";
        } else {
            stickyHeaderBreadcrumb = stickyHeaderBreadcrumb + "<a href='" + href + "' target='contentFrame'>" + breadcrumbTextSplits[i] + "</a>";
        }
    }
    $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").append(stickyHeaderBreadcrumb);

    // adjust the breadcrumb font if its width is larger than the iframe width
    var paddingWidth =  parseInt($(".contentStickyBreadcrumbHeader").css("padding-left")) + 
                        parseInt($(".contentStickyBreadcrumbHeader").css("padding-right"));
    var breadcrumbWidth = $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").width() + paddingWidth;      
    var contentWindowWidth = $('iframe[name="contentFrame"]').contents()[0].documentElement.clientWidth;
    var fontSize = 32;
    while (breadcrumbWidth > contentWindowWidth && fontSize > 0) {
        $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").css("font-size", fontSize + "px");
        breadcrumbWidth = $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").width() + paddingWidth;
        fontSize = fontSize - 2;
    }
    $(".contentStickyBreadcrumbHeader .stickyBreadcrumb").show();

    addContentBreadcrumbClick();
}

function addContentBreadcrumbClick() {
    $(".stickyBreadcrumb a").off("click").on("click", function(event) {
        event.preventDefault();
        var href = $(event.currentTarget).attr("href");
        handleIFrameDocPosition(href);
        updateHashInUrl(href);
    });
}

function adjustParentScrollView() {
    if ($(window.parent.document).scrollTop() > 0) {
        $(window.parent.document).scrollTop(0);
    }
}

function getFullHrefFromIframe() {
    var frameContents = $('iframe[name="contentFrame"]').contents();
    var href = {};
    href.pathname = frameContents.attr("location").pathname;
    href.hash = frameContents.attr("location").hash;
    return href;
}

function handlePopstate() {
    window.onpopstate = function(event) {
        if (event.state) {
            var iframeHrefObj = getFullHrefFromIframe();
            var iframeHref = iframeHrefObj.pathname;
            var popstateHrefPathname = event.state;
            if (event.state.indexOf("#") !== -1) {
                popstateHrefPathname = event.state.substring(0, event.state.indexOf("#"));
            }

            if (iframeHrefObj.pathname === popstateHrefPathname) {
                // if (event.state.indexOf("#") === -1) {
                //     $("iframe[name='contentFrame']").contents().scrollTop(0);
                // } else {
                    handleIFrameDocPosition(event.state);
                //}
                // select TOC
                var TOCSubElement = $("#toc_container").find("a[href='" + event.state + "']");
                if (TOCSubElement.length === 1) {
                    setSelectedTOC(TOCSubElement);
                }
            } else {
                setIframeLocationHref(event.state);
            }
        } else {
            selectFirstDoc();
        }
    }
}

function initialContentBreadcrumbVisibility() {
    if ($(this).contents().attr("location").href.indexOf("#") === -1) {
        $('.contentStickyBreadcrumbHeader').hide();
    } else {
        $('.contentStickyBreadcrumbHeader').show();
    }
}

$(document).ready(function () {
    addTOCClick();
    if (window.location.hash !== "" && window.location.hash !== undefined) {
        var fullHref = '/config/' + window.location.hash.substring(1)
        setIframeLocationHref(fullHref);
        window.history.replaceState(fullHref, null, window.location.hash);
    } else {
        selectFirstDoc();
    }
    $('iframe[name="contentFrame"]').load(function() {
        if ($(this)[0].contentDocument.title !== "Not Found") {
            //initialContentBreadcrumbVisibility();
            modifyFixedTableColumnWidth();
            handleSubHeadingsInContent();
            var TOCElement = findTOCElement();
            handleSubHeadingsInTOC(TOCElement);
            var TOCSubElement = findTOCElement(true);
            if (TOCSubElement) {
                setSelectedTOC(TOCSubElement)
            } else {
                setSelectedTOC(TOCElement);
            }
            updateMainBreadcrumb(TOCElement);
            createClickableBreadcrumb(getContentBreadcrumbTitle());
            handleDocScrolling();
            handlePopstate();
            if ($(this).contents().attr("location").href.indexOf("#") !== -1) {
                handleIFrameDocPosition($(this).contents().attr("location").href);
            }
        }    
    });
});