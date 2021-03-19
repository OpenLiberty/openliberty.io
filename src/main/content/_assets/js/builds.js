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

var latest_releases = [];
var runtime_releases = [];
var runtime_development_builds = [];
var runtime_betas = [];
var developer_tools_releases = [];
var developer_tools_development_builds = [];

var builds_url = '/api/builds/data';


// Determine if an element is in the viewport
$.fn.isInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

// start hovering cow animation
function startAnimation() {
    $('#ufo').css("animation", "ufo_hovering 4.5s 3");
    $('#ufobeam').css("animation", "ufo_hovering 4.5s 3");
    $('#cow').css("animation", "cow_hovering 4.5s 3");
    $('#cowshadow').css("animation", "shadow_resizing 4.5s 3");
}

function render_builds(builds, parent) {

    parent.empty();

    var tableID = parent.parent().data('builds-id');
    var analytics_class_name = 'link_' + tableID;
    var download_arrow = '<div class="download_arrow"><div class="table_arrow"></div><div class="table_line"></div></div>';

    // update maven and gradle commands to use latest version
    if (parent.parent().data('builds-id') == "runtime_releases") {
        var latest_version = latest_releases.runtime.version.trim();

        // check that latest version matches x.x.x.x before updating
        var re = /^\d+\.\d\.\d\.\d+/;
        if (re.test(latest_version)) {
            $('.latest_version').html(latest_version);
        }
    }

    // get the max number of package locations to determine number of rows
    var max = 1;
    builds.forEach(function(build) {
        if (parent.parent().data('builds-id') == "runtime_releases") {
            if (build.package_locations.length > max) {
                max = build.package_locations.length;
            }
        }
    });

    builds.forEach(function(build) {
        if (parent.hasClass('release_table_body')) {
            if (build.version.indexOf('-RC') > -1){
                build.version.replace('-RC', ' Release Candidate');
            }

            // ol releases table only
            if (parent.parent().data('builds-id') == "runtime_releases"){
                var package_locations = build.package_locations;
                if (package_locations !== null && package_locations !== undefined){
                    var num_packages = package_locations.length;
                    // Add enough empty rows so that each release has the max number of rows even when there are < max number packages. These empty rows will be hidden, but this ensures that the table highlighting is correct.
                    if (num_packages < max) {
                        for (var i = 0; i < (max - num_packages); i++) {
                            parent.append('<tr></tr>');
                        }
                    }

                    var version_column = $('<td headers="' + tableID + '_version" rowspan="' + num_packages + '">' + build.version + '</td>');

                    for (var i = 0; i < package_locations.length; i++){
                        var row = $('<tr></tr>'); // create a new row for each item in package_locations
                        var package_name = package_locations[i].split("=")[0].toLowerCase();
                        var href = package_locations[i].split("=")[1];
                        var download_column = $('<td headers="' + tableID + '_download"><a href="' +  href +'" class="' + analytics_class_name + '" rel="noopener">' + download_arrow + 'ZIP</a></td>');

                        if (i == 0) {
                            row.append(version_column); // add version column for first item in package_locations
                        }
                        if (package_name.indexOf("java") > -1) {
                            // 19.0.0.6 and higher should be labeled "Jakarta EE 8", and anything before should be "Java EE 8"
                            buildVersionYear = parseInt(build.version.substring(0, build.version.indexOf(".")), 10);
                            buildVersionMonth = parseInt(build.version.substring(build.version.lastIndexOf(".") + 1), 10);
                            if (buildVersionYear > 19 || (buildVersionYear === 19 && buildVersionMonth > 5)) {
                                var package_column = "<td headers='" + tableID + "_package'>Jakarta EE 8</td>";
                            } else {
                                var package_column = "<td headers='" + tableID + "_package'>Java EE 8</td>";
                            }
                        }
                        else if (package_name.indexOf("web") > -1) {
                            var package_column = "<td headers='" + tableID + "_package'>Web Profile 8</td>";
                        }
                        else if (package_name.indexOf("microprofile3") > -1) {
                            var package_column = '<td headers="' + tableID + '_package">MicroProfile 3</td>';
                        }
                        else if (package_name.indexOf("microprofile4") > -1) {
                            var package_column = '<td headers="' + tableID + '_package">MicroProfile 4</td>';
                        }
                        else if (package_name.indexOf("kernel") > -1) {
                            var package_column = '<td headers="' + tableID + '_package">Kernel</td>';
                        }
                        else {
                            var package_column = '<td headers="' + tableID + '_package">All GA Features</td>';
                        }

                        row.append(package_column);
                        row.append(download_column);
                        parent.append(row);
                    }
                }
            }

            // beta releases table only
            else if (parent.parent().data('builds-id') == "runtime_betas"){
                var package_locations = build.package_locations;
                if (package_locations !== null && package_locations !== undefined){
                    var num_packages = package_locations.length;
                    var version_column = $('<td headers="' + tableID + '_version" rowspan="' + num_packages + '">' + build.version + '</td>');

                    for (var i = 0; i < package_locations.length; i++){
                        var row = $('<tr></tr>'); // create a new row for each item in package_locations
                        var package_name = package_locations[i].split("=")[0].toLowerCase();
                        var href = package_locations[i].split("=")[1];
                        var download_column = $('<td headers="' + tableID + '_download"><a href="' +  href +'" class="' + analytics_class_name + '" rel="noopener">' + download_arrow + 'ZIP</a></td>');

                        if (i == 0) {
                            row.append(version_column); // add version column for first item in package_locations
                        }

                        if (package_name.indexOf("jakarta") > -1) {
                            var package_column = "<td headers='" + tableID + "_package'>Jakarta EE 9 Beta Features</td>";
                        }
                        else {
                            var package_column = "<td headers='" + tableID + "_package'>All Beta Features</td>";
                        }

                        row.append(package_column);
                        row.append(download_column);
                        parent.append(row);
                    }
                }
            }

            // eclipse developer tools releases only
            else {
                var row = $('<tr></tr>');
                var version_column = $('<td headers="' + tableID + '_version">' + build.version + '</td>');
                var download_column = $('<td headers="' + tableID + '_download"><a href="' + build.driver_location + '" class="' + analytics_class_name + '" rel="noopener">' + download_arrow + 'ZIP</a></td>');
                row.append(version_column);
                row.append(download_column);
                parent.append(row);
            }
        }

        // ol development builds and eclipse development builds
        else {
            var row = $('<tr></tr>');
            var date = new Date(build.date);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var minute = date.getMinutes();

            var date_column = $('<td headers="' + tableID + '_date">' + year + '-' + add_lead_zero(month) + '-' + add_lead_zero(day) + ', ' + add_lead_zero(hour) + ':' + add_lead_zero(minute) + '</td>');

            var tests_column = $('<td headers="' + tableID + '_tests"><a href="' +  build.tests_log +'" class="'+ analytics_class_name + ' tests_passed_link" rel="noopener">' + build.test_passed + ' / ' + build.total_tests + '</a></td>');

            var log_column = $('<td headers="' + tableID + '_logs"><a href="' + build.build_log + '" class="' + analytics_class_name + ' view_logs_link" target="_blank" rel="noopener">View logs</a></td>');

            var download_column = $('<td headers="' + tableID + '_download"><a href="' + build.driver_location + '" class="' + analytics_class_name + '" rel="noopener">' + download_arrow + 'ZIP</a></td>');

            row.append(date_column);
            row.append(tests_column);
            row.append(log_column);
            row.append(download_column);
            parent.append(row);
        }
    });
}



function add_lead_zero(number) {
    if(number < 10) {
        return '0' + number;
    } else {
        return number;
    }
}



function sort_builds(builds, key, descending) {
    builds.sort(function(a, b) {
        if(descending) {
            return a[key] < b[key]? 1 : -1;
        } else {
            return a[key] > b[key]? 1 : -1;
        }
    });
}



$(document).ready(function() {

    $('.builds_expand_link').click(function(event) {
        event.preventDefault();
        var table_container = $('#' + event.currentTarget.getAttribute('data-table-container-id'));

        var rows = $('tbody tr', table_container).length;
        var delay = 400 + rows * 25;

        if(table_container.is(':visible')) {
            table_container.animate({opacity: 0}, 400, function() {
                table_container.slideUp(delay, function() {
                    $('.collapse_link_text', event.currentTarget).text('expand');

                });
            });
        } else {
            table_container.slideDown(delay, function() {
                table_container.animate({opacity: 1}, 400);
                $('.collapse_link_text', event.currentTarget).text('collapse');
            });
        }

    });


    $('.build_table thead tr th a').click(function(event) {
        event.preventDefault();

        var table = $(event.currentTarget).closest('table');

        var builds_id = table.data('builds-id');
        var key = event.currentTarget.getAttribute('data-key');
        var descending = !(event.currentTarget.getAttribute('data-descending') == 'true');

        event.currentTarget.setAttribute('data-descending', descending);

        sort_builds(builds[builds_id], key, descending);
        render_builds(builds[builds_id], $('tbody', table));

    });

    $.ajax({
        url: builds_url
    }).done(function(data) {

        if(data.latest_releases){
            latest_releases = data.latest_releases;
            if(latest_releases.runtime){
                if(latest_releases.runtime.version){
                    $('#runtime_download_button_version').text(latest_releases.runtime.version);
                }
                if(latest_releases.runtime.driver_location){
                    $('#runtime_download_link').attr('href', latest_releases.runtime.driver_location);
                }
            }
            if(latest_releases.tools){
                if(latest_releases.tools.version){
                    $('#eclipse_developer_tools_download_link_version_text').text(latest_releases.tools.version);
                }
                if(latest_releases.tools.driver_location){
                    $('#eclipse_developer_tools_download_link').attr('href', latest_releases.tools.driver_location);
                }
            }
        }


        function formatBuilds(builds_from_response) {
            for(var i = 0; i < builds_from_response.length; i++) {
                var date_string = builds_from_response[i].date_time;
                var date = new Date(date_string.substr(0, 4), date_string.substr(5, 2) - 1, date_string.substr(8, 2), date_string.substr(11, 2), date_string.substr(13, 2));
                builds_from_response[i].date = date.getTime();
            }
            return builds_from_response;
        }

        if(data.builds){
            if(data.builds.runtime_releases){
                runtime_releases = formatBuilds(data.builds.runtime_releases);
                builds['runtime_releases'] = runtime_releases;
                sort_builds(runtime_releases, 'date', true);
                render_builds(runtime_releases, $('table[data-builds-id="runtime_releases"] tbody'));
            }
            if(data.builds.tools_releases){
                developer_tools_releases = formatBuilds(data.builds.tools_releases);
                builds['developer_tools_releases'] = developer_tools_releases;
                sort_builds(developer_tools_releases, 'date', true);
                render_builds(developer_tools_releases, $('table[data-builds-id="developer_tools_releases"] tbody'));
            }
            if(data.builds.runtime_betas){
                // if betas info is empty (the betas are not on DHE yet), hide beta tab and content
                if(data.builds.runtime_betas.length == 0){
                    $('#downloads-betas').parent().hide();
                    $('#runtime_betas').hide();
                }
                else {
                    runtime_betas = formatBuilds(data.builds.runtime_betas);
                    builds['runtime_betas'] = runtime_betas;
                    sort_builds(runtime_betas, 'date', true);
                    render_builds(runtime_betas, $('table[data-builds-id="runtime_betas"] tbody'));
                }
            }
            if(data.builds.runtime_nightly_builds){
                runtime_development_builds = formatBuilds(data.builds.runtime_nightly_builds);
                builds['runtime_development_builds'] = runtime_development_builds;
                sort_builds(runtime_development_builds, 'date', true);
                render_builds(runtime_development_builds, $('table[data-builds-id="runtime_development_builds"] tbody'));
            }
            if(data.builds.tools_nightly_builds){
                developer_tools_development_builds = formatBuilds(data.builds.tools_nightly_builds);
                builds['developer_tools_development_builds'] = developer_tools_development_builds;
                sort_builds(developer_tools_development_builds, 'date', true);
                render_builds(developer_tools_development_builds, $('table[data-builds-id="developer_tools_development_builds"] tbody'));
            }
        }
    });

    // Set up the tab groups to work according to accessibility guidelines
    // For each item in the tab group...
    $('.nav.nav-tabs').find("li > a").each(
        function(a) {
            var $tab = $(this);

            // Set the click event for each tab link
            $tab.click(
                 function(e) {
                    // Change url when tab is clicked so that page can be bookmarked
                    window.location.hash = this.hash;

                    var $tabList = $tab.closest('.tabs_container');
                    var $tabContent = $tabList.next();

                    // Remove tab stop from previously selected tab and content
                    $tabList.find("li > a").attr({"tabindex": "-1"});
                    $tabContent.find('.tab-content .active').attr({"tabindex": "-1"});

                    // Select the given tab and show its associated pane. The tab
                    // that was previously selected becomes unselected and its associated
                    // pane is hidden.
                    $tab.tab('show');

                    // Add tab stop to newly selected tab and content
                    $tabList.find("li > a.active").attr({"tabindex": "0"});
                    $tabContent.find(".tab-pane").eq($tab.parent().index()).attr({"tabindex": "0"});
                }
            );

            $tab.keydown(
                function(e) {
                    var currentTab = $tab.closest("li");
                    switch(e.which) {
                        case 37:  // left
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

                        case 39:  // right
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

                        case 36:  // home
                            // Navigate to first tab
                            e.preventDefault();
                            if (currentTab.prev().length > 0) {
                                currentTab.prevAll().last().find("a").click();
                            }
                            break;

                        case 35:  // end
                            // Navigate to last tab
                            e.preventDefault();
                            if (currentTab.next().length > 0) {
                                currentTab.nextAll().last().find("a").click();
                            }
                            break;
                    }
                }
            );

            // This event fires on tab show after a tab has been shown.
            $tab.on('shown.bs.tab', function (e) {
                var activeTab = e.target;          // newly activated tab
                $(activeTab).focus();
            });
        }
    );

    // Show copy to clipboard button when mouse enters code block
    $('.code_container').on('mouseenter', function(event) {
        target = $(event.currentTarget);
        $('main').append('<div id="copied_confirmation">Copied to clipboard</div><img id="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block">');
        $('#copy_to_clipboard').css({
            top: target.offset().top + 1,
            right: $(window).width() - (target.offset().left + target.outerWidth()) + 1
        }).stop().fadeIn();
    // Hide copy to clipboard button when mouse leaves code block (unless mouse enters copy to clipboard button)
    }).on('mouseleave', function(event) {
        var x = event.clientX;
        var y = event.clientY + $(window).scrollTop();
        var copy_button_top = $('#copy_to_clipboard').offset().top;
        var copy_button_left = $('#copy_to_clipboard').offset().left;
        var copy_button_bottom = copy_button_top + $('#copy_to_clipboard').outerHeight();
        var copy_button_right = $('#copy_to_clipboard').offset().left + $('#copy_to_clipboard').outerWidth();

        if(!(x > copy_button_left
            && x < copy_button_right
            && y > copy_button_top
            && y < copy_button_bottom)) {
            $('#copied_confirmation').remove();
            $('#copy_to_clipboard').remove();
            $('#copy_to_clipboard').stop().fadeOut();
        }
    });

    // Copy target element and show copied confirmation when copy to clipboard button clicked
    $(document).on("click", "#copy_to_clipboard", function(event) {
        event.preventDefault();
        // Target was assigned while hovering over the element to copy.
        openliberty.copy_element_to_clipboard(target, function(){
            $('#copied_confirmation').css({
                top: target.offset().top - 15,
                right: $(window).width() - (target.offset().left + target.outerWidth()) + 1
            }).stop().fadeIn().delay(3500).fadeOut();
        });
    });

    $(window).on('scroll', function(event) {
        // start animation if images are in viewport
        if ($('#bottom_images_container').isInViewport()) {
            startAnimation();
        }
    });
});

$(window).on("load", function(){
    $.ready.then(function(){
        var hash = window.location.hash;
        hash && $('ul.nav a[href="' + hash + '"]').click();

        // scroll to tabs that contain section in hash
        if (hash) {
            var nav_tabs = $('ul.nav a[href="' + hash + '"]').parent().parent();
            $("html, body").animate({ scrollTop: nav_tabs.offset().top }, 500);
        }

        // start animation if images are in viewport
        if ($('#bottom_images_container').isInViewport()) {
            startAnimation();
        }
    })
});