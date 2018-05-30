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
    $("#toc_container a").on("click", function(event){
        var resource = $(event.currentTarget);

        setSelectedTOC(resource);
        updateBreadCrumb(resource);
    });
}

function setSelectedTOC(resource) {
    var currecntTOCSelected = $(".toc_selected");
    if (currecntTOCSelected.length === 1) {
        $(".toc_selected").removeClass("toc_selected");
    }
    resource.parent().addClass("toc_selected");
}

function updateBreadCrumb(resource) {
    if ($(".breadcrumb.fluid-container").find("li:last-child").find("a").hasClass("inactive_link")) {
        // remove existing inactive link
        $(".breadcrumb.fluid-container").find("li:last-child").remove();
    }
    $(".breadcrumb.fluid-container").append("<li><a class='inactive_link'>" + resource.text() + "</a></li>");
}

function handleSubHeadingsInContent() {
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var contentTitle = iframeContents.find("#config_title").text();
    if (contentTitle.indexOf(" - ") !== -1) {
        contentTitle = contentTitle.substring(0, contentTitle.indexOf(" - "));
    }
    var anchors = iframeContents.find("div.paragraph > p > a");

    $(anchors).each(function () {
        var anchorTitleId = $(this).attr("id");
        var subHeading = $(this).parent();
        var anchorTitle = modifySubHeading(subHeading, contentTitle);
        var table = getTableForSubHeading(subHeading);
        var indentLevels = calcIndentAndAddClass(subHeading, anchorTitle, table, anchorTitleId);

        if (indentLevels >= minIndentLevel) {
            addExpandAndCollapseToggleButtons(subHeading, anchorTitleId);
        }
    });
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
            handleCollapseExpandTitle(titleId, true);
        }
        else {
            // Collapse the table and nested elements
            handleCollapseExpandTitle(titleId, false);
            $(this).empty().append($('<img src="/img/all_guides_plus.svg" alt="Expand" aria-label="Expand"/>'));
            $(this).attr('collapsed', true);
        }
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

function handleCollapseExpandTitle(titleId, isShow) {
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var matchingElements = iframeContents.find('[data-id^="' + titleId + '"]');
    var hideElements = [];
    $(matchingElements).each(function () {
        if (isShow) {
            // don't show already collapsed element
            var toggleButton = $(this).find(".toggle");
            if (toggleButton.length === 1) {
                if (toggleButton.attr("collapsed") === "true") {
                    var dataId = $(this).attr("data-id");
                    //hideElements.push(iframeContents.find("table[data-id^='" + dataId + "']"));
                    var elements = iframeContents.find("[data-id^='" + dataId + "']");
                    $(elements).each(function () {
                        if (($(this).attr('data-id') === dataId && $(this).is("table")) ||
                            ($(this).attr('data-id') !== dataId)) {
                            hideElements.push($(this));
                        }
                    })
                }
            }

            if ($(this).attr("data-id") === titleId && $(this).is("div") && $(this).hasClass("collapseMargin")) {
                $(this).removeClass("collapseMargin");
            }
            $(this).show();

        } else {
            // don't hide the clicked toggle element title and description
            if (($(this).attr('data-id') === titleId && $(this).is("table")) ||
                ($(this).attr('data-id') !== titleId)) {
                $(this).hide();
            } else if ($(this).attr("data-id") === titleId && $(this).is("div")) {
                $(this).addClass("collapseMargin");
            }
        }
    });
    $(hideElements).each(function() {
        $(this).hide();
    })
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

// calculate the indentation
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
            while (!next.is("table") && (next.find("p > a").length === 0)) {
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
                    //table.css("width", width - marginLeft - 10 + "px");
                    table.css("width", "calc(100% + 20px - " + marginLeft + "px - 10px)");
                    //table.css("width", "-=" + marginLeft )
                } else {
                    //table.css("width", width - 59 + "px");
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

function removeFixedTableColumnWidth() {
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

function handleSubHeadingsInTOC() {
    var currentTOCSelected = $(".toc_selected > a");
    var href;
    if (currentTOCSelected.length === 1) {
        href = currentTOCSelected.attr("href");
    }
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var anchors = iframeContents.find("div.paragraph > p > a");
    var anchorLI = currentTOCSelected.parent();

    $(anchors).each(function () {
        var subHeading = $(this).parent();
        if (subHeading.hasClass("subsection") === false) {
            var anchorTitleId = $(this).attr("id");
            var anchorTitleText = subHeading.text();
            var anchorTitleTextIndex = anchorTitleText.lastIndexOf(" > ");
            if (anchorTitleTextIndex !== -1) {
                anchorTitleText = anchorTitleText.substring(anchorTitleTextIndex + 3);
            }
            var tocLI = $('<li style="margin-left: 10px"><a href="' + href + '#' + anchorTitleId + '" target="contentFrame">' + anchorTitleText + '</a></li>');
            anchorLI.after(tocLI);
            anchorLI = tocLI;
        }
    });
}

$(document).ready(function () {
    addTOCClick();
    $('iframe[name="contentFrame"]').load(function() {
        removeFixedTableColumnWidth();
        handleSubHeadingsInContent();
        handleSubHeadingsInTOC();
    });
});