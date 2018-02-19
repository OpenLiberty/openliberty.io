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

function addExpandAndCollapseToggleButtons() {
    var javadoc_container = $('#javadoc_container').contents();
    var iframes = javadoc_container.find("iframe");

    var leftTop = javadoc_container.find(".leftTop");
    var leftBottom = javadoc_container.find(".leftBottom");

    $( iframes ).each(function() {
        // Look for the two left side iframes
        var isTopLeftPackageIFrame = $(this).attr("name") === "packageListFrame";
        var isBottomLeftPackageIFrame = $(this).attr("name") === "packageFrame";

        if(isTopLeftPackageIFrame) {
            var list = $(this).contents().find('ul[title="Packages"]');
            var header = $(this).contents().find("h2[title='Packages']");

            // A empty whitespace only <p> element needs to be hidden
            var emptyParagraphElement = $(this).contents().find("body > p");
            emptyParagraphElement.hide();

            var headerHeight = header.outerHeight(true); // true to include margins too
            var toggleButton = $('<input id="top_left_toggle" type="checkbox" checked><label style="float: right;" for="top_left_toggle"></label>');
            toggleButton.change(function() {
                // this will contain a reference to the checkbox   
                if (this.checked) {
                    list.show();
                    leftTop.css("height", "30%");
                    leftBottom.css("height", "70%");
                } else {
                    list.hide();
                    leftTop.css("height", headerHeight);
                    leftTop.css("overflow", "hidden");
                    leftBottom.css("height", "86%");
                }
            });
            header.append(toggleButton);
            // header.addClass("leftFrameHeaderStyling");
        }
        if(isBottomLeftPackageIFrame) {
            var list2 = $(this).contents().find('main.indexContainer');
            var frame2 = $(this).contents().find('div.leftBottom');

            // I did not know how to select for text that contained whitespace.
            // example: "All Classes"
            var header2 = $(this).contents().find("h1:contains('Classes')");
            var headerHeight2 = header2.outerHeight(true); // true to include margins too

            // .text() returns encoded spaces, convert back to normal spaces 
            // for string comparison.
            var header2_text = header2.text().replace('/\s/g',' ').trim();
            if(header2_text === "All Classes") {
                var toggleButton2 = $('<input id="bottom_left_toggle"type="checkbox" checked><label style="float: right;" for="bottom_left_toggle"></label>');
                toggleButton2.change(function() {
                    // this will contain a reference to the checkbox   
                    if (this.checked) {
                        list2.show();
                        leftBottom.css("height", "70%");
                    } else {
                        list2.hide();
                        leftBottom.css("height", headerHeight2);
                    }
                });
                header2.append(toggleButton2);
                // header2.addClass("leftFrameHeaderStyling");
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

$(document).ready(function() {

    $(window).on('resize', function(){
        resizeJavaDocWindow();
    });

    $('#javadoc_container').load(function() {
        resizeJavaDocWindow();
        addExpandAndCollapseToggleButtons();
        addScrollListener();
        $('#javadoc_container').contents().find("iframe.rightIframe").on('load', function(){
            addScrollListener();
        });
    })
});