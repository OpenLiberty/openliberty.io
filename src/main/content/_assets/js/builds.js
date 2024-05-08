/*******************************************************************************
 * Copyright (c) 2017, 2023 IBM Corporation and others.
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
var versArr = [];

var builds_url = '/api/builds/data';
var starter_domain = 
    isNotProdSite() ? 'https://starter-staging.rh9j6zz75er.us-east.codeengine.appdomain.cloud' : 'https://start.openliberty.io';
var starter_info_url = starter_domain + '/api/start/info';
var starter_submit_url = starter_domain + '/api/start';
var starter_plugin_url= starter_domain+ '/api/start/plugin-versions';
var failed_builds_request = false;

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
        'jakartaee10.zip',
        'jakartaee9.zip',
        'javaee8.zip',
        'kernel.zip',
        'microProfile6.zip',
        'microProfile5.zip',
        'microProfile4.zip',
        'microProfile3.zip',
        'openliberty.zip',
        'webProfile10.zip',
        'webProfile9.zip',
        'webProfile8.zip'
    ],
    // ask if this should be changed to J10
    runtime_betas: function(version) { 
        return [
            'jakartaee10.zip', 
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

function isNotProdSite() {
    // both staging and draft will point to the staging branch of the starter repo
    var host = window.location.hostname;
    if ((host.indexOf('staging') > -1) || (host.indexOf('draft') > -1)) {
        return true;
    } else {
        return false;
    }
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
 * There are multiple public keys used to sign the Open Liberty driver.
 * This function is to get the correct public key for the Open Liberty version.
 * 
 * @param {String} liberty_version - String in X.X.X.X format where X are numbers. Assumes this version has SIG
 * and PEM files.
 */
function getPublicKeyURL(liberty_version) {
    if(!liberty_version) {
        return '';
    }

    var liberty_versions_using_2021_pem = ["22.0.0.1", "22.0.0.2", "22.0.0.3", "22.0.0.4", "22.0.0.5", "22.0.0.6", 
    "22.0.0.7", "22.0.0.8", "22.0.0.9", "22.0.0.10", "22.0.0.11", "22.0.0.12", "22.0.0.13", "23.0.0.1"];

    var liberty_versions_using_2023_pem = ["23.0.0.2", "23.0.0.3", "23.0.0.4", "23.0.0.5", "23.0.0.6", 
    "23.0.0.7", "23.0.0.8", "23.0.0.9", "23.0.0.10", "23.0.0.11", "23.0.0.12"];

    var pem_2021_href =
    "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/sign/public_keys/WebSphereLiberty_06-02-2021.pem";
    
    var pem_2023_href =
    "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/sign/public_keys/OpenLiberty_02-13-2023.pem";

    var pem_2024_href =
    "https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/sign/public_keys/OpenLiberty_02-13-2023.pem.cer";
    
    if(liberty_versions_using_2021_pem.indexOf(liberty_version) > -1) {
        return pem_2021_href;
    } else if(liberty_versions_using_2023_pem.indexOf(liberty_version) > -1) {
        return pem_2023_href;
    } else {
        return pem_2024_href;
    }
}

/**
 * Return URL for a DHE signature file
 * 
 * @param {String} liberty_version - String in X.X.X.X format where X are numbers
 * @param {Array} list - array of Strings that look like key-value pairs
 * @param {String} sig_key - a specific key in the list, e.g. "kernal.sig"
 * @returns returns array of URLs[SIG_URL, PEM_URL] if SIG is found, else empty string
 */
function getURLsForSigAndPem(liberty_version, list, sig_key) {
    if(!list) {
        // Builds prior to 2022 did not have signature files,
        // so those builds will have not have a list.  If list is empty
        // return an empty string as the result of the URL.
        return '';
    }

    for(var e = 0; e < list.length; e++) {
        var keyAndValue = list[e].split('=');
        if(keyAndValue[0].toLowerCase() === sig_key.toLowerCase()) {
            var pem_URL = getPublicKeyURL(liberty_version);
            var sig_URL = keyAndValue[1];
            return [sig_URL, pem_URL];
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

    let flag=0;
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
                    var version_id = flag == 0 ? "latest" : build.version.replace(/\./g, "-");
                    flag = 1;
                    var version_column = $(
                        '<td id="' + 
                            version_id + 
                            '" headers="' +
                            tableID +
                            '_version" rowspan="' +
                            num_packages +
                            '">' + 
                            build.version +
                            (releaseBuild.releasePostLink ? '<a class="version_sublink" href="'+baseURL+'/blog/'+releaseBuild.releasePostLink+'">'+release_blog+'</a>' : '') +
                            (releaseBuild.tests_log ? 
                                '<a class="version_sublink" ' +
                                'href="'+releaseBuild.tests_log + '" ' +
                                'title="' + releaseBuild.test_passed + '/' + releaseBuild.total_tests + ' tests passing"' +
                                '>Test results</a>' : '') +
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
                        var sig_href = getURLsForSigAndPem(build.version, package_signature_locations, sig_name+'.sig')[0];
                        var pem_href = getURLsForSigAndPem(build.version, package_signature_locations, sig_name+'.sig')[1];
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

                        var verification_column2 = $(
                            '<td headers="' + tableID + '_verification"' + 'rowspan="'+num_packages+'"' + '>' +
                            // Optional sig file download button
                            (sig_href ? (pem_href.endsWith('.cer')?'<a href="'+pem_href+'" class="'+analytics_class_name +'" rel="noopener" target="_blank">' + download_arrow +'CER</a>' :'<a href="'+pem_href+'" class="'+analytics_class_name +'" rel="noopener" target="_blank">' + download_arrow +'PEM</a>' ): '' ) +
                            '</td>'
                        );     

                        if (k === 0) {
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
                        if (package_name.indexOf('jakartaee10') > -1) {
                            // 23.0.0.3 and higher should have EE10 instead of EE9
                            package_column =
                                    '<td headers=\'' +
                                    tableID +
                                    '_package\'>Jakarta EE 10 <img class="info_tooltip" src="/img/information_downloads_table.svg" alt="For convenience, this package also includes features that enable MicroProfile 6"/> '+
                                    '<p class="tooltip_text" style="display:none;">For convenience, this package also includes features that enable MicroProfile 6.</p></td>';
                        } else if (package_name.indexOf('jakartaee9') > -1) {
                            // 21.0.0.12 to 23.0.0.2 should be labled "Jakarta EE 9"
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
                                    '_package\'>Jakarta EE 8 '
                                    +(((buildVersionYear === 23 && buildVersionMonth >=3 ) || (buildVersionYear > 23)) ? '<img class="info_tooltip" src="/img/information_downloads_table.svg" alt="For convenience, this package also includes features that enable MicroProfile 4"/> <p class="tooltip_text" style="display:none;">For convenience, this package also includes features that enable MicroProfile 4.</p>' :'') 
                                    +'</td>';
                            } else {
                                package_column =
                                    '<td headers=\'' +
                                    tableID +
                                    '_package\'>Java EE 8</td>';
                            }
                        } else if (package_name.indexOf('webprofile10') > -1) {
                            package_column =
                                '<td headers=\'' +
                                tableID +
                                '_package\'>Web Profile 10</td>';
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
                        } else if (package_name.indexOf('microprofile6') > -1) {
                            package_column =
                                '<td headers="' +
                                tableID +
                                '_package">MicroProfile 6</td>';
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
                        if (k === 0) {
                            // Only add the PEM button to the row with Version
                            row.append(verification_column2);              
                        }

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
                            (betaBuild.betaPostLink ? '<a class="version_sublink" href="'+baseURL+'/blog/'+betaBuild.betaPostLink+'">'+release_blog+'</a>' : '') +
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
                            getURLsForSigAndPem(build.version, beta_package_sig_locs, beta_sig_name+'.sig')[0];
                        var beta_pem_href = getURLsForSigAndPem(build.version, beta_package_sig_locs, beta_sig_name+'.sig')[1];
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

                        var beta_verification_column2 = $(
                            '<td headers="'+tableID+'_verification">' +
                            // Optional pem file download button
                            // If there is a sig, there is a pem
                            (beta_sig_href ? '<a href="'+beta_pem_href+'" class="'+analytics_class_name +'" rel="noopener">' + download_arrow +'PEM</a>' : '' ) +
                            '</td>'
                        );

                        if (d === 0) {
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
                        if(d === 0) {
                            // Only add the PEM button to the row with Version
                            beta_row.append(beta_verification_column2);
                        }
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

/**
 * This method will count how many table headers are present and also take into account if a header
 * spans multiple columns (aka HTML attribute colspan="")
 * 
 * @param {String} css_selector - Row containing the table headers
 */
function getTotalNumberOfTableColumns(css_selector) {
    var total_columns = 0;
    $(css_selector).children().each(function() {
        var node = $(this);
        if(node.prop("colSpan")) {
            total_columns += node.prop("colSpan");
        } else {
            total_columns += 1;
        }
    });
    return total_columns;
}

function highlightAlternateRows() {
    var total_releases_columns = getTotalNumberOfTableColumns('#runtime_releases_table > thead > tr');
    var total_beta_columns = getTotalNumberOfTableColumns('#runtime_betas_table > thead > tr');

    // Assumption: The table header indicates the max number of cells in a row. Not all rows will have the
    // max number of cells. The row containing the version cell should have the max number of cells.

    // 1. Look for all the release Version rows and apply the styling to every other version row
    $("#runtime_releases_table_container .release_table_body tr").filter(function() { 
        return $(this).children().length === total_releases_columns; 
    }).filter(':even').addClass('highlight_alternate_rows');

    // 2. Look for all the beta Version rows and apply the styling to every other version row
    $("#runtime_betas_table_container .release_table_body tr").filter(function() { 
        return $(this).children().length === total_beta_columns;
    }).filter(':even').addClass('highlight_alternate_rows');

    // 3. Look for the Version rows that have the styling and apply the styling to the rows that are associated with
    // the Version row.
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
      "jakartaee10",
      "jakartaee9",
      "webProfile10",
      "webProfile9",
      "microProfile6",
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
                    '<p class=\'invalid_field_message\'>Valid characters for package names include a-z, A-Z, \'_\' and 0-9. Packages must be separated by \'.\' </p>'
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
    // Each group name package can contain letters (either lower or uppercase),   
    // numbers and underscores all separated by periods Eg: com.Acme.my_widget.v2
    var valid_syntax = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/g;
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

// Force mp 6.0 and EE 10 to use at least java 11
function validate_java_eeAndmp_levels() {
    mpVersion = $(
        '.starter_field[data-starter-field=\'m\'] select'
    )
    .find(':selected')
    .text();
    eeVersion = $(
        '.starter_field[data-starter-field=\'e\'] select'
    )
    .find(':selected')
    .text(); 
    if ((mpVersion === '6.0') || (eeVersion == '10.0') || (mpVersion === "6.1")) {
        javaVersion = $(
            '.starter_field[data-starter-field=\'j\'] select'
        )
        .find(':selected')
        .text();
 
        if (javaVersion === '8') {
            
         var javaOptions = $('.starter_field[data-starter-field=\'j\'] select option').filter(function(){
            return this.text == "11"
           });
         $(javaOptions).prop('selected', true);
         var message = $(
         '<p> MicroProfile Version '+mpVersion+' and Java EE/Jakarta EE Version 10.0 require a minimum of Java SE Version 11.</p>' 
         );
         displayMessage(message,true);
         valid = true;
        }
     }
}

// validates the combinations of java/EE/MP on the starter page
function validate_starter_inputs(event) {
    var valid = true;
    var disableGenProjButton = false;
    var versions = starter_dependencies['e'].versions;
    var keys;
    var newEEVersion;
    var newMPVersion;
    var found;
    var i;
    $('#starter_warnings').empty();
    $('#starter_submit').addClass('disabled');

    var group_name_valid = validate_group_name();
    var app_name_valid = validate_application_name();

    // Here user is setting the EE version
    if((event) && (event.target.id === "Starter_Jakarta_Version")) {
        // mpOptions is all the possible mp versions in dropdown
        var mpOptions = $(
            '.starter_field[data-starter-field=\'m\'] select option'
        );
        var prev_selected_mp_version = mpOptions
            .filter(':selected')
            .text();   

        newEEVersion = $(
            '.starter_field[data-starter-field=\'e\'] select'
        )
        .find(':selected')
        .text();

        // if the previous MP wasn't None and the new EE version isn't None we need to find a good MP
        if ((prev_selected_mp_version !== "None") && (newEEVersion !== "None")) {
            var dependencies = versions[newEEVersion];             
            if (dependencies['m'].indexOf(prev_selected_mp_version) === -1) {
                newMPVersion = dependencies['m'][dependencies['m'].length - 1];
                valid = false;
            } 
        } else {
            if (newEEVersion === "None") {
                if (prev_selected_mp_version === "None") {
                    // both None is invalid
                    disableGenProjButton = true;
                } else {
                    // none for EE means anything other than none for mp is fine
                    disableGenProjButton = false;
                    valid = true;
                }
            } else {
                // EE version isn't none but mp version is None
                disableGenProjButton = false;
                valid = true;
            }
        }

        // if we have an invalid combination other than both set to none, pick a valid newMPVersion
        if(!valid && !disableGenProjButton) { 
            found = false;
            i = 0;
            while ((i<mpOptions.length) && !found) {
                if(mpOptions[i].value === newMPVersion) {
                    $(mpOptions[i]).prop('selected', true);
                    found = true;
                } else {
                    i++;
                }
            }  
            // message for an updated newMPVersion to match the selected EE version
            if (newMPVersion !== prev_selected_mp_version) {
                var message = $(
                    '<p>' +
                    starter_info['m'].name +
                    ' has been automatically updated from ' +
                    prev_selected_mp_version +
                    ' to ' +
                    newMPVersion +
                    ' for compatibility with ' +
                    starter_info['e'].name +
                    '.</p>'
                );
            }
            displayMessage(message);
            valid = true; 
        }       
    }
    //  we are setting the MicroProfile Version
    else if((event)&&(event.target.id === "Starter_MicroProfile_Version")) {
       
        var eeOptions = $(
            '.starter_field[data-starter-field=\'e\'] select option'
        );
        var prev_selected_ee_version = eeOptions
            .filter(':selected')
            .text();   
        newMPVersion = $(
            '.starter_field[data-starter-field=\'m\'] select'
        )
        .find(':selected')
        .text();
        // if the previous EE wasn't None and the new mp version isn't None we need to find a good EE
        if ((prev_selected_ee_version !== "None") && (newMPVersion !== "None")) {
           
            found = false;
            i = 0;
           

            for (var starter_key in starter_dependencies) {
                keys = Object.keys(versions);
            }
                
            do {
                var dependencies = versions[keys[i]];
                // if we found the newMPVersion under this newEEVersion key we're done
                 if (dependencies['m'].indexOf(newMPVersion) !== -1) {
                      // don't want to make the EE version None 
                      if (keys[i] !== "None") {
                        newEEVersion = keys[i];
                        if (newEEVersion === prev_selected_ee_version) {
                         valid = true;
                        } else {
                          valid = false;
                        }
                        found = true;
                    } 
                 }
                 i++;
            } while ((i < keys.length) && !found);
        } else {
            if (newMPVersion == "None"){
                  if (prev_selected_ee_version == "None") {
                    // both have been set to None which is invalid
                    valid = false;
                    disableGenProjButton = true;
                  } else {
                    // mp version is none and ee version is anything but none
                    valid = true;
                    disableGenProjButton = false;
                  }
            } else {
                // new mpVersion isn't none but ee version is none
                valid = true;
                disableGenProjButton = false;
            }  
        }
        // if we had an invalid combination other than both set to none, pick the valid newEEVersion
        if(!valid && !disableGenProjButton){ 
            found = false;
            i = 0;
            while ((i<eeOptions.length) && !found) {
                if(eeOptions[i].value === newEEVersion) {
                    $(eeOptions[i]).prop('selected', true);
                    found = true;
                } else {
                    i++;
                }
            }         
            // message for an updated newEEVersion to match the selected mp version 
            var message = $(
            '<p>' +
            starter_info['e'].name +
            ' has been automatically updated from ' +
            prev_selected_ee_version +
            ' to ' +
            newEEVersion +
            ' for compatibility with ' +
            starter_info['m'].name +
            '.</p>'
            );
            displayMessage(message);
            valid = true;
        }
    }

    // Now we need to validate that if EE 10 or MP 6.0 is selected, the Java is not 8
    validate_java_eeAndmp_levels();

    valid = valid && group_name_valid && app_name_valid && !disableGenProjButton;
    if (valid) {
        $('#starter_submit').removeClass('disabled');
    }
}

function displayMessage(message,javaMsg) {
    if(!javaMsg){
        javaMsg = false;
    }
    // Display a message when MP/Jakarta EE Version get changed.
    var close_icon = $(
        '<img src=\'/img/x_white.svg\' id=\'invalid_message_close_icon\' alt=\'Close\' tabindex=\'0\' />'
    );
    var classNameIs;
    if (javaMsg) {
        classNameIs = 'ind_starter_java_warning';
    } else {
        classNameIs = 'ind_starter_warning';
    }
    close_icon.on('click', function () {
        $('#starter_warnings').empty();
    });
    close_icon.on('keydown', function (event) {
        if ( event.which === 13 || event.which === 32 ) { // Enter key or spacebar
            $(this).click();
        }
    });
   
    $('#starter_warnings').append("<li class='" + classNameIs +"'>");

    $('.' + classNameIs)
    .append(message);
    $('#starter_warnings').append(close_icon);   
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
        failed_builds_request = false;
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
            var target = $(window.location.hash);
            if(target.length) {
                $("html, body").animate({ scrollTop: target.offset().top}); 
            }
        }
    })
    .fail(function (){
        failed_builds_request = true;
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

    // look into moving the text to the row instead of the cell
    $("#runtime_releases_table").on("mouseenter mouseleave", ".info_tooltip", function(e){
        var focus = $(this).siblings(".tooltip_text");
        if($(focus).css('display') === "none"){
            $(focus).show();
        }
        else{
            $(focus).hide();
        }
    })

    $(window).on('scroll', function (event) {
        // start animation if images are in viewport
        if ($('#bottom_images_container').isInViewport()) {
            startAnimation();
        }

        // if builds only partially render or don't render at all, show the animation
        var rendered_builds = $("#runtime_releases_table > tbody > tr").length;

        if(rendered_builds < 24 || failed_builds_request){
            $('#bottom_images_container').show();
        } else{
            $('#bottom_images_container').hide();
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

$(window).on('load', function () {
    $.ajax({
        url: starter_plugin_url,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            $('#maven_version').text(data.mavenVersion);
            $('#gradle_version').text(data.gradleVersion);  
        },
        error: function(error) {
            console.error('Error fetching Maven and Gradle plugin versions:', error);
        }
    });
});
