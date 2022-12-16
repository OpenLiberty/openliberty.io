/*******************************************************************************
 * Copyright (c) 2017, 2022 IBM Corporation and others.
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
var versArr = [];

var builds_url = '/api/builds/data';
var starter_domain = 
    isStagingSite() ? 'https://starter-staging.rh9j6zz75er.us-east.codeengine.appdomain.cloud' : 'https://start.openliberty.io';
var starter_info_url = starter_domain + '/api/start/info';
var starter_submit_url = starter_domain + '/api/start';

// Controls what build zips are exposed on openliberty.io.  This will need to be updated
// if there is a new zip version published on DHE.  The intent of this allow_builds list is to
// prevent the situation where unintential zips on DHE get shown on the website.
var allowed_builds = {
    // allow_builds list based on keys found in `package_locations` 
    // from the https://openliberty.io/api/builds/data.  The keys (i.e. kernel.zip) are defined by
    // by BuildInfo.java, method resolveLocations(String url, BuildType type, String dateTime)
    //
    // For example:
    // {
    //     "builds": {
    //         "runtime_releases": [
    //             {
    //                 "package_locations": [
    //                     "javaee8.zip=...openliberty-javaee8-21.0.0.12.zip",
    //                     "jakartaee9.zip=...openliberty-jakartaee9-21.0.0.12.zip",
    //                     "webProfile8.zip=...openliberty-webProfile8-21.0.0.12.zip",
    //                     "webProfile9.zip=...openliberty-webProfile9-21.0.0.12.zip",
    //                     "microProfile4.zip=...openliberty-microProfile4-21.0.0.12.zip",
    //                     "kernel.zip=...openliberty-kernel-21.0.0.12.zip",
    //                     "openliberty.zip=...openliberty-21.0.0.12.zip"
    //                 ]
    //             }
    //         ]
    //     }
    // }
    runtime_releases: [
        'jakartaee9.zip',
        'javaee8.zip',
        'kernel.zip',
        'microProfile3.zip',
        'microProfile4.zip',
        'microProfile5.zip',
        'openliberty.zip',
        'webProfile8.zip',
        'webProfile9.zip'
    ],
    runtime_betas: function(version) { 
        return [
            'jakartaee9.zip', 
            version+'.zip'
        ]; 
    },
    // runtime_nightly_builds not intended for used, here for completeness
    runtime_nightly_builds: undefined,
};

var site_lang = document.getElementsByTagName('html')[0].getAttribute('lang');
var baseURL = '';
if (site_lang != 'en') {
    baseURL = '/'+site_lang;
}

function isStagingSite() {
    var host = window.location.hostname;
    return host.indexOf('staging') > -1;
}

/**
 * Filter the package_locations fields from https://openliberty.io/api/builds/data and remove
 * any zips that do not have a key from the allowed_builds list.
 * @param {String} build_type - the type of build (e.g. runtime_releases)
 * @param {Array} package_locations - array of Strings that look like key-value pairs
 * @param {String} liberty_version - optional - Liberty version (e.g. 21.0.0.12)
 * @returns Array of Strings that look like key-value pairs
 */
function getAllowedBuilds(build_type, package_locations, liberty_version) {
    return package_locations.filter(function(x) {
        var zipKey = x.split('=')[0];
        var allowList =  liberty_version ? allowed_builds[build_type](liberty_version) 
            : allowed_builds[build_type];
        if(allowList.indexOf(zipKey) > -1) {
            return x;
        }
    });
}

/**
 * Return URL for a DHE signature file
 * 
 * @param {Array} list - array of Strings that look like key-value pairs
 * @param {String} sig_key - a specific key in the list, e.g. "kernal.sig"
 * @returns returns a URL if key is found, else empty string
 */
function getURLForSig(list, sig_key) {
    if(!list) {
        // Builds prior to 2022 did not have signature files,
        // so those builds will have not have a list.  If list is empty
        // return an empty string as the result of the URL.
        return '';
    }
    for(var e = 0; e < list.length; e++) {
        var keyAndValue = list[e].split('=');
        if(keyAndValue[0].toLowerCase() === sig_key.toLowerCase()) {
            return keyAndValue[1];
        }
    }
    // Could not a key in the list that matches
    return '';
}

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
    $('#ufo').css('animation', 'ufo_hovering 4.5s 3');
    $('#ufobeam').css('animation', 'ufo_hovering 4.5s 3');
    $('#cow').css('animation', 'cow_hovering 4.5s 3');
    $('#cowshadow').css('animation', 'shadow_resizing 4.5s 3');
}

function render_builds(builds, parent) {
    parent.empty();

    var tableID = parent.parent().data('builds-id');
    var analytics_class_name = 'link_' + tableID;
    var download_arrow =
        '<div class="download_arrow"><div class="table_arrow"></div><div class="table_line"></div></div>';
    var newest = 0;
    var subRelease = 0;

    // update maven and gradle commands to use latest version
    if (parent.parent().data('builds-id') == 'runtime_releases') {
        var latest_version = latest_releases.runtime.version.trim();

        // check that latest version matches x.x.x.x before updating
        var re = /^\d+\.\d\.\d\.\d+/;
        if (re.test(latest_version)) {
            $('.latest_version').html(latest_version);
        }

        // get the newest release version
        // used to only add builds from the last two years to the runtime release table
        versArr = JSON.parse(JSON.stringify(builds));
        sort_builds(versArr, "version", true);
        newest = parseInt(versArr[0].version.split(".")[0]);
        subRelease = parseInt(versArr[0].version.split(".")[3]);
    }

    // get the max number of package locations to determine number of rows
    var max = 1;
    builds.forEach(function (build) {
        if (parent.parent().data('builds-id') == 'runtime_releases') {
            if (build.package_locations.length > max) {
                max = build.package_locations.length;
            }
        }
    });

    builds.forEach(function (build) {
        if (parent.hasClass('release_table_body')) {
            if (build.version.indexOf('-RC') > -1) {
                build.version.replace('-RC', ' Release Candidate');
            }

            // ol releases table only
            if (parent.parent().data('builds-id') == 'runtime_releases') {
                var releaseBuild = createBlogReleaseAndBetaLink("release",build);
                var package_locations = build.package_locations;
                var sorted_package_locations;
                if (package_locations !== null && package_locations !== undefined) {
                    sorted_package_locations = sortRuntimeLocations(package_locations);
                    package_locations = sorted_package_locations;
                }
                var package_signature_locations = build.package_signature_locations || [];
                var sorted_package_signature_locations;
                if (package_signature_locations !== null && package_signature_locations !== undefined) {
                    sorted_package_signature_locations = sortRuntimeLocations(package_signature_locations);
                    package_signature_locations = sorted_package_signature_locations;
                }
                if (package_locations !== null && package_locations !== undefined) {

                    // Assume the .sig files from the allowed builds are also allowed
                    // without checking the .sig files.
                    package_locations = getAllowedBuilds('runtime_releases', package_locations);
                    
                    var num_packages = package_locations.length;
                    // Add enough empty rows so that each release has the max number of rows
                    // even when there are < max number packages. These empty rows will be hidden,
                    // but this ensures that the table highlighting is correct.
                    if (num_packages < max) {
                        for (var i = 0; i < max - num_packages; i++) {
                            parent.append('<tr></tr>');
                        }
                    }
                    
                    var version_column = $(
                        '<td headers="' +
                            tableID +
                            '_version" rowspan="' +
                            num_packages +
                            '">' +
                            build.version +
                            (releaseBuild.releasePostLink ? '<a class="blog_release_notes" href="'+baseURL+'/blog/'+releaseBuild.releasePostLink+'">'+release_blog+'</a>' : '') +
                            '</td>'
                    );


                    for (var k = 0; k < package_locations.length; k++) {
                        // create a new row for each item in package_locations
                        var row = $('<tr></tr>');
                        //========== Get URL for the .zip file
                        var package_name = package_locations[k]
                            .split('=')[0]
                            .toLowerCase();
                        var href = package_locations[k].split('=')[1];
                        //========== Get URL for the .sig file corresponding to the .zip file
                        // Assume package_name will always end with .zip and the filename 
                        // has _no_ dots
                        var sig_name = package_name.split('.')[0];
                        var sig_href = getURLForSig(package_signature_locations, sig_name+'.sig');
                        //========== Get URL for the .sha2 file
                        // TODO: Surface the href when DHE API has this data
                        // See https://github.com/OpenLiberty/openliberty.io/issues/1734
                        var sha2_href = '';

                        //========== Build the HTML for the download column containing file links
                        var download_column = $(
                            '<td headers="'+tableID+'_download">' +
                            '<a href="'+href+'" class="'+analytics_class_name +'" rel="noopener">' + download_arrow +'ZIP</a>' +
                            // Optional sha2 file download button
                            (sha2_href ? '<a href="'+sha2_href+'" class="'+analytics_class_name +'" rel="noopener">' + download_arrow +'SHA2</a>' : '' ) +
                            '</td>'
                        );
                        
                        var verification_column = $(
                            '<td headers="'+tableID+'_verification">' +
                            // Optional sig file download button
                            (sig_href ? '<a href="'+sig_href+'" class="'+analytics_class_name +'" rel="noopener">' + download_arrow +'SIG</a>' : '' ) +
                            '</td>'
                        );

                        if (k == 0) {
                            row.append(version_column); // add version column for first item in package_locations
                        }      
                        var package_column;   
                        var buildVersionYear = parseInt(
                            build.version.substring(
                                0,
                                build.version.indexOf('.')
                            ),
                            10
                        );
                        var buildVersionMonth = parseInt(
                            build.version.substring(
                                build.version.lastIndexOf('.') + 1
                            ),
                            10
                        );              
                        if (package_name.indexOf('jakartaee9') > -1) {
                            // 21.0.0.12 and higher should be labled "Jakarta EE 9"
                            package_column =
                                    '<td headers=\'' +
                                    tableID +
                                    '_package\'>Jakarta EE 9</td>';
                        } else if (package_name.indexOf('java') > -1) {                            
                            // 19.0.0.6 and higher should be labeled "Jakarta EE 8", and anything before should be "Java EE 8"                            
                            if (
                                buildVersionYear > 19 ||
                                (buildVersionYear === 19 &&
                                    buildVersionMonth > 5)
                            ) {
                                package_column =
                                    '<td headers=\'' +
                                    tableID +
                                    '_package\'>Jakarta EE 8</td>';
                            } else {
                                package_column =
                                    '<td headers=\'' +
                                    tableID +
                                    '_package\'>Java EE 8</td>';
                            }
                        } else if (package_name.indexOf('webprofile9') > -1) {
                            package_column =
                                '<td headers=\'' +
                                tableID +
                                '_package\'>Web Profile 9</td>';
                        } else if (package_name.indexOf('webprofile') > -1) {
                            package_column =
                                '<td headers=\'' +
                                tableID +
                                '_package\'>Web Profile 8</td>';
                        } else if (package_name.indexOf('microprofile3') > -1) {
                            package_column =
                                '<td headers="' +
                                tableID +
                                '_package">MicroProfile 3</td>';
                        } else if (package_name.indexOf('microprofile4') > -1) {
                            package_column =
                                '<td headers="' +
                                tableID +
                                '_package">MicroProfile 4</td>';
                        } else if (package_name.indexOf('microprofile5') > -1) {
                            package_column =
                                '<td headers="' +
                                tableID +
                                '_package">MicroProfile 5</td>';
                        } else if (package_name.indexOf('kernel') > -1) {
                            package_column =
                                '<td headers="' +
                                tableID +
                                '_package">Kernel</td>';
                        } else {
                            package_column =
                                '<td headers="' +
                                tableID +
                                '_package">All GA Features</td>';
                        }
                    
                        row.append(package_column);
                        row.append(download_column);
                        row.append(verification_column);

                        // checking if version is from the last two years before adding to table
                        var primary = parseInt(build.version.split(".")[0]);
                        var secondary = parseInt(build.version.split(".")[3]);
                        if(newest - primary <= 2){
                            if((newest - primary) === 2){
                                if(secondary >= subRelease){
                                    parent.append(row);
                                }
                            } else {
                                parent.append(row);
                            }
                        }
                    }
                }
            }

            // beta releases table only
            else if (parent.parent().data('builds-id') == 'runtime_betas') {
                var betaBuild = createBlogReleaseAndBetaLink("beta",build);
                var beta_package_locations = build.package_locations;
                var sorted_beta_package_locations;
                if (beta_package_locations !== null && beta_package_locations !== undefined) {
                    sorted_beta_package_locations = sortBetaLocations(beta_package_locations);
                    beta_package_locations = sorted_beta_package_locations;
                }
                var beta_package_sig_locs= build.package_signature_locations || [];
                var sorted_beta_package_sig_locs;
                if (beta_package_sig_locs !== null && beta_package_sig_locs !== undefined) {
                    sorted_beta_package_sig_locs = sortBetaLocations(beta_package_sig_locs);
                    beta_package_sig_locs = sorted_beta_package_sig_locs;
                }
                if (beta_package_locations !== null && beta_package_locations !== undefined) {
                    var version = build.version.split('-')[0]; // Remove the -beta from the version

                    // Assume the .sig files from the allowed builds are also allowed
                    // without checking the .sig files.
                    beta_package_locations = 
                        getAllowedBuilds('runtime_betas', beta_package_locations, version);
                    
                    var num_beta_packages = beta_package_locations.length;
                    var beta_version_column = $(
                        '<td headers="' +
                            tableID +
                            '_version" rowspan="' +
                            num_beta_packages +
                            '">' +
                            build.version +
                            (betaBuild.betaPostLink ? '<a class="blog_release_notes" href="'+baseURL+'/blog/'+betaBuild.betaPostLink+'">'+release_blog+'</a>' : '') +
                            '</td>'
                    );
            
                    for (var d = 0; d < beta_package_locations.length; d++) {
                        // create a new row for each item in package_locations
                        var beta_row = $('<tr></tr>');
                        //========== Get URL for the .zip file
                        var beta_package_name = beta_package_locations[d]
                            .split('=')[0]
                            .toLowerCase();
                        var beta_zip_href = beta_package_locations[d].split('=')[1];
                        //========== Get URL for the .sig file corresponding to the .zip file
                        // The name has a lot of dots, so have to use lastIndexOf to separate
                        // filename from file extension
                        var beta_sig_name = beta_package_name.substring(0, beta_package_name.lastIndexOf('.'));
                        var beta_sig_href = 
                            getURLForSig(beta_package_sig_locs, beta_sig_name+'.sig');
                        //========== Get URL for the .sha2 file
                        var beta_sha2_href = ''; // TODO: Surface the href when DHE API has this data

                        //========== Build the HTML for the download column containing file links
                        var beta_download_column = $(
                            '<td headers="'+tableID+'_download">' +
                            '<a href="'+beta_zip_href+'" class="'+analytics_class_name +'" rel="noopener">' + download_arrow +'ZIP</a>' +
                            // Optional sha2 file download button
                            (beta_sha2_href ? '<a href="'+beta_sha2_href+'" class="'+analytics_class_name +'" rel="noopener">' + download_arrow +'SHA2</a>' : '' ) +
                            '</td>'
                        );
                        
                        var beta_verification_column = $(
                            '<td headers="'+tableID+'_verification">' +
                            // Optional sig file download button
                            (beta_sig_href ? '<a href="'+beta_sig_href+'" class="'+analytics_class_name +'" rel="noopener">' + download_arrow +'SIG</a>' : '' ) +
                            '</td>'
                        );

                        if (d == 0) {
                            beta_row.append(beta_version_column); // add version column for first item in package_locations
                        }
            
                        if (beta_package_name.indexOf('jakarta') > -1) {
                            package_column =
                                '<td headers=\'' +
                                tableID +
                                '_package\'>Jakarta EE 9 Beta Features</td>';
                        } else {
                            package_column =
                                '<td headers=\'' +
                                tableID +
                                '_package\'>All Beta Features</td>';
                        }
            
                        beta_row.append(package_column);
                        beta_row.append(beta_download_column);
                        beta_row.append(beta_verification_column);
                        parent.append(beta_row);
                    }
                }
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

            var date_column = $(
                '<td headers="' +
                    tableID +
                    '_date">' +
                    year +
                    '-' +
                    add_lead_zero(month) +
                    '-' +
                    add_lead_zero(day) +
                    ', ' +
                    add_lead_zero(hour) +
                    ':' +
                    add_lead_zero(minute) +
                    '</td>'
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
                    ' / ' +
                    build.total_tests +
                    '</a></td>'
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
                    'ZIP</a></td>'
            );

            row.append(date_column);
            row.append(tests_column);
            row.append(log_column);
            row.append(download_column);
            parent.append(row);
        }
    });
    highlightAlternateRows();
}

function highlightAlternateRows() {
    $("#runtime_releases_table_container .release_table_body tr").filter(function() { 
        return $(this).children().length == document.getElementById('runtime_releases_table').rows[0].cells.length;
    }).filter(':even').addClass('highlight_alternate_rows');

    $("#runtime_betas_table_container .release_table_body tr").filter(function() { 
        return $(this).children().length == document.getElementById('runtime_betas_table').rows[0].cells.length;
    }).filter(':even').addClass('highlight_alternate_rows');
      
    $("tr.highlight_alternate_rows td[rowspan]").each(function() {
        $(this).parent().nextAll().slice(0, this.rowSpan - 1).addClass('highlight_alternate_rows');
    });
}

releaseTagPostLinks = [];
betaTagPostLinks = [];
getBlogsTags();

function getBlogsTags() {
    $.getJSON( "../../blog_tags.json", function(data) {
        $.each(data.blog_tags, function(j, tag) {
            if (tag.name == "release") {
                releaseTagPostLinks = tag.release_post_links
            }
            else if (tag.name == "beta") {
               betaTagPostLinks = tag.beta_post_links
            }
        })
    });
}

function createBlogReleaseAndBetaLink(buildId, build) {
    versionwithdots = build.version.split('-')[0];
    versionwithoutdots = versionwithdots.split('.').join("")
    var releasePostLink, betaPostLink
    if (buildId == "release") {
        releaseTagPostLinks.filter(function (postLink) {
            if (postLink.includes(versionwithdots) || postLink.includes(versionwithoutdots)) {
                releasePostLink = postLink;
            }
        });
        if (releasePostLink) {
            build.releasePostLink = releasePostLink;
        }
    }
    else if (buildId == "beta") {
        betaTagPostLinks.filter(function (postLink) {
            if (postLink.includes(versionwithdots) || postLink.includes(versionwithoutdots)) {
                betaPostLink = postLink;
            }
        });
        if (betaPostLink) {
            build.betaPostLink = betaPostLink;
        }
    }
    return build;
}

function add_lead_zero(number) {
    if (number < 10) {
        return '0' + number;
    } else {
        return number;
    }
}

function sortBetaLocations(package_locations_param) {
    var sortArr = [];
    package_locations_param.forEach(function (x) {
      ver = x.split("=")[0];
      ver = ver.substring(0, ver.lastIndexOf("."));
      sortArr.push({ location: x, version: ver });
    });
    sortArr.sort(orderVersions);
    var newLoc = sortArr.map(function(x) {return x.location});
    return newLoc;
  }
  
  function orderVersions(a, b) {
    var arrA = a.version.split(".");
    var arrB = b.version.split(".");
    for (var i = 0; i < arrA.length; i++) {
      if (parseInt(arrA[i]) > parseInt(arrB[i])) {
        return -1;
      } else if (parseInt(arrA[i]) < parseInt(arrB[i])) {
        return 1;
      }
    }
    return 0;
  }
  
  function sortRuntimeLocations(package_locations_param) {
    // this array is used to order the different applications available for each runtime version
    // priority should list newest to oldest platforms, ending with kernel and GA
    app_priority_array = [
      "jakartaee9",
      "webProfile9",
      "microProfile5",
      "javaee8",
      "webProfile8",
      "microProfile4",
      "microProfile3",
      "kernel",
      "openliberty",
    ];
    var newLocations = [];
    var packageNames = package_locations_param.map(function(x) {return x.split(".")[0]});
    for (var k = 0; k < app_priority_array.length; k++) {
      ind = packageNames.indexOf(app_priority_array[k]);
      if (ind > -1) {
        newLocations.push(package_locations_param[ind]);
      }
    }
    return newLocations;
  }


function sort_builds(builds, key, descending) {
    if(key === "version"){
        // split version numbers by periods, loop through the resulting arrays to compare
        builds.sort(function (a,b){
            var aVers = (a[key].split(".")).map(Number);
            var bVers = (b[key].split(".")).map(Number);
            for(var i = 0; i < aVers.length; i++){
                if(aVers[i] < bVers[i]){
                    if(descending){
                        return 1;
                    }
                    return -1;
                }
                if(aVers[i] > bVers[i]){
                    if(descending){
                        return -1;
                    }
                    return 1;
                }
                if(i === aVers.length - 1){
                    return 0;
                }
            }
        })
    } else {
        builds.sort(function (a, b) {
            if (descending) {
                return a[key] < b[key] ? 1 : -1;
            } else {
                return a[key] > b[key] ? 1 : -1;
            }
        });
    }
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
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function add_invalid_message(field_id, valid) {
    if (!valid) {
        if (
            $(
                '.starter_field[data-starter-field=\'' +
                    field_id +
                    '\'] .invalid_field_div'
            ).length == 0
        ) {
            var div = $('<div class=\'invalid_field_div\' />');
            var warning_icon = $(
                '<img class=\'invalid_icon\' src=\'/img/warning_red.svg\' alt=\'Invalid field icon\' />'
            );
            var message;
            if (field_id == 'a') {
                message = $(
                    '<p class=\'invalid_field_message\'>Valid characters include a-z separated by \'-\'</p>'
                );
            } else if (field_id == 'g') {
                message = $(
                    '<p class=\'invalid_field_message\'>Valid characters include a-z separated by \'.\'</p>'
                );
            }
            div.append(warning_icon).append(message);
            $('.starter_field[data-starter-field=\'' + field_id + '\']').append(
                div
            );
        } else {
            $('.starter_field[data-starter-field=\'' + field_id + '\']')
                .find('.invalid_field_div')
                .show();
        }
    } else {
        $('.starter_field[data-starter-field=\'' + field_id + '\']')
            .find('.invalid_field_div')
            .hide();
    }
}

// Base package name
function validate_group_name() {
    var valid_syntax = /^([a-z]+\.)*[a-z]+$/g; // Starts with a lowercase char and only contains letters and periods.
    var value = $('.starter_field[data-starter-field=\'g\'] input').val();
    var valid = value == '' ? false : valid_syntax.test(value);
    add_invalid_message('g', valid);
    return valid;
}

// Application name
function validate_application_name() {
    var valid_syntax = /^([a-z]+\-)*[a-z]+$/g; // Only contains lowercase letters and dashes.
    var value = $('.starter_field[data-starter-field=\'a\'] input').val();
    var valid = value == '' ? false : valid_syntax.test(value);
    add_invalid_message('a', valid);
    return valid;
}

var disableGenProjButton = false;
function validate_starter_inputs(event) {
    var valid = true;
    $('#starter_warnings').empty();
    $('#starter_submit').addClass('disabled');

    var group_name_valid = validate_group_name();
    var app_name_valid = validate_application_name();
    if((event) && (event.target.id === "Starter_Jakarta_Version")) {
        for (var starter_key in starter_dependencies) {
            var versions = starter_dependencies[starter_key].versions;
            var EEVersionValue = $(
                '.starter_field[data-starter-field=\'' +
                    starter_key +
                    '\'] select'
            )
            .find(':selected')
            .text();
            var dependencies = versions[EEVersionValue];
            for (var d in dependencies) {
                var dependency_value = $(
                    '.starter_field[data-starter-field=\'' + d + '\'] select'
                )
                .find(':selected')
                .text();
                if (dependencies[d].indexOf(dependency_value) === -1) {
                    valid = false;
                }
                var options = $(
                    '.starter_field[data-starter-field=\'' +
                    d +
                    '\'] select option'
                );
                var curr_selected_mp_version;
                var valuetoSelect;
                if(EEVersionValue !== "None") {
                    curr_selected_mp_version = valuetoSelect = dependencies[d][dependencies[d].length - 1];
                }
                var prev_selected_mp_version = options
                .filter(':selected')
                .text();
                if ((EEVersionValue === "None") && (prev_selected_mp_version === "None")) {
                    disableGenProjButton = true;
                }
                else {
                    disableGenProjButton = false;
                }
                for(var i=0; i<options.length; i++) {
                    var value = options[i].value;
                    if(value === valuetoSelect) {
                        $(options[i]).prop('selected', true);
                        if((prev_selected_mp_version !== "None") && (EEVersionValue !== "None") && (prev_selected_mp_version !== curr_selected_mp_version)) {
                            var message = $(
                                '<p>' +
                                starter_info[d].name +
                                ' has been automatically updated from ' +
                                prev_selected_mp_version +
                                ' to ' +
                                curr_selected_mp_version +
                                ' for compatibility with ' +
                                starter_info[starter_key].name +
                                '.</p>'
                            );
                        }
                        else if((prev_selected_mp_version === "None") && (EEVersionValue !== "None")) {
                            var message = $(
                                '<p>' +
                                starter_info[d].name +
                                ' has been automatically updated to ' +
                                curr_selected_mp_version +
                                ' for compatibility with ' +
                                starter_info[starter_key].name +
                                '.</p>'
                            );
                        }
                        displayMessage(message);
                        valid = true;
                    }
                }
            }
        }
    }
    else if((event)&&(event.target.id === "Starter_MicroProfile_Version")) {
        var versions;
        var keys;
        var EEVersion;
        var mpVersionValue = $(
            '.starter_field[data-starter-field=\'m\'] select'
        )
        .find(':selected')
        .text();
        for (var starter_key in starter_dependencies) {
            versions = starter_dependencies[starter_key].versions;
            keys = Object.keys(versions);
        }
        for(var i=0; i<keys.length; i++) {
            if(keys[i] !== "None") {
                var dependencies = versions[keys[i]];
                for (var d in dependencies) {
                    if (dependencies[d].indexOf(mpVersionValue) !== -1) {
                        EEVersion = keys[i];
                        valid = false;
                    }
                }
            }
        }
        var options = $(
            '.starter_field[data-starter-field=\'e\'] select option'
        );
        if(!valid){
            var prev_selected_ee_version = options
            .filter(':selected')
            .text();
            for(var i=0; i<options.length; i++) {
                if(options[i].value === EEVersion) {
                    if(mpVersionValue !== "None") {
                        $(options[i]).prop('selected', true);
                    }
                    if((mpVersionValue === "None") && (prev_selected_ee_version === "None")) {
                        disableGenProjButton = true;
                    }
                    else {
                        disableGenProjButton = false;
                    }
                }
            }
            if((mpVersionValue !== "None") && (prev_selected_ee_version !== "None") && (EEVersion !== prev_selected_ee_version)) {
                var message = $(
                '<p>' +
                starter_info['e'].name +
                ' has been automatically updated from ' +
                prev_selected_ee_version +
                ' to ' +
                EEVersion +
                ' for compatibility with ' +
                starter_info['m'].name +
                '.</p>'
                );
            }
            else if((prev_selected_ee_version === "None") && (mpVersionValue !== "None")) {
                var message = $(
                '<p>' +
                starter_info['e'].name +
                ' has been automatically updated to ' +
                EEVersion +
                ' for compatibility with ' +
                starter_info['m'].name +
                '.</p>'
                );
            }
            displayMessage(message);
            valid = true;
        }
    }
    valid = valid && group_name_valid && app_name_valid && !disableGenProjButton;
    if (valid) {
        $('#starter_submit').removeClass('disabled');
    }
}

function displayMessage(message) {
    // Display a message when MP/Jakarta EE Version get changed.
    var close_icon = $(
        '<img src=\'/img/x_white.svg\' id=\'invalid_message_close_icon\' alt=\'Close\' tabindex=\'0\' />'
    );
    close_icon.on('click', function () {
        $('#starter_warnings').empty();
    });
    close_icon.on('keydown', function (event) {
        if ( event.which === 13 || event.which === 32 ) { // Enter key or spacebar
            $(this).click();
        }
    });
    $('#starter_warnings')
    .append(message)
    .append(close_icon);                                  
}


$(document).ready(function () {
    get_starter_info()
        .done(function (data) {
            for (var starter_field in starter_info) {
                var info = starter_info[starter_field];
                var constraints = info.constraints;
                var id = info.name.replace(' ', '_');
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
                case 'b':
                    for (var j = 0; j < options.length; j++) {
                        var value = options[j];
                        var radio_button = $(
                            '<input type=\'radio\' id=\'build_system_' +
                                    value +
                                    '\' name=\'build_system\' value=\'' +
                                    value +
                                    '\'></radio>'
                        );
                        if (value === default_value) {
                            radio_button.prop('checked', true);
                        }
                        var option_label = $(
                            '<label for=\'build_system_' +
                                    value +
                                    '\'>' +
                                    uppercase_first_letter(value) +
                                    '</label>'
                        );
                        $('#build_system_section div[role=\'radiogroup\'')
                            .append(radio_button)
                            .append(option_label);
                    }
                    break;
                case 'e': // Java EE / Jakarta EE Version
                case 'j': // Java SE Version
                case 'm': // MicroProfile Version
                    for (var j = 0; j < options.length; j++) {
                        var value = options[j];
                        var option_tag = $(
                            '<option value=\'' +
                                    value +
                                    '\'>' +
                                    value +
                                    '</option>'
                        );
                        if (value === info.default) {
                            option_tag.prop('selected', true);
                        }
                        $(
                            '.starter_field[data-starter-field=\'' +
                                    starter_field +
                                    '\'] select'
                        ).prepend(option_tag);
                    }
                    break;
                case 'a': // Application name
                case 'g': // Base Package
                    $(
                        '.starter_field[data-starter-field=\'' +
                                starter_field +
                                '\'] input'
                    ).val(default_value);
                    break;
                default:
                    break;
                }
            }
            $('.starter_field select').on('change', function (event) {
                validate_starter_inputs(event);
            });
            $('.starter_field input').on('keyup', function () {
                validate_starter_inputs();
            });
            validate_starter_inputs(); // Run once to disable invalid inputs.
        })
        .fail(function () {
            console.error('Failed to pull from the starter api');
        });

    $('#starter_submit').on('keydown', function (event) {
        if (event.which === 13 || event.which === 32) {
            // Enter or Spacebar
            $(this).click();
        }
    });

    $('#starter_submit').click(function (event) {
        var app_name = $('#Starter_App_Name').val();
        var base_package = $('#Starter_Base_Package').val();
        var build_type = $('input[name=\'build_system\']:checked').val();
        var java_version = $('#Starter_Java_Version').val();
        var jakarta_ee_version = $('#Starter_Jakarta_Version').val();
        var microprofile_version = $('#Starter_MicroProfile_Version').val();
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
            type: 'get',
            data: data,
            xhrFields: {
                responseType: 'blob',
            },
        })
            .done(function (data) {
                if (data) {
                    var anchor = document.createElement('a');
                    var url = window.URL || window.webkitURL;
                    anchor.href = url.createObjectURL(data);
                    anchor.download = app_name + '.zip';
                    document.body.append(anchor);
                    anchor.click();
                    setTimeout(function () {
                        document.body.removeChild(anchor);
                        url.revokeObjectURL(anchor.href);
                    }, 1);
                    $('#generate-project-modal').modal('show');
                    setFocusOnModalPopupElement();
                    var build_tool = $('input[name=\'build_system\']:checked').val();
                    if(build_tool == "maven") {
                        $('#cmd_to_run').text("mvnw liberty:dev");
                    }
                    else {
                        $('#cmd_to_run').text("gradlew libertyDev");
                    }
                }
            })
            .fail(function (response) {
                console.error('Failed to download the starter project.');
            });
    });

    function setFocusOnModalPopupElement() {
        $('#generate-project-modal').on('shown.bs.modal', function () {
            var modal = $(this);
            var focusableChildren = modal.find('button, a[href]');
            var numElements = focusableChildren.length;
            var currentIndex = 2;
            var focusableElement = focusableChildren[currentIndex];
            focusableElement.focus();
            var focus = function() {
                var focusableElement = focusableChildren[currentIndex];
                if (focusableElement)
                    focusableElement.focus();
            };
        
            var focusPrevious = function () {
                currentIndex--;
                if (currentIndex < 0)
                    currentIndex = numElements - 1;
                focus();
                return false;
            };
        
            var focusNext = function () {
                currentIndex++;
                if (currentIndex >= numElements)
                    currentIndex = 0;
                focus();
                return false;
            };
        
            $(document).on('keydown', function (e) {
                if (e.keyCode == 9 && e.shiftKey) {
                    e.preventDefault();
                    focusPrevious();
                }
                else if (e.keyCode == 9) {
                    e.preventDefault();
                    focusNext();
                }
            });
        });
    }

    $('#generate-project-modal').on('hidden.bs.modal', function() {
        $(document).unbind('keydown');
        $('#copy_to_clipboard').remove();
    });

    $('.builds_expand_link').click(function (event) {
        event.preventDefault();
        var table_container = $(
            '#' + event.currentTarget.getAttribute('data-table-container-id')
        );

        var rows = $('tbody tr', table_container).length;
        var delay = 400 + rows * 25;

        if (table_container.is(':visible')) {
            table_container.animate({ opacity: 0 }, 400, function () {
                table_container.slideUp(delay, function () {
                    $('.collapse_link_text', event.currentTarget).text(
                        'expand'
                    );
                });
            });
        } else {
            table_container.slideDown(delay, function () {
                table_container.animate({ opacity: 1 }, 400);
                $('.collapse_link_text', event.currentTarget).text('collapse');
            });
        }
    });

    $('.build_table thead tr th a').click(function (event) {
        event.preventDefault();

        var table = $(event.currentTarget).closest('table');

        var builds_id = table.data('builds-id');
        var key = event.currentTarget.getAttribute('data-key');
        var descending = !(
            event.currentTarget.getAttribute('data-descending') == 'true'
        );

        event.currentTarget.setAttribute('data-descending', descending);

        sort_builds(builds[builds_id], key, descending);
        render_builds(builds[builds_id], $('tbody', table));
    });

    $.ajax({
        url: builds_url,
    }).done(function (data) {
        if (data.latest_releases) {
            latest_releases = data.latest_releases;
            if (latest_releases.runtime) {
                if (latest_releases.runtime.version) {
                    $('#runtime_download_button_version').text(
                        latest_releases.runtime.version
                    );
                }
                if (latest_releases.runtime.driver_location) {
                    $('#runtime_download_link').attr(
                        'href',
                        latest_releases.runtime.driver_location
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
                builds['runtime_releases'] = runtime_releases;
                sort_builds(runtime_releases, "version", true);
                render_builds(
                    runtime_releases,
                    $('table[data-builds-id="runtime_releases"] tbody')
                );
            }
            if (data.builds.runtime_betas) {
                // if betas info is empty (the betas are not on DHE yet), hide beta tab and content
                if (data.builds.runtime_betas.length == 0) {
                    $('#downloads-betas').parent().hide();
                    $('#runtime_betas').hide();
                } else {
                    runtime_betas = formatBuilds(data.builds.runtime_betas);
                    builds['runtime_betas'] = runtime_betas;
                    sort_builds(runtime_betas, 'date', true);
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
                builds['runtime_development_builds'] =
                    runtime_development_builds;
                sort_builds(runtime_development_builds, 'date', true);
                render_builds(
                    runtime_development_builds,
                    $(
                        'table[data-builds-id="runtime_development_builds"] tbody'
                    )
                );
            }
        }
    });

    // Set up the tab groups to work according to accessibility guidelines
    // For each item in the tab group...
    $('.nav.nav-tabs')
        .find('li > a')
        .each(function (a) {
            var $tab = $(this);

            // Set the click event for each tab link
            $tab.click(function (e) {
                // Change url when tab is clicked so that page can be bookmarked
                window.location.hash = this.hash;

                var $tabList = $tab.closest('.tabs_container');
                var $tabContent = $tabList.next();

                // Remove tab stop from previously selected tab and content
                $tabList.find('li > a').attr({ tabindex: '-1' });
                $tabContent
                    .find('.tab-content .active')
                    .attr({ tabindex: '-1' });

                // Select the given tab and show its associated pane. The tab
                // that was previously selected becomes unselected and its associated
                // pane is hidden.
                $tab.tab('show');

                // Add tab stop to newly selected tab and content
                $tabList.find('li > a.active').attr({ tabindex: '0' });
                $tabContent
                    .find('.tab-pane')
                    .eq($tab.parent().index())
                    .attr({ tabindex: '0' });
            });

            $tab.keydown(function (e) {
                var currentTab = $tab.closest('li');
                switch (e.which) {
                case 37: // left
                    //case 38:  // up
                    // Navigate to previous tab with left/up key
                    e.preventDefault();
                    if (currentTab.prev().length === 0) {
                        // If on first tab, cycle back to last
                        currentTab.nextAll().last().find('a').click();
                    } else {
                        currentTab.prev().find('a').click();
                    }
                    break;

                case 39: // right
                    //case 40:  // down
                    // Navigate to next tab with right/down key
                    e.preventDefault();
                    if (currentTab.next().length == 0) {
                        // If on last tab, cycle back to 1st
                        currentTab.prevAll().last().find('a').click();
                    } else {
                        currentTab.next().find('a').click();
                    }
                    break;

                case 36: // home
                    // Navigate to first tab
                    e.preventDefault();
                    if (currentTab.prev().length > 0) {
                        currentTab.prevAll().last().find('a').click();
                    }
                    break;

                case 35: // end
                    // Navigate to last tab
                    e.preventDefault();
                    if (currentTab.next().length > 0) {
                        currentTab.nextAll().last().find('a').click();
                    }
                    break;
                }
            });

            // This event fires on tab show after a tab has been shown.
            $tab.on('shown.bs.tab', function (e) {
                var activeTab = e.target; // newly activated tab
                $(activeTab).focus();
            });
        });

    // Show copy to clipboard button when mouse enters code block
    $('.code_container, .cmd_to_run')
        .on('mouseenter', function (event) {
            target = $(event.currentTarget);
            $('main').append(
                '<div id="copied_confirmation">Copied to clipboard</div><img id="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block">'
            );
            $('#copy_to_clipboard')
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
        .on('mouseleave', function (event) {
            var x = event.clientX;
            var y = event.clientY + $(window).scrollTop();
            var copy_button_top = $('#copy_to_clipboard').offset().top;
            var copy_button_left = $('#copy_to_clipboard').offset().left;
            var copy_button_bottom =
                copy_button_top + $('#copy_to_clipboard').outerHeight();
            var copy_button_right =
                $('#copy_to_clipboard').offset().left +
                $('#copy_to_clipboard').outerWidth();

            if (
                !(
                    x > copy_button_left &&
                    x < copy_button_right &&
                    y > copy_button_top &&
                    y < copy_button_bottom
                )
            ) {
                $('#copied_confirmation').remove();
                $('#copy_to_clipboard').remove();
                $('#copy_to_clipboard').stop().fadeOut();
            }
        });

    // Copy target element and show copied confirmation when copy to clipboard button clicked
    $(document).on('click', '#copy_to_clipboard', function (event) {
        event.preventDefault();
        // Target was assigned while hovering over the element to copy.
        openliberty.copy_element_to_clipboard(target, function () {
            $('#copied_confirmation')
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

    $(window).on('scroll', function (event) {
        // start animation if images are in viewport
        if ($('#bottom_images_container').isInViewport()) {
            startAnimation();
        }
    });
});

$(window).on('load', function () {
    $.ready.then(function () {
        var hash = window.location.hash;
        hash && $('ul.nav a[href="' + hash + '"]').click();

        // scroll to tabs that contain section in hash
        if (hash) {
            var nav_tabs = $('ul.nav a[href="' + hash + '"]')
                .parent()
                .parent();
            $('html, body').animate({ scrollTop: nav_tabs.offset().top }, 500);
        }

        // start animation if images are in viewport
        if ($('#bottom_images_container').isInViewport()) {
            startAnimation();
        }
    });
});
