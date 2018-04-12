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

// Make sure the footer and header of the documentation page is always in the
// browser viewport.
function resizeJavaDocWindow() {
    var topSection = $('#background_container').outerHeight();
    var bottomSection = $('#footer_container').height();

    var middleSectionHeight = $(window).height() - (topSection + bottomSection);
    $('#javadoc_container').height(middleSectionHeight);
}

/* Handles any elements which are not accessible by a screen reader and fixes DAP violations. */
function addAccessibility() {
    var javadoc_container = $('#javadoc_container').contents();
    var classFrame = javadoc_container.find("iframe[name='classFrame']");

    // Add accessibility labels to the search input and search reset button, and fix duplicate navigation roles.
    classFrame.contents().find('#search').attr("aria-label", "Search");
    classFrame.contents().find("#reset").attr("aria-label", "Reset the search field");
    classFrame.contents().find('header > nav').removeAttr("role").attr("aria-label", "Header navigation");
    classFrame.contents().find('footer > nav').removeAttr("role").attr("aria-label", "Footer navigation");
}

function addExpandAndCollapseToggleButtons() {
    var javadoc_container = $('#javadoc_container').contents();
    var iframes = javadoc_container.find("iframe");

    var leftTop = javadoc_container.find(".leftTop");
    var leftBottom = javadoc_container.find(".leftBottom");

    $( iframes ).each(function() {
        // Look for the two left side iframes
        var isTopLeftPackageIFrame = $(this).attr("name") === "packageListFrame";
        var isBottomLeftPackageIFrame = $(this).attr("name") === "packageFrame";
        var isClassFrame = $(this).attr("name") === "classFrame";

        if(isTopLeftPackageIFrame && $(this).contents().find(".toggle").length === 0) {
            var list = $(this).contents().find('ul[title="Packages"]');
            var header = $(this).contents().find("h2[title='Packages']");

            // A empty whitespace only <p> element needs to be hidden
            var emptyParagraphElement = $(this).contents().find("body > p");
            emptyParagraphElement.hide();

            var headerHeight = header.outerHeight(true); // true to include margins too
            var toggleButton = $('<div class="toggle" collapsed="false" tabindex=0><img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse" /></div>');
            toggleButton.on('click', function(){
                var collapsed = $(this).attr('collapsed');
                if(collapsed === "true"){
                    // Expand the list
                    list.show();
                    leftTop.css("height", "45%");
                    leftBottom.css("height", "55%");
                    $(this).empty().append($('<img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse"/>'));
                    $(this).attr('collapsed', false);
                }
                else{
                    // Collapse the list
                    list.hide();
                    leftTop.css("height", headerHeight);
                    leftTop.css("overflow", "hidden");
                    leftBottom.css("height", "86%");
                    $(this).empty().append($('<img src="/img/all_guides_plus.svg" alt="Expand" aria-label="Expand"/>'));
                    $(this).attr('collapsed', true);                    
                }
            });
            toggleButton.on('keypress', function(event){
                event.stopPropagation();
                // Enter key
                if(event.which === 13 || event.keyCode === 13){
                    toggleButton.click();
                }
            });
            header.append(toggleButton);            
        }
        if(isBottomLeftPackageIFrame && $(this).contents().find(".toggle").length === 0) {
            var list2 = $(this).contents().find('main.indexContainer > ul');
            var frame2 = $(this).contents().find('div.leftBottom');

            // Add region to the package div
            var packageHeader = $(this).contents().find('h1.bar');
            $(this).contents().find('main.indexContainer').prepend(packageHeader.remove());
            // packageHeader.attr('role', 'region');

            // I did not know how to select for text that contained whitespace.
            // example: "All Classes"
            var header2 = $(this).contents().find("h1:contains('Classes')");
            var headerHeight2 = header2.outerHeight(true); // true to include margins too

            // .text() returns encoded spaces, convert back to normal spaces 
            // for string comparison.
            var header2_text = header2.text().replace('/\s/g',' ').trim();
            if(header2_text === "All Classes") {
                var toggleButton2 = $('<div class="toggle" collapsed="false" tabindex=0><img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse" /></div>');
                toggleButton2.on('click', function(){
                    var collapsed = $(this).attr('collapsed');
                    if(collapsed === "true"){
                        // Expand the list
                        list2.show();
                        leftBottom.css("height", "70%");
                        $(this).empty().append($('<img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse"/>'));
                        $(this).attr('collapsed', false);
                    }
                    else{
                        // Collapse the list
                        list2.hide();
                        leftBottom.css("height", headerHeight2);
                        $(this).empty().append($('<img src="/img/all_guides_plus.svg" alt="Expand" aria-label="Expand"/>'));
                        $(this).attr('collapsed', true);                    
                    }
                });
                toggleButton2.on('keypress', function(event){
                    event.stopPropagation();
                    // Enter key
                    if(event.which === 13 || event.keyCode === 13){
                        toggleButton2.click();
                    }
                });
                header2.append(toggleButton2);
            }     
        }        
    });
}



/*
    Add a listener to scrolling in the main frame.
*/
function addScrollListener() {
    var javadoc_container = $('#javadoc_container').contents();
    var rightFrame = javadoc_container.find("iframe.rightIframe");
    rightFrame.contents().off('scroll').on('scroll', function(event){
        hideFooter($(this));
    });
}

/*
    Check if the right iframe has been scrolled down at least 85% to show the footer.
*/
function hideFooter(element) {
    var scrollTop = element.scrollTop(); // Add the viewport to the top of the scrollTop to see if we've reached end of page.
    var javadoc_container = $('#javadoc_container').contents();
    var rightFrame = javadoc_container.find("iframe.rightIframe");
    var rightFrameViewportHeight = rightFrame.contents()[0].documentElement.clientHeight;
    var height = element.height(); 
    var footer = $("footer");        

    // Show footer if the scrollTop plus the viewport height of the right iFrame is at least 85% past the bottom of the right iFrame.
    if ((scrollTop + rightFrameViewportHeight) > height * .85) {         
        if(!footer.data('visible') || footer.data('visible') === "false"){
            footer.data('visible', true);
            footer.css('display', 'block');
            resizeJavaDocWindow();
        }
    }
    else{   
        if(footer.data('visible')){
            footer.data('visible', 'false'); 
            footer.css('display', 'none');
            resizeJavaDocWindow();
        }
    }
}

function addNavHoverListener() {
    var javadoc_container = $('#javadoc_container').contents();
    var rightFrame = javadoc_container.find("iframe.rightIframe");
    var tabs = rightFrame.contents().find('ul.navList li:has(a)');
    tabs.off('mouseover').on('mouseover', function(){
        $(this).addClass('clickableNavListTab');
    });
    tabs.off('mouseleave').on('mouseleave', function() {
        $(this).removeClass('clickableNavListTab');
    })
}

function addClickListeners() {
    var javadoc_container = $('#javadoc_container').contents();
    var iframes = javadoc_container.find("iframe");
 
    $( iframes ).each(function() {
        // console.log("iframe ", $(this));
        var isTopLeftPackageIFrame = $(this).attr("name") === "packageListFrame";
        var isBottomLeftPackageIFrame = $(this).attr("name") === "packageFrame";
        var isClassFrame = $(this).attr("name") === "classFrame";
        var searchName = "";
        if (isTopLeftPackageIFrame) {
            searchName = "package=";
        } else if (isClassFrame || isBottomLeftPackageIFrame) {
            searchName = "class=";
        }
    
        // $(this).contents().click(function(e) {
        //     window.history.replaceState({}, null, e.target.href);
        // })
        addClickListener($(this).contents(), searchName);
    });
}

function addClickListener(contents, searchName) {
    contents.bind("click", function(e) {
        console.log("event", event);
        setHistoryState(e.target.href, searchName, true);
    })
}

function setHistoryState(url, searchName) {
    if (url !== undefined && url != "") {
        var searchString = searchName + getJavaDocHtmlPath(url);
        console.log("before window.history.length=" + window.history.length);
        if (window.location.href.indexOf(searchString) === -1) {
            //searchString !== "package=allclasses-frame.html" && 
            //searchString !== "class=overview-summary.html") {
            if (window.location.href.indexOf(searchName) !== -1) {
                try {
                    // take out existing search string with same name first
                    var searchNameToMatch = "(.*)" + searchName + ".*?.html(.*)";
                    var regExpToMatch = new RegExp(searchNameToMatch, "g");
                    var groups = regExpToMatch.exec(window.location.href);
                    window.history.replaceState({}, null, groups[1] + searchString + groups[2]);
                } catch (ex) {

                }
            } else {
                if (window.location.href.indexOf("?") === -1) {
                    searchString = "?" + searchString;
                } else {
                    searchString = "&" + searchString;
                }
                console.log("searchString = " + searchString);
                window.history.replaceState({}, null, window.location.href + searchString);
            }
            console.log("after window.history.length=" + window.history.length);
        }
    }
}

function getJavaDocHtmlPath(href) {
    var javaDocHtml = "";
    try {
        var stringToMatch = ".*/javadocs/.*-javadoc/(.*)";
        var regExpToMatch = new RegExp(stringToMatch, "g");
        var groups = regExpToMatch.exec(href);
        javaDocHtml = groups[1];
    } catch (e) {

    }
    console.log("javaDocHtml = " + javaDocHtml);
    return javaDocHtml;
}

$(document).ready(function() {

    $(window).on('resize', function(){
        resizeJavaDocWindow();
    });

    // $(window).on('beforeunload', function(event) {
    //     console.log("beforeunload", event);
    //     var javadoc_container = $('#javadoc_container').contents();
    //     var iframes = javadoc_container.find("iframe");
     
    //     $( iframes ).each(function() {
    //         $(this).contents().unbind("click");
    //     })
    // })

    $('#javadoc_container').load(function() {
        console.log("window.locatio.href", window.location);
        resizeJavaDocWindow();
        addAccessibility();
        addExpandAndCollapseToggleButtons();  
        addNavHoverListener();      
        addScrollListener();
        //addClickListener();

        $('#javadoc_container').contents().find("iframe.rightIframe").on('load', function(){
            addAccessibility();
            addNavHoverListener();
            addScrollListener();
            //var url = $($('#javadoc_container').contents().find("iframe.rightIframe")[0]).contents().attr("URL");
            var url = $(this).contents().attr("URL");
            //var url = $(this).get(0).contentWindow.location.href // another way to get the iframe url
            //var url = (window.location != window.parent.location) ? document.referrer: document.location
            console.log("url=", url);
            setHistoryState(url, "class=");
        });
        $('#javadoc_container').contents().find(".leftBottom iframe").on('load', function(){
            var url = $(this).contents().attr("URL");
            console.log("left url=", url);
            setHistoryState(url, "package=");
        });

        // window.onpopstate = function(event) {
        //     console.log("history changed to: " + document.location.href);
        // }
    })
});