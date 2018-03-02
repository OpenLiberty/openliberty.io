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

    var inMobileView = $(window).width() <= 800;
    if(inMobileView){
        // Allow overflow in the body so the footer is visible.
        $("body").css("overflow" , "auto");
    }
    else{
        // Hide the extra scrollbar.
        $("body").css("overflow" , "hidden");
    }
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

        if(isTopLeftPackageIFrame) {
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
        if(isBottomLeftPackageIFrame) {
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
    Check if the main frame has been scrolled down at least 80% to show the footer.
*/
function hideFooter(element) {
    var scrollTop = element.scrollTop();
    var height = element.height();
    var footer = $("footer");        

    if (scrollTop > height * .80) {         
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

$(document).ready(function() {

    $(window).on('resize', function(){
        resizeJavaDocWindow();
    });

    $('#javadoc_container').load(function() {
        resizeJavaDocWindow();
        addAccessibility();
        addExpandAndCollapseToggleButtons();  
        addNavHoverListener();      
        addScrollListener();
        $('#javadoc_container').contents().find("iframe.rightIframe").on('load', function(){
            addAccessibility();
            addNavHoverListener();
            addScrollListener();
        });
    })
});