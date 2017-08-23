let builds = [];

let runtime_releases = [];
let runtime_development_builds = [];
let developer_tools_releases = [];
let developer_tools_development_builds = [];



/* TEMPORARY CODE - START */

for(let i = 0; i < 1; i++) {
    let developer_build = {};
    developer_build.date = Date.now() + Math.floor(Math.random() * 1000000) + 1;
    developer_build.zip_url = 'http://www.google.com';
    runtime_releases.push(developer_build);
    developer_tools_releases.push(developer_build);
}

for(let i = 0; i < 10; i++) {
    let developer_build = {};
    developer_build.date = Date.now() + Math.floor(Math.random() * 1000000) + 1;            
    developer_build.zip_url = 'http://www.google.com';
    developer_build.total_tests = 100;
    developer_build.tests_passed = Math.floor(Math.random() * 100) + 1;
    developer_build.log_url = 'http://www.yahoo.com';
    developer_build.tests_url = 'http://www.ibm.com';
    runtime_development_builds.push(developer_build);
    developer_tools_development_builds.push(developer_build);
}

builds['runtime_releases'] = runtime_releases;
builds['runtime_development_builds'] = runtime_development_builds;
builds['developer_tools_releases'] = developer_tools_releases;
builds['developer_tools_development_builds'] = developer_tools_development_builds;

/* TEMPORARY CODE - END */


function render_builds(builds, parent) {

    parent.empty();

    builds.forEach(function(build) {

        let date = new Date(build.date);
        let year = date.getUTCFullYear();
        let month = date.getUTCMonth() + 1;
        let day = date.getUTCDate();
        let hour = date.getUTCHours();
        let minute = date.getUTCMinutes();
        
        let date_column = $('<td><span class="table_date">' + year + '-' + add_lead_zero(month) + '-' + add_lead_zero(day) + ', ' + add_lead_zero(hour) + ':' + add_lead_zero(minute) + '</span></td>');
        
        let row = $('<tr></tr>');
        row.append(date_column);
        
        if(build.tests_passed) {
            let tests_column = $('<td><a href="' +  build.tests_url +'" class="tests_passed_link">' + build.tests_passed + ' / ' + build.total_tests + '</a></td>');
            let log_column = $('<td><a href="' + build.log_url + '" class="view_logs_link">View logs</a></td>');
            row.append(tests_column);
            row.append(log_column);
        }
        
        let zip_column = $('<td><a href="' + build.zip_url + '" class="build_download_button">Download (.zip)</a></td>');
        
        row.append(zip_column);

        parent.append(row);

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
        let table_container = $('#' + event.currentTarget.getAttribute('data-table-container-id'));

        let rows = $('tbody tr', table_container).length;
        let delay = 400 + rows * 25;

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

        let table = $(event.currentTarget).closest('table');

        let builds_id = table.data('builds-id');
        let key = event.currentTarget.getAttribute('data-key');
        let descending = !(event.currentTarget.getAttribute('data-descending') == 'true');

        event.currentTarget.setAttribute('data-descending', descending);
        
        sort_builds(builds[builds_id], key, descending);
        render_builds(builds[builds_id], $('tbody', table));

        $('th .table_header_arrow', table).removeClass('table_header_arrow_down table_header_arrow_up');
        $('.table_header_arrow', event.currentTarget).addClass(descending? 'table_header_arrow_down' : 'table_header_arrow_up');

    });



    /* TEMPORARY CODE - START */

    sort_builds(runtime_releases, 'date', true);
    render_builds(runtime_releases, $('table[data-builds-id="runtime_releases"] tbody'));

    sort_builds(runtime_development_builds, 'date', true);
    render_builds(runtime_development_builds, $('table[data-builds-id="runtime_development_builds"] tbody'));

    sort_builds(developer_tools_releases, 'date', true);
    render_builds(developer_tools_releases, $('table[data-builds-id="developer_tools_releases"] tbody'));

    sort_builds(developer_tools_development_builds, 'date', true);
    render_builds(developer_tools_development_builds, $('table[data-builds-id="developer_tools_development_builds"] tbody'));

    /* TEMPORARY CODE - END */
    
});