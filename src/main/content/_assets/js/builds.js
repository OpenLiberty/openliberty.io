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

var builds = [];

var latest_releases = [];
var runtime_releases = [];
var runtime_development_builds = [];
var developer_tools_releases = [];
var developer_tools_development_builds = [];

var builds_url = '/api/builds/data';

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

    builds.forEach(function(build) {
        var web_profile_row = null,
            microprofile_row = null,
            all_ga_features_row = null;
        var row = $('<tr></tr>');
        // both releases tables (ol releases and eclipse developer tools releases)
        if(parent.hasClass('release_table_body')) {
            if(build.version.indexOf('-RC') > -1){
                build.version.replace('-RC', ' Release Candidate');
            }
            var version_column, zip_column;

            // ol releases table only
            if(parent.parent().data('builds-id') == "runtime_releases"){
                web_profile_row = $('<tr></tr>');
                microprofile_row = $('<tr></tr>');
                all_ga_features_row = $('<tr></tr>');
                var package_locations = build.package_locations;
                if(package_locations !== null && package_locations !== undefined){
                    var num_packages = package_locations.length + 1;
                    version_column = $('<td headers="' + tableID + '_version" rowspan="' + num_packages + '"><span class="table_date">' + build.version + '</span></td>');
                    row.append(version_column);

                    for(var i = 0; i < package_locations.length; i++){
                        var package_name = package_locations[i].split("=")[0];
                        package_name = package_name.toLowerCase();
                        var href = package_locations[i].split("=")[1];
                        var package_column = $('<td headers="' + tableID + '_download"></td>');
                        package_column.append($('<a href="' +  href +'" class="' + analytics_class_name + ' skip_outbound_link_analytics">' + 
                        download_arrow + 'ZIP</a>'));
                        if (package_name.indexOf("java") > -1) {
                            // 19.0.0.6 and higher should be labeled "Jakarta EE 8", and anything before should be "Java EE 8"
                            buildVersionYear = parseInt(build.version.substring(0, build.version.indexOf(".")), 10);
                            buildVersionMonth = parseInt(build.version.substring(build.version.lastIndexOf(".") + 1), 10);
                            if (buildVersionYear > 19 || (buildVersionYear === 19 && buildVersionMonth > 5)) {
                                row.append("<td headers='" + tableID + "_package'>Jakarta EE 8</td>");
                            } else {
                                row.append("<td headers='" + tableID + "_package'>Java EE 8</td>");                        
                            }
                            row.append(package_column);
                        }
                        else if (package_name.indexOf("web") > -1) {
                            web_profile_row.append("<td headers='" + tableID + "_package'>Web Profile 8</td>");
                            web_profile_row.append(package_column);
                        }
                        else if (package_name.indexOf("microprofile") > -1) {
                            microprofile_row.append('<td headers="' + tableID + '_package">MicroProfile 3</td>');
                            microprofile_row.append(package_column);
                        }

                    }
                    all_ga_features_row.append('<td headers="' + tableID + '_package">All GA Features</td>');
                    all_ga_features_row.append('<td headers="' + tableID + '_download"><a href="' + build.driver_location + '" class="' + analytics_class_name + ' skip_outbound_link_analytics">' + download_arrow + 'ZIP</a></td>');
                }
                else{
                    version_column = $('<td headers="' + tableID + '_version"><span class="table_date">' + build.version + '</span></td>');            
                    row.append(version_column);
                    row.append('<td headers="' + tableID + '_package">All GA Features</td>');
                    row.append('<td headers="' + tableID + '_download"><a href="' + build.driver_location + '" class="' + analytics_class_name + ' skip_outbound_link_analytics">' + download_arrow + 'ZIP</a></td>');
                }
            // eclipse developer tools releases only
            }  else {
                version_column = $('<td headers="' + tableID + '_version"><span class="table_date">' + build.version + '</span></td>');
                zip_column = $('<td headers="' + tableID + '_download"><a href="' + build.driver_location + '" class="' + analytics_class_name + ' skip_outbound_link_analytics">' + download_arrow + 'ZIP</a></td>');
                row.append(version_column);
                row.append(zip_column);
            }
        // remaining tables (ol development builds and eclipse development builds)
        } else {
            var date = new Date(build.date);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var minute = date.getMinutes();
            var date_column = $('<td headers="' + tableID + '_date"><span class="table_date">' + year + '-' + add_lead_zero(month) + '-' + add_lead_zero(day) + ', ' + add_lead_zero(hour) + ':' + add_lead_zero(minute) + '</span></td>');
            row.append(date_column);
            
            var tests_column = $('<td headers="' + tableID + '_tests"><a href="' +  build.tests_log +'" class="'+ analytics_class_name + ' skip_outbound_link_analytics tests_passed_link">' + build.test_passed + ' / ' + build.total_tests + '</a></td>');
            row.append(tests_column);
            
            var log_column = $('<td headers="' + tableID + '_logs"><a href="' + build.build_log + '" class="' + analytics_class_name + ' skip_outbound_link_analytics view_logs_link" target="_blank" rel="noopener">View logs</a></td>');            
            row.append(log_column);

            var download_zip_column = $('<td headers="' + tableID + '_download"><a href="' + build.driver_location + '" class="' + analytics_class_name + ' skip_outbound_link_analytics">' + download_arrow + 'ZIP</a></td>');
            row.append(download_zip_column);
        }

        parent.append(row);
        parent.append(web_profile_row);
        parent.append(microprofile_row);
        parent.append(all_ga_features_row);

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

    $(function(){
        var hash = window.location.hash;
        hash && $('ul.nav a[href="' + hash + '"]').click();
    });

});
