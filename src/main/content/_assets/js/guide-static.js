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

$(document).ready(function () {
    var offset;
    var target;
    var target_position;
    var target_width;
    var target_height;

    $("#preamble").detach().insertAfter("#duration_container");

    // Read prereqs from json file and add to html
    $.getJSON("../../guides/guides-common/guide_prereqs.json", function (data) {
        var guide_name = window.location.pathname
            .replace(".html", "")
            .replace("/guides/", "");
        var prereq_html = "";
        $.each(data.prereqs, function (i, prereq) {
            // if guide found in prereqs list, add it to the html
            if (prereq.guides.indexOf(guide_name) > -1) {
                prereq_html +=
                    '<div class="prereq_div"><a href=' +
                    '"' +
                    prereq.link +
                    '"' +
                    ' class="prereq notranslate" target="_blank">' +
                    prereq.name +
                    "</a></div>";
            }
            // if prereqs list contains * add prereq to all guides except for excluded guides (if they exist)
            else if (prereq.guides.indexOf("*") > -1) {
                if (prereq.exclude) {
                    // if guide not in prereq exclude list, add it to the html
                    if (prereq.exclude.indexOf(guide_name) <= -1) {
                        prereq_html +=
                            '<div class="prereq_div"><a href=' +
                            '"' +
                            prereq.link +
                            '"' +
                            ' class="prereq notranslate" target="_blank" rel="noopener noreferrer">' +
                            prereq.name +
                            "</a></div>";
                    }
                }
                // guides has * but no exclude, add all to html
                else {
                    prereq_html +=
                        '<div class="prereq_div"><a href=' +
                        '"' +
                        prereq.link +
                        '"' +
                        ' class="prereq notranslate" target="_blank" rel="noopener noreferrer">' +
                        prereq.name +
                        "</a></div>";
                }
            }
        });

        $(".prereqs_list").html(prereq_html);
    });

    // Read skills network json to see if we need to link to a cloud hosted guide equivalent.
    $.getJSON(
        "../../guides/guides-common/cloud-hosted-guides.json",
        function (data) {
            var guide_name = window.location.pathname
                .replace(".html", "")
                .replace("/guides/", "");
            var host = window.location.hostname;
            var skills_network_url;

            if (data.courses && data.courses.guide_name) {
                // The new url format supported by the skills network. The domain host is known ahead of time, and each guide's specific url path is specified in the cloud-hosted-guides.json file.
                skills_network_url =
                    host === "openliberty.io"
                        ? data.skillNetworkDomain
                        : data.stagingSkillNetworkDomain;
                skills_network_url += data.courses.guide_name;
            } else {
                // This guide is not in the list of courses in the new skills network url schema yet. This is the old deprecated url structure that only exists until all guide's urls have been in the cloud-hosted-guides.json file under the courses field.
                skills_network_url =
                    host === "openliberty.io"
                        ? data.skillNetworkUrl
                        : data.stagingSkillNetworkUrl;
                skills_network_url = skills_network_url.replace(
                    "{projectid}",
                    guide_name
                );
            }

            if (data.guides.indexOf(guide_name) > -1) {
                $(".skills_network_description").text(data.buttonLabel);
                var skills_network_button = $(
                    '<a class="skills_network_button" target="_blank" rel="noopener"></a>'
                );
                skills_network_button.attr("href", skills_network_url);
                skills_network_button.attr("title", data.tooltipText);

                var skills_network_button_text = $(
                    '<div class="skills_network_button_text"></div>'
                );
                skills_network_button_text.text(data.buttonText);
                var skills_network_img = $(
                    '<img class="skills_network_button_img" src="/img/launch.svg" alt="Launch icon"></img>'
                );

                skills_network_button.append(skills_network_button_text);
                skills_network_button.append(skills_network_img);
                $(".skills_network_description").append(skills_network_button);
                $(".skills_network_container").show();
            }
        }
    );

    function handleSectionChanging(event) {
        // Get the id of the section most in view
        var id = getScrolledVisibleSectionID();
        if (id !== null) {
            var windowHash = window.location.hash;
            var scrolledToHash = id === "" ? id : "#" + id;
            if (windowHash !== scrolledToHash) {
                // Update the URL hash with new section we scrolled into....
                var currentPath = window.location.pathname;
                var newPath =
                    currentPath.substring(currentPath.lastIndexOf("/") + 1) +
                    scrolledToHash;
                // Not setting window.location.hash here because that causes an
                // onHashChange event to fire which will scroll to the top of the
                // section.  replaceState updates the URL without causing an
                // onHashChange event.
                history.replaceState(null, null, newPath);

                // Update the selected TOC entry
                updateTOCHighlighting(id);
            }
            if (window.innerWidth > twoColumnBreakpoint) {
                // multipane view
                // Match the code block on the right to the new id
                if (typeof showCorrectCodeBlock === "function") {
                    showCorrectCodeBlock(id, null, true);
                }
            }
        }
    }

    $(
        "#guide_content pre:not(.no_copy pre):not(.code_command pre):not(.hotspot pre):not(.code_column pre), #guide_content .code_command .content"
    )
        .on("mouseenter", function (event) {
            offset = $("#guide_column").position();
            target = event.currentTarget;
            var current_target_object = $(event.currentTarget);
            target_position = current_target_object.position();
            target_width = current_target_object.outerWidth();
            target_height = current_target_object.outerHeight();
            if (window.location.href.indexOf("cloud-ibm") > -1) {
                var right_position = $(window).outerWidth() < 1170 ? 1 : 46;
            } else {
                var right_position = inSingleColumnView() ? 1 : 46;
            }
            $("#copy_to_clipboard")
                .css({
                    top: target_position.top + 1,
                    right:
                        parseInt($("#guide_column").css("padding-right")) +
                        right_position,
                })
                .addClass("copy_to_clipboard_git_clone");
            $("#copy_to_clipboard").stop().fadeIn();
        })
        .on("mouseleave", function (event) {
            if (offset) {
                var x = event.clientX - offset.left;
                var y = event.clientY - offset.top + $(window).scrollTop();
                if (
                    !(
                        x > target_position.left &&
                        x < target_position.left + target_width &&
                        y > target_position.top &&
                        y < target_position.top + target_height
                    )
                ) {
                    $("#copy_to_clipboard").stop().fadeOut();
                    $("#copy_to_clipboard").removeClass(
                        "copy_to_clipboard_git_clone"
                    );
                    $("#guide_section_copied_confirmation").stop().fadeOut();
                }
            }
        });

    $("#copy_to_clipboard").on("click", function (event) {
        event.preventDefault();
        // Target was assigned while hovering over the element to copy.
        openliberty.copy_element_to_clipboard(target, function () {
            var current_target_object = $(event.currentTarget);
            var position = current_target_object.position();
            $("#guide_section_copied_confirmation")
                .css({
                    top: position.top - 18,
                    right: inSingleColumnView() ? 20 : 50,
                })
                .stop()
                .fadeIn()
                .delay(3500)
                .fadeOut();
        });
    });

    $(window).on("scroll", function (event) {
        // Check if a scroll animation from another piece of code is taking place and prevent normal behavior.
        if ($("body").data("scrolling") === true) {
            return;
        }
        handleSectionChanging(event);
    });
});
$(window).on("load", function () {
    $.ready.then(function () {
        // Both ready and loaded
        createEndOfGuideContent();

        if (location.hash) {
            handleFloatingTableOfContent();
            var hash = location.hash;
            // if in single pane guide, get hash and scroll to correct section
            if (twoColumnBreakpoint == 1440) {
                accessContentsFromHash(hash);
            }
        }
    });
});
