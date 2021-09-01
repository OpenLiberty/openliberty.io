/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

// determine user's operating system and show prerequisite instructions for that OS
function setDefaultTab() {
    var OSName = "";
    // Detect user's operating system
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("win") != -1) {
        OSName = "windows";
    }
    if (ua.indexOf("mac") != -1) {
        OSName = "mac";
    }
    if (ua.indexOf("linux") != -1) {
        OSName = "linux";
    }
    // hide tab content except for selected tab and add active class to selected tab
    $(".tab_content").hide();

    // For each of the groups of tab contents, show the first one unless an OS is detected
    var sections = $(".sectionbody:has(.tab_content)");
    for (var i = 0; i < sections.length; i++) {
        var section = $(sections.get(i));
        // Check if the current OS tab exists in the section
        if (OSName) {
            var content = section.find("." + OSName + "_section");
            var tab = section.find("." + OSName + "_link");
            if (content.length > 0 && tab.length > 0) {
                content.show();
                tab.addClass("active");
                continue;
            }
        }
        // If the current Operating System's tab has not been found
        // show the first tab's contents for every set of tabs in this section.
        var first_tab = section.find(".tab_link").first();
        // Find OS name to show all of its tab contents in this section.
        var class_list = first_tab[0].classList;
        for (var j = 0; j < class_list.length; j++) {
            var class_name = class_list[j];
            if (class_name !== "tab_link" && class_name.indexOf("_link") > -1) {
                var tab_class = "." + class_name;
                var tab_content_class =
                    "." + class_name.replace("link", "section");
                section.find(tab_class).addClass("active");
                section.find(tab_content_class).show();
                break;
            }
        }
    }
}

function initializeBuildTabs() {
    var build_sections = $(".maven_section .content, .gradle_section .content");
    build_sections.each(function () {
        var maven_tab = $("<div class='maven_section_tab'>Maven</div>");
        var gradle_tab = $("<div class='gradle_section_tab'>Gradle</div>");
        $(this).prepend(gradle_tab).prepend(maven_tab);
    });

    $(".gradle_section").hide(); // Only Maven instructions shown by default

    $(".maven_prereq, .maven_section_tab").on("click", function () {
        $(".maven_section").show();
        $(".gradle_section").hide();
    });
    $(".gradle_prereq, .gradle_section_tab").on("click", function () {
        $(".gradle_section").show();
        $(".maven_section").hide();
    });
}

$(document).ready(function () {
    // show content for clicked OS tab
    $(".tab_link").on("click", function (event) {
        // hide all tab content and remove active class from all links
        $(".tab_content").hide();
        $(".tab_link").removeClass("active");

        // get class of clicked tab and class of its respective content section
        var class_list = this.classList;
        for (var i = 0; i < class_list.length; i++) {
            var class_name = class_list[i];
            if (class_name !== "tab_link" && class_name.indexOf("_link") > -1) {
                var tab_content = "." + class_name.replace("link", "section");
                var tab_class = "." + class_name;
            }
        }

        // show content of clicked tab and add active class to clicked tab
        $(tab_content).show();
        $(tab_class).addClass("active");
    });
});

$(window).on("load", function () {
    $.ready.then(function () {
        setDefaultTab();
        initializeBuildTabs();
    });
});
