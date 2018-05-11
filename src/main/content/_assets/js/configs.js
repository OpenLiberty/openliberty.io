/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
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
    // Listener for the filters on the overview pane
    $("#toc_container a").on("click", function(event){
        var resource = $(event.currentTarget);

        setSelectedTOC(resource);
        if ($(".breadcrumb.fluid-container").find("li:last-child").find("a").hasClass("inactive_link")) {
            // remove existing inactive link
            $(".breadcrumb.fluid-container").find("li:last-child").remove();
        }
        $(".breadcrumb.fluid-container").append("<li><a class='inactive_link'>" + resource.text() + "</a></li>");
    });
};

function setSelectedTOC(resource) {
    var currecntTOCSelected = $(".toc_selected");
    if (currecntTOCSelected.length === 1) {
        $(".toc_selected").removeClass("toc_selected");
    }
    resource.parent().addClass("toc_selected");
};

function handleSubHeadings() {
    var iframeContents = $('iframe[name=contentFrame]').contents();
    var anchors = iframeContents.find("div.paragraph > p > a");

    $(anchors).each(function () {
        var subHeading = $(this).parent();
        var title = modifySubHeading(subHeading);
        var table = getTableForSubHeading(subHeading);
        var indentLevels = calcIndentAndAddClass(subHeading, title, table);
        if ((indentLevels >= minIndentLevel) && table) {
            addExpandAndCollapseToggleButtons(subHeading, table);
        }
    });
}

function addExpandAndCollapseToggleButtons(subHeading, table) {
    // var iframeContents = $('iframe[name=contentFrame]').contents();
    // var subsections = iframeContents.find("p.subsection");

    // $(subsections).each(function () {
    //     // Look for the matching element to collapse/expand
    //     var idToMatch = $(this).find("a").attr("id");
    //     var table = iframeContents.find("table[data-id='" + idToMatch + "']");

    //     var title = modifySubHeading($(this));
    //     var indentLevels = calcIndent($(this, title, table));

    //     if ((indentLevels >= minIndentLevel) && (table.length === 1)) {
            var toggleButton = $('<div class="toggle" collapsed="false" tabindex=0><img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse" /></div>');
            toggleButton.on('click', function () {
                var collapsed = $(this).attr('collapsed');
                if (collapsed === "true") {
                    // Expand to show the table
                    table.show();
                    $(this).empty().append($('<img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse"/>'));
                    $(this).attr('collapsed', false);
                }
                else {
                    // Collapse the table
                    table.hide();
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
        // }
        
        // add subsection class
        // var next = $(this).parent().next();
        // while (!next.is("table")) {
        //     next.addClass("subsection");
        //     next = next.next();
        // }

        // remove strong from the last title
        // var strong = $(this).find("strong");
        // var title;
        // if (strong.length > 0) {
        //     title = strong.text();
        // } else {
        //     title = $(this).text();
        // }
        // var lastIndex = title.lastIndexOf(">");
        // var titleStrong = title.substring(0, lastIndex + 1);
        // var titlePlain = title.substring(lastIndex + 1);
        // strong.remove();
        // $(this).append("<strong>" + titleStrong + "</strong>" + titlePlain);

        // calculate the indentation
        // var splits = title.split(">");
        // var levels = splits.length;
        // if (levels > 7) {
        //     levels = 7;
        // }
        // var marginLeft;
        // if (levels> 3) {
        //     marginLeft = (levels - 3) * 49 + 69;
        // }

        // // add subsection class + extra left margin indentation
        // var next = $(this).parent().next();
        // while (!next.is("table")) {
        //     next.addClass("subsection");
        //     if (marginLeft !== undefined) {
        //         next.css("margin-left", marginLeft + "px");
        //     }
        //     next = next.next();
        // }
        // table.addClass("subsection");
        // if (marginLeft !== undefined) {
        //     table.css("margin-left", marginLeft - 10 + "px");
        //     $(this).css("margin-left", marginLeft + "px");
        // }
    //});
}

// add subsection css to all subheadings
// function addSubsectionClass() {
//     var subHeadings = iframeContents.find("div.paragraph > p > a");
//     $(subHeadings).each(function () {
//         $(this).parent().addClass(subSectionClass);
//     });
// }

// remove strong from the last heading
function modifySubHeading(subHeadingElement) {
    var strong = subHeadingElement.find("strong");
    var title;
    if (strong.length > 0) {
        title = strong.text();
    } else {
        title = subHeadingElement.text();
    }
    if (title !== undefined) {
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
function calcIndentAndAddClass(subHeadingElement, title, table) {
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
            if (marginLeft !== undefined) {
                subHeadingElement.css("margin-left", marginLeft + "px");
            }
            // add subsection class + extra left margin indentation
            var next = subHeadingElement.parent().next();
            while (!next.is("table")) {
                next.addClass(subSectionClass);
                if (marginLeft !== undefined) {
                    next.css("margin-left", marginLeft + "px");
                }
                next = next.next();
            }
            if (table) {
                table.addClass(subSectionClass);
                if (marginLeft !== undefined) {
                    table.css("margin-left", marginLeft - 10 + "px");
                }
            }
        }
    }
    return levels;
}

$(document).ready(function () {
    addTOCClick();
    $('iframe[name="contentFrame"]').load(function() {
        handleSubHeadings();
    });
});