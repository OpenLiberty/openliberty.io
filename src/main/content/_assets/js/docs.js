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
    var topSection = $('#background_container').height();
    // var bottomSection = $('#footer_container').height();
    var bottomSection = 0;

    var middleSectionHeight = $(window).height() - (topSection + bottomSection);
    $('#javadoc_container').height(middleSectionHeight);

    $("body").css("overflow" , "hidden");
}

function addExpandAndCollapseToggleButtons() {
    var javadoc_iframes = $('#javadoc_container').contents().find("iframe");
    $( javadoc_iframes ).each(function() {
        // Look for the two left side iframes
        var isTopLeftPackageIFrame = $(this).attr("name") === "packageListFrame";
        var isBottomLeftPackageIFrame = $(this).attr("name") === "packageFrame";

        if(isTopLeftPackageIFrame) {
            var list = $(this).contents().find('ul[title="Packages"]');
            var header = $(this).contents().find("h2[title='Packages']");
            var toggleButton = $('<input id="top_left_toggle" type="checkbox" checked>');
            toggleButton.change(function() {
                // this will contain a reference to the checkbox   
                if (this.checked) {
                    list.show();

                } else {
                    list.hide();
                }
            });
            header.append(toggleButton);
            header.addClass("leftFrameHeaderStyling");
        }
        if(isBottomLeftPackageIFrame) {
            var list2 = $(this).contents().find('main.indexContainer');

            // I did not know how to select for text that contained whitespace.
            // example: "All Classes"
            var header2 = $(this).contents().find("h1:contains('Classes')");

            // .text() returns encoded spaces, convert back to normal spaces 
            // for string comparison.
            var header2_text = header2.text().replace('/\s/g',' ').trim();
            if(header2_text === "All Classes") {
                var toggleButton2 = $('<input id="top_left_toggle" type="checkbox" checked>');
                toggleButton2.change(function() {
                    // this will contain a reference to the checkbox   
                    if (this.checked) {
                        list2.show();
    
                    } else {
                        list2.hide();
                    }
                });
                header2.append(toggleButton2);
                header2.addClass("leftFrameHeaderStyling");
            }
        }
    });
}

// We want to apply our own custom styling to the default javadocs
function addCustomCssToJavaDocs() {
    // var customCss = $("head > link[href*='javadocs.css']"),
    //     rawHtml = customCss.prop('outerHTML'),
    var javadoc_iframes = $('#javadoc_container').contents().find("iframe");

    $( javadoc_iframes ).each(function() {
        console.log(this);
        var head = $(this).contents().find("head");
        head.append('<link rel="stylesheet" type="text/css" href="javadocs.css" title="Style">');
    });
    
    //iframe_head.append('<link rel="stylesheet" type="text/css" href="javadocs.css" title="Custom Style">');
}

$(document).ready(function() {

    resizeJavaDocWindow();

    $(window).on('resize', function(){
        resizeJavaDocWindow();
    });

    $('#javadoc_container').load(function() {
        // After the javadocs are loaded, always apply our custom javadoc stylesheet
        // addCustomCssToJavaDocs();

        addExpandAndCollapseToggleButtons();
    })
});