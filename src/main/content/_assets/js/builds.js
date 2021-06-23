/*******************************************************************************
 * Copyright (c) 2017, 2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

var builds = [];
var starter_info = [];
var starter_dependencies = {};

var latest_releases = [];
var runtime_releases = [];
var runtime_development_builds = [];
var runtime_betas = [];
var developer_tools_releases = [];
var developer_tools_development_builds = [];

var builds_url = "/api/builds/data";
var starter_info_url = "https://start.openliberty.io/api/start/info";
var starter_submit_url = "https://start.openliberty.io/api/start";

// Determine if an element is in the viewport
$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

// start hovering cow animation
function startAnimation() {
    $("#ufo").css("animation", "ufo_hovering 4.5s 3");
    $("#ufobeam").css("animation", "ufo_hovering 4.5s 3");
    $("#cow").css("animation", "cow_hovering 4.5s 3");
    $("#cowshadow").css("animation", "shadow_resizing 4.5s 3");
}

function render_builds(builds, parent) {
    parent.empty();

    var tableID = parent.parent().data("builds-id");
    var analytics_class_name = "link_" + tableID;
    var download_arrow =
        '<div class="download_arrow"><div class="table_arrow"></div><div class="table_line"></div></div>';

    // update maven and gradle commands to use latest version
    if (parent.parent().data("builds-id") == "runtime_releases") {
        var latest_version = latest_releases.runtime.version.trim();

        // check that latest version matches x.x.x.x before updating
        var re = /^\d+\.\d\.\d\.\d+/;
        if (re.test(latest_version)) {
            $(".latest_version").html(latest_version);
        }
    }

    // get the max number of package locations to determine number of rows
    var max = 1;
    builds.forEach(function (build) {
        if (parent.parent().data("builds-id") == "runtime_releases") {
            if (build.package_locations.length > max) {
                max = build.package_locations.length;
            }
        }
    });

    builds.forEach(function (build) {
        if (parent.hasClass("release_table_body")) {
            if (build.version.indexOf("-RC") > -1) {
                build.version.replace("-RC", " Release Candidate");
            }

            // ol releases table only
            if (parent.parent().data("builds-id") == "runtime_releases") {
                var package_locations = build.package_locations;
                if (
                    package_locations !== null &&
                    package_locations !== undefined
                ) {
                    var num_packages = package_locations.length;
                    // Add enough empty rows so that each release has the max number of rows even when there are < max number packages. These empty rows will be hidden, but this ensures that the table highlighting is correct.
                    if (num_packages < max) {
                        for (var i = 0; i < max - num_packages; i++) {
                            parent.append("<tr></tr>");
                        }
                    }

                    var version_column = $(
                        '<td headers="' +
                            tableID +
                            '_version" rowspan="' +
                            num_packages +
                            '">' +
                            build.version +
                            "</td>"
                    );

                    for (var i = 0; i < package_locations.length; i++) {
                        var row = $("<tr></tr>"); // create a new row for each item in package_locations
                        var package_name = package_locations[i]
                            .split("=")[0]
                            .toLowerCase();
                        var href = package_locations[i].split("=")[1];
                        var download_column = $(
                            '<td headers="' +
                                tableID +
                                '_download"><a href="' +
                                href +
                                '" class="' +
                                analytics_class_name +
                                '" rel="noopener">' +
                                download_arrow +
                                "ZIP</a></td>"
                        );

                        if (i == 0) {
                            row.append(version_column); // add version column for first item in package_locations
                        }
                        if (package_name.indexOf("java") > -1) {
                            // 19.0.0.6 and higher should be labeled "Jakarta EE 8", and anything before should be "Java EE 8"
                            buildVersionYear = parseInt(
                                build.version.substring(
                                    0,
                                    build.version.indexOf(".")
                                ),
                                10
                            );
                            buildVersionMonth = parseInt(
                                build.version.substring(
                                    build.version.lastIndexOf(".") + 1
                                ),
                                10
                            );
                            if (
                                buildVersionYear > 19 ||
                                (buildVersionYear === 19 &&
                                    buildVersionMonth > 5)
                            ) {
                                var package_column =
                                    "<td headers='" +
                                    tableID +
                                    "_package'>Jakarta EE 8</td>";
                            } else {
                                var package_column =
                                    "<td headers='" +
                                    tableID +
                                    "_package'>Java EE 8</td>";
                            }
                        } else if (package_name.indexOf("web") > -1) {
                            var package_column =
                                "<td headers='" +
                                tableID +
                                "_package'>Web Profile 8</td>";
                        } else if (package_name.indexOf("microprofile3") > -1) {
                            var package_column =
                                '<td headers="' +
                                tableID +
                                '_package">MicroProfile 3</td>';
                        } else if (package_name.indexOf("microprofile4") > -1) {
                            var package_column =
                                '<td headers="' +
                                tableID +
                                '_package">MicroProfile 4</td>';
                        } else if (package_name.indexOf("kernel") > -1) {
                            var package_column =
                                '<td headers="' +
                                tableID +
                                '_package">Kernel</td>';
                        } else {
                            var package_column =
                                '<td headers="' +
                                tableID +
                                '_package">All GA Features</td>';
                        }

                        row.append(package_column);
                        row.append(download_column);
                        parent.append(row);
                    }
                }
            }

            // beta releases table only
            else if (parent.parent().data("builds-id") == "runtime_betas") {
                var package_locations = build.package_locations;
                if (
                    package_locations !== null &&
                    package_locations !== undefined
                ) {
                    var num_packages = package_locations.length;
                    var version_column = $(
                        '<td headers="' +
                            tableID +
                            '_version" rowspan="' +
                            num_packages +
                            '">' +
                            build.version +
                            "</td>"
                    );

                    for (var i = 0; i < package_locations.length; i++) {
                        var row = $("<tr></tr>"); // create a new row for each item in package_locations
                        var package_name = package_locations[i]
                            .split("=")[0]
                            .toLowerCase();
                        var href = package_locations[i].split("=")[1];
                        var download_column = $(
                            '<td headers="' +
                                tableID +
                                '_download"><a href="' +
                                href +
                                '" class="' +
                                analytics_class_name +
                                '" rel="noopener">' +
                                download_arrow +
                                "ZIP</a></td>"
                        );

                        if (i == 0) {
                            row.append(version_column); // add version column for first item in package_locations
                        }

                        if (package_name.indexOf("jakarta") > -1) {
                            var package_column =
                                "<td headers='" +
                                tableID +
                                "_package'>Jakarta EE 9 Beta Features</td>";
                        } else {
                            var package_column =
                                "<td headers='" +
                                tableID +
                                "_package'>All Beta Features</td>";
                        }

                        row.append(package_column);
                        row.append(download_column);
                        parent.append(row);
                    }
                }
            }

            // eclipse developer tools releases only
            else {
                var row = $("<tr></tr>");
                var version_column = $(
                    '<td headers="' +
                        tableID +
                        '_version">' +
                        build.version +
                        "</td>"
                );
                var download_column = $(
                    '<td headers="' +
                        tableID +
                        '_download"><a href="' +
                        build.driver_location +
                        '" class="' +
                        analytics_class_name +
                        '" rel="noopener">' +
                        download_arrow +
                        "ZIP</a></td>"
                );
                row.append(version_column);
                row.append(download_column);
                parent.append(row);
            }
        }

        // ol development builds and eclipse development builds
        else {
            var row = $("<tr></tr>");
            var date = new Date(build.date);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var minute = date.getMinutes();

            var date_column = $(
                '<td headers="' +
                    tableID +
                    '_date">' +
                    year +
                    "-" +
                    add_lead_zero(month) +
                    "-" +
                    add_lead_zero(day) +
                    ", " +
                    add_lead_zero(hour) +
                    ":" +
                    add_lead_zero(minute) +
                    "</td>"
            );

            var tests_column = $(
                '<td headers="' +
                    tableID +
                    '_tests"><a href="' +
                    build.tests_log +
                    '" class="' +
                    analytics_class_name +
                    ' tests_passed_link" rel="noopener">' +
                    build.test_passed +
                    " / " +
                    build.total_tests +
                    "</a></td>"
            );

            var log_column = $(
                '<td headers="' +
                    tableID +
                    '_logs"><a href="' +
                    build.build_log +
                    '" class="' +
                    analytics_class_name +
                    ' view_logs_link" target="_blank" rel="noopener">View logs</a></td>'
            );

            var download_column = $(
                '<td headers="' +
                    tableID +
                    '_download"><a href="' +
                    build.driver_location +
                    '" class="' +
                    analytics_class_name +
                    '" rel="noopener">' +
                    download_arrow +
                    "ZIP</a></td>"
            );

            row.append(date_column);
            row.append(tests_column);
            row.append(log_column);
            row.append(download_column);
            parent.append(row);
        }
    });
}

function add_lead_zero(number) {
    if (number < 10) {
        return "0" + number;
    } else {
        return number;
    }
}

function sort_builds(builds, key, descending) {
    builds.sort(function (a, b) {
        if (descending) {
            return a[key] < b[key] ? 1 : -1;
        } else {
            return a[key] > b[key] ? 1 : -1;
        }
    });
}

function get_starter_info() {
    var deferred = new $.Deferred();
    $.ajax({
        url: starter_info_url,
    })
        .done(function (data) {
            starter_info = data;
            deferred.resolve();
        })
        .fail(function () {
            deferred.reject();
        });
    return deferred;
}

function uppercase_first_letter(s) {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function add_invalid_message(field_id, valid) {
    if (!valid) {
        if (
            $(
                ".starter_field[data-starter-field='" +
                    field_id +
                    "'] .invalid_field_div"
            ).length == 0
        ) {
            var div = $("<div class='invalid_field_div' />");
            var warning_icon = $(
                "<img class='invalid_icon' src='/img/warning_red.svg' alt='Invalid field icon' />"
            );
            var message;
            if (field_id == "a") {
                message = $(
                    "<p class='invalid_field_message'>Enter a valid application name.</p>"
                );
            } else if (field_id == "g") {
                message = $(
                    "<p class='invalid_field_message'>Valid characters include a-z, A-Z, and 0-9 separated by '.'</p>"
                );
            }
            div.append(warning_icon).append(message);
            $(".starter_field[data-starter-field='" + field_id + "']").append(
                div
            );
        }
    } else {
        $(".starter_field[data-starter-field='" + field_id + "']")
            .find(".invalid_field_div")
            .remove();
    }
}

// Base package name
function validate_group_name() {
    const valid_syntax = /^[a-z][a-zA-Z0-9.]*$/g; // Starts with a lowercase char and ends with a character.
    const ends_with_period = /.*[.]$/g;
    const contains_consecutive_periods = /\.\./g; // Ensure there are not two periods in a row.
    var value = $(".starter_field[data-starter-field='g'] input").val();
    var valid =
        value == ""
            ? false
            : valid_syntax.test(value) &&
              !contains_consecutive_periods.test(value) &&
              !ends_with_period.test(value);
    add_invalid_message("g", valid);
    return valid;
}

// Application name
function validate_application_name() {
    var valid_syntax = /^[a-zA-Z0-9\_\.\-]*$/g;
    var value = $(".starter_field[data-starter-field='a'] input").val();
    var valid = value == "" ? false : valid_syntax.test(value);
    add_invalid_message("a", valid);
    return valid;
}

function validate_starter_inputs() {
    var valid = true;
    $("#starter_warnings").empty();
    $("#starter_submit").addClass("disabled");

    var group_name_valid = validate_group_name();
    var app_name_valid = validate_application_name();

    // Look through each of starter_dependencies and verify that the value of its dependency is valid for that input.
    for (var starter_key in starter_dependencies) {
        var versions = starter_dependencies[starter_key].versions;
        // Get the value for this starter field
        switch (starter_key) {
            case "e": // Java EE / Jakarta EE Version
            case "j": // Java SE Version
            case "m": // MicroProfile Version
                var value = $(
                    ".starter_field[data-starter-field='" +
                        starter_key +
                        "'] select"
                )
                    .find(":selected")
                    .text();
                // Get the other fields dependent on this one
                var dependencies = versions[value];
                for (var d in dependencies) {
                    var dependency_value = $(
                        ".starter_field[data-starter-field='" + d + "'] select"
                    )
                        .find(":selected")
                        .text();
                    // Check that it's in the list of supported values
                    if (dependencies[d].indexOf(dependency_value) === -1) {
                        valid = false;
                    }
                    // Disable all invalid values in the dependent select dropdown
                    var options = $(
                        ".starter_field[data-starter-field='" +
                            d +
                            "'] select option"
                    );
                    var first = true;
                    options.removeAttr("disabled");
                    options.each(function () {
                        if (dependencies[d].indexOf(this.text) === -1) {
                            $(this).attr("disabled", "disabled");
                            // Add a tooltip that explains that these are disabled because of the other field.
                            this.title =
                                "This version is disabled because of incompatibility with the version of: " +
                                starter_info[starter_key].name;
                        } else {
                            this.title = this.text;
                            if (!valid && first) {
                                var selected_version = options
                                    .filter(":selected")
                                    .text();

                                if (selected_version != this.text) {
                                    options
                                        .filter(":selected")
                                        .removeAttr("selected");
                                    // Select the highest valid value for the dependency if it wasn't already selected
                                    $(this).attr("selected", "selected");

                                    // Update the message that an option was chosen for them
                                    var close_icon = $(
                                        "<img src='/img/x_white.svg' id='invalid_message_close_icon' alt='Close' tabindex='0' />"
                                    );
                                    close_icon.on("click", function () {
                                        $("#starter_warnings").empty();
                                    });
                                    close_icon.on("keydown", function (event) {
                                        if (
                                            event.which === 13 ||
                                            event.which === 32 // Enter key or spacebar
                                        ) {
                                            $(this).click();
                                        }
                                    });
                                    var message = $(
                                        "<p>" +
                                            starter_info[d].name +
                                            " has been automatically updated to the highest valid version compatible with " +
                                            starter_info[starter_key].name +
                                            ".</p>"
                                    );
                                    $("#starter_warnings")
                                        .append(message)
                                        .append(close_icon);

                                    first = false;
                                    valid = true;
                                }
                            }
                        }
                    });
                }
                break;
            default:
                break;
        }
    }
    valid = valid && group_name_valid && app_name_valid;
    if (valid) {
        $("#starter_submit").removeClass("disabled");
    }
}

$(document).ready(function () {
    get_starter_info()
        .done(function (data) {
            for (var starter_field in starter_info) {
                var info = starter_info[starter_field];
                var constraints = info.constraints;
                var id = info.name.replace(" ", "_");
                var default_value = info.default;
                var input;
                if (constraints) {
                    // Put this starter field in the list of dependencies that another field depends on.
                    for (var version in constraints) {
                        var dependencies = constraints[version];
                        if (!starter_dependencies[starter_field]) {
                            starter_dependencies[starter_field] = {};
                            starter_dependencies[starter_field].versions = {};
                        }
                        starter_dependencies[starter_field].versions[version] =
                            dependencies;
                    }
                }
                var options = info.options;
                switch (starter_field) {
                    // Build System
                    case "b":
                        for (var j = 0; j < options.length; j++) {
                            var value = options[j];
                            var radio_button = $(
                                "<input type='radio' id='build_system_" +
                                    value +
                                    "' name='build_system' value='" +
                                    value +
                                    "'></radio>"
                            );
                            if (value === default_value) {
                                radio_button.prop("checked", true);
                            }
                            var option_label = $(
                                "<label for='build_system_" +
                                    value +
                                    "'>" +
                                    uppercase_first_letter(value) +
                                    "</label>"
                            );
                            $("#build_system_section div[role='radiogroup'")
                                .append(radio_button)
                                .append(option_label);
                        }
                        break;
                    case "e": // Java EE / Jakarta EE Version
                    case "j": // Java SE Version
                    case "m": // MicroProfile Version
                        for (var j = 0; j < options.length; j++) {
                            var value = options[j];
                            var option_tag = $(
                                "<option value='" +
                                    value +
                                    "'>" +
                                    value +
                                    "</option>"
                            );
                            if (value === info.default) {
                                option_tag.prop("selected", true);
                            }
                            $(
                                ".starter_field[data-starter-field='" +
                                    starter_field +
                                    "'] select"
                            ).prepend(option_tag);
                        }
                        break;
                    case "a": // Application name
                    case "g": // Base Package
                        $(
                            ".starter_field[data-starter-field='" +
                                starter_field +
                                "'] input"
                        ).val(default_value);
                        break;
                    default:
                        break;
                }
            }
            $(".starter_field select").on("change", function () {
                validate_starter_inputs();
            });
            $(".starter_field input").on("keyup", function () {
                validate_starter_inputs();
            });
            validate_starter_inputs(); // Run once to disable invalid inputs.
        })
        .fail(function () {
            console.error("Failed to pull from the starter api");
        });

    $("#starter_submit").on("keydown", function (event) {
        if (event.which === 13 || event.which === 32) {
            // Enter or Spacebar
            $(this).click();
        }
    });

    $("#starter_submit").click(function (event) {
        var app_name = $("#Starter_App_Name").val();
        var base_package = $("#Starter_Base_Package").val();
        var build_type = $("input[name='build_system']:checked").val();
        var java_version = $("#Starter_Java_Version").val();
        var jakarta_ee_version = $("#Starter_Jakarta_Version").val();
        var microprofile_version = $("#Starter_MicroProfile_Version").val();
        var data = {
            a: app_name,
            b: build_type,
            e: jakarta_ee_version,
            g: base_package,
            j: java_version,
            m: microprofile_version,
        };
        $.ajax({
            url: starter_submit_url,
            type: "get",
            data: data,
            xhrFields: {
                responseType: "blob",
            },
        })
            .done(function (data) {
                if (data) {
                    var anchor = document.createElement("a");
                    var url = window.URL || window.webkitURL;
                    anchor.href = url.createObjectURL(data);
                    anchor.download = app_name + ".zip";
                    document.body.append(anchor);
                    anchor.click();
                    setTimeout(function () {
                        document.body.removeChild(anchor);
                        url.revokeObjectURL(anchor.href);
                    }, 1);
                }
            })
            .fail(function (response) {
                console.error("Failed to download the starter project.");
            });
    });

    $(".builds_expand_link").click(function (event) {
        event.preventDefault();
        var table_container = $(
            "#" + event.currentTarget.getAttribute("data-table-container-id")
        );

        var rows = $("tbody tr", table_container).length;
        var delay = 400 + rows * 25;

        if (table_container.is(":visible")) {
            table_container.animate({ opacity: 0 }, 400, function () {
                table_container.slideUp(delay, function () {
                    $(".collapse_link_text", event.currentTarget).text(
                        "expand"
                    );
                });
            });
        } else {
            table_container.slideDown(delay, function () {
                table_container.animate({ opacity: 1 }, 400);
                $(".collapse_link_text", event.currentTarget).text("collapse");
            });
        }
    });

    $(".build_table thead tr th a").click(function (event) {
        event.preventDefault();

        var table = $(event.currentTarget).closest("table");

        var builds_id = table.data("builds-id");
        var key = event.currentTarget.getAttribute("data-key");
        var descending = !(
            event.currentTarget.getAttribute("data-descending") == "true"
        );

        event.currentTarget.setAttribute("data-descending", descending);

        sort_builds(builds[builds_id], key, descending);
        render_builds(builds[builds_id], $("tbody", table));
    });

    $.ajax({
        url: builds_url,
    }).done(function (data) {
        if (data.latest_releases) {
            latest_releases = data.latest_releases;
            if (latest_releases.runtime) {
                if (latest_releases.runtime.version) {
                    $("#runtime_download_button_version").text(
                        latest_releases.runtime.version
                    );
                }
                if (latest_releases.runtime.driver_location) {
                    $("#runtime_download_link").attr(
                        "href",
                        latest_releases.runtime.driver_location
                    );
                }
            }
            if (latest_releases.tools) {
                if (latest_releases.tools.version) {
                    $(
                        "#eclipse_developer_tools_download_link_version_text"
                    ).text(latest_releases.tools.version);
                }
                if (latest_releases.tools.driver_location) {
                    $("#eclipse_developer_tools_download_link").attr(
                        "href",
                        latest_releases.tools.driver_location
                    );
                }
            }
        }

        function formatBuilds(builds_from_response) {
            for (var i = 0; i < builds_from_response.length; i++) {
                var date_string = builds_from_response[i].date_time;
                var date = new Date(
                    date_string.substr(0, 4),
                    date_string.substr(5, 2) - 1,
                    date_string.substr(8, 2),
                    date_string.substr(11, 2),
                    date_string.substr(13, 2)
                );
                builds_from_response[i].date = date.getTime();
            }
            return builds_from_response;
        }

        if (data.builds) {
            if (data.builds.runtime_releases) {
                runtime_releases = formatBuilds(data.builds.runtime_releases);
                builds["runtime_releases"] = runtime_releases;
                sort_builds(runtime_releases, "date", true);
                render_builds(
                    runtime_releases,
                    $('table[data-builds-id="runtime_releases"] tbody')
                );
            }
            if (data.builds.tools_releases) {
                developer_tools_releases = formatBuilds(
                    data.builds.tools_releases
                );
                builds["developer_tools_releases"] = developer_tools_releases;
                sort_builds(developer_tools_releases, "date", true);
                render_builds(
                    developer_tools_releases,
                    $('table[data-builds-id="developer_tools_releases"] tbody')
                );
            }
            if (data.builds.runtime_betas) {
                // if betas info is empty (the betas are not on DHE yet), hide beta tab and content
                if (data.builds.runtime_betas.length == 0) {
                    $("#downloads-betas").parent().hide();
                    $("#runtime_betas").hide();
                } else {
                    runtime_betas = formatBuilds(data.builds.runtime_betas);
                    builds["runtime_betas"] = runtime_betas;
                    sort_builds(runtime_betas, "date", true);
                    render_builds(
                        runtime_betas,
                        $('table[data-builds-id="runtime_betas"] tbody')
                    );
                }
            }
            if (data.builds.runtime_nightly_builds) {
                runtime_development_builds = formatBuilds(
                    data.builds.runtime_nightly_builds
                );
                builds["runtime_development_builds"] =
                    runtime_development_builds;
                sort_builds(runtime_development_builds, "date", true);
                render_builds(
                    runtime_development_builds,
                    $(
                        'table[data-builds-id="runtime_development_builds"] tbody'
                    )
                );
            }
            if (data.builds.tools_nightly_builds) {
                developer_tools_development_builds = formatBuilds(
                    data.builds.tools_nightly_builds
                );
                builds["developer_tools_development_builds"] =
                    developer_tools_development_builds;
                sort_builds(developer_tools_development_builds, "date", true);
                render_builds(
                    developer_tools_development_builds,
                    $(
                        'table[data-builds-id="developer_tools_development_builds"] tbody'
                    )
                );
            }
        }
    });

    // Set up the tab groups to work according to accessibility guidelines
    // For each item in the tab group...
    $(".nav.nav-tabs")
        .find("li > a")
        .each(function (a) {
            var $tab = $(this);

            // Set the click event for each tab link
            $tab.click(function (e) {
                // Change url when tab is clicked so that page can be bookmarked
                window.location.hash = this.hash;

                var $tabList = $tab.closest(".tabs_container");
                var $tabContent = $tabList.next();

                // Remove tab stop from previously selected tab and content
                $tabList.find("li > a").attr({ tabindex: "-1" });
                $tabContent
                    .find(".tab-content .active")
                    .attr({ tabindex: "-1" });

                // Select the given tab and show its associated pane. The tab
                // that was previously selected becomes unselected and its associated
                // pane is hidden.
                $tab.tab("show");

                // Add tab stop to newly selected tab and content
                $tabList.find("li > a.active").attr({ tabindex: "0" });
                $tabContent
                    .find(".tab-pane")
                    .eq($tab.parent().index())
                    .attr({ tabindex: "0" });
            });

            $tab.keydown(function (e) {
                var currentTab = $tab.closest("li");
                switch (e.which) {
                    case 37: // left
                        //case 38:  // up
                        // Navigate to previous tab with left/up key
                        e.preventDefault();
                        if (currentTab.prev().length === 0) {
                            // If on first tab, cycle back to last
                            currentTab.nextAll().last().find("a").click();
                        } else {
                            currentTab.prev().find("a").click();
                        }
                        break;

                    case 39: // right
                        //case 40:  // down
                        // Navigate to next tab with right/down key
                        e.preventDefault();
                        if (currentTab.next().length == 0) {
                            // If on last tab, cycle back to 1st
                            currentTab.prevAll().last().find("a").click();
                        } else {
                            currentTab.next().find("a").click();
                        }
                        break;

                    case 36: // home
                        // Navigate to first tab
                        e.preventDefault();
                        if (currentTab.prev().length > 0) {
                            currentTab.prevAll().last().find("a").click();
                        }
                        break;

                    case 35: // end
                        // Navigate to last tab
                        e.preventDefault();
                        if (currentTab.next().length > 0) {
                            currentTab.nextAll().last().find("a").click();
                        }
                        break;
                }
            });

            // This event fires on tab show after a tab has been shown.
            $tab.on("shown.bs.tab", function (e) {
                var activeTab = e.target; // newly activated tab
                $(activeTab).focus();
            });
        });

    // Show copy to clipboard button when mouse enters code block
    $(".code_container")
        .on("mouseenter", function (event) {
            target = $(event.currentTarget);
            $("main").append(
                '<div id="copied_confirmation">Copied to clipboard</div><img id="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block">'
            );
            $("#copy_to_clipboard")
                .css({
                    top: target.offset().top + 1,
                    right:
                        $(window).width() -
                        (target.offset().left + target.outerWidth()) +
                        1,
                })
                .stop()
                .fadeIn();
            // Hide copy to clipboard button when mouse leaves code block (unless mouse enters copy to clipboard button)
        })
        .on("mouseleave", function (event) {
            var x = event.clientX;
            var y = event.clientY + $(window).scrollTop();
            var copy_button_top = $("#copy_to_clipboard").offset().top;
            var copy_button_left = $("#copy_to_clipboard").offset().left;
            var copy_button_bottom =
                copy_button_top + $("#copy_to_clipboard").outerHeight();
            var copy_button_right =
                $("#copy_to_clipboard").offset().left +
                $("#copy_to_clipboard").outerWidth();

            if (
                !(
                    x > copy_button_left &&
                    x < copy_button_right &&
                    y > copy_button_top &&
                    y < copy_button_bottom
                )
            ) {
                $("#copied_confirmation").remove();
                $("#copy_to_clipboard").remove();
                $("#copy_to_clipboard").stop().fadeOut();
            }
        });

    // Copy target element and show copied confirmation when copy to clipboard button clicked
    $(document).on("click", "#copy_to_clipboard", function (event) {
        event.preventDefault();
        // Target was assigned while hovering over the element to copy.
        openliberty.copy_element_to_clipboard(target, function () {
            $("#copied_confirmation")
                .css({
                    top: target.offset().top - 15,
                    right:
                        $(window).width() -
                        (target.offset().left + target.outerWidth()) +
                        1,
                })
                .stop()
                .fadeIn()
                .delay(3500)
                .fadeOut();
        });
    });

    $(window).on("scroll", function (event) {
        // start animation if images are in viewport
        if ($("#bottom_images_container").isInViewport()) {
            startAnimation();
        }
    });
});

$(window).on("load", function () {
    $.ready.then(function () {
        var hash = window.location.hash;
        hash && $('ul.nav a[href="' + hash + '"]').click();

        // scroll to tabs that contain section in hash
        if (hash) {
            var nav_tabs = $('ul.nav a[href="' + hash + '"]')
                .parent()
                .parent();
            $("html, body").animate({ scrollTop: nav_tabs.offset().top }, 500);
        }

        // start animation if images are in viewport
        if ($("#bottom_images_container").isInViewport()) {
            startAnimation();
        }
    });
});
