let builds = [];

let runtime_releases = [];
let runtime_development_builds = [];
let developer_tools_releases = [];
let developer_tools_development_builds = [];

let builds_url = '/api/builds/data';

function render_builds(builds, parent) {

    parent.empty();

    let analytics_class_name = 'link_' + parent.parent().data('builds-id');

    builds.forEach(function(build) {

        let date = new Date(build.date);
        let year = date.getUTCFullYear();
        let month = date.getUTCMonth();
        let day = date.getUTCDate();
        let hour = date.getUTCHours();
        let minute = date.getUTCMinutes();

        let date_column = $('<td><span class="table_date">' + year + '-' + add_lead_zero(month) + '-' + add_lead_zero(day) + ', ' + add_lead_zero(hour) + ':' + add_lead_zero(minute) + '</span></td>');
       
        let row = $('<tr></tr>');
        row.append(date_column);
        
        if(!parent.hasClass('release_table_body')) {
            let tests_column = $('<td><a href="' +  build.tests_log +'" target="new" class="' + analytics_class_name + ' skip_outbound_link_analytics tests_passed_link">' + build.test_passed + ' / ' + build.total_tests + '</a></td>');
            let log_column = $('<td><a href="' + build.build_log + '" target="new" class="' + analytics_class_name + ' skip_outbound_link_analytics view_logs_link">View logs</a></td>');
            row.append(tests_column);
            row.append(log_column);
        }
        
        let zip_column = $('<td><a href="' + build.driver_location + '" class="' + analytics_class_name + ' skip_outbound_link_analytics build_download_button">Download (.zip)</a></td>');
        
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



    $.ajax({
        url: builds_url
    }).done(function(data) {

        $('#runtime_download_link').attr("href", data.latest_releases.runtime.driver_location);
        $('#eclipse_developer_tools_download_link').attr("href", data.latest_releases.tools.driver_location);

        runtime_releases = formatBuilds(data.builds.runtime_releases);
        developer_tools_releases = formatBuilds(data.builds.tools_releases);
        runtime_development_builds = formatBuilds(data.builds.runtime_nightly_builds);
        developer_tools_development_builds = formatBuilds(data.builds.tools_nightly_builds);

        function formatBuilds(builds_from_response) {
            for(let i = 0; i < builds_from_response.length; i++) {
                let date_string = builds_from_response[i].date_time;
                let date = new Date(date_string.substr(0, 4), date_string.substr(5, 2), date_string.substr(8, 2), date_string.substr(11, 2), date_string.substr(13, 2));
                builds_from_response[i].date = date.getTime();
            }
            return builds_from_response;
        }

        builds['runtime_releases'] = runtime_releases;
        builds['runtime_development_builds'] = runtime_development_builds;
        builds['developer_tools_releases'] = developer_tools_releases;
        builds['developer_tools_development_builds'] = developer_tools_development_builds;

        sort_builds(runtime_releases, 'date', true);
        render_builds(runtime_releases, $('table[data-builds-id="runtime_releases"] tbody'));

        sort_builds(runtime_development_builds, 'date', true);
        render_builds(runtime_development_builds, $('table[data-builds-id="runtime_development_builds"] tbody'));

        sort_builds(developer_tools_releases, 'date', true);
        render_builds(developer_tools_releases, $('table[data-builds-id="developer_tools_releases"] tbody'));

        sort_builds(developer_tools_development_builds, 'date', true);
        render_builds(developer_tools_development_builds, $('table[data-builds-id="developer_tools_development_builds"] tbody'));

    });
    
});
