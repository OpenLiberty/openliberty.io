var builds = [];

var runtime_releases = [];
var runtime_development_builds = [];
var developer_tools_releases = [];
var developer_tools_development_builds = [];

var builds_url = '/api/builds/data';

function render_builds(builds, parent) {

    parent.empty();

    var analytics_class_name = 'link_' + parent.parent().data('builds-id');

    builds.forEach(function(build) {

        var row = $('<tr></tr>');        
        
        if(parent.hasClass('key_by_version')) {
            var version_column = $('<td><span class="table_date">' + build.version + '</span></td>');
            row.append(version_column);

        } else {
            var date = new Date(build.date);
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var hour = date.getHours();
            var minute = date.getMinutes();
            var date_column = $('<td><span class="table_date">' + year + '-' + add_lead_zero(month) + '-' + add_lead_zero(day) + ', ' + add_lead_zero(hour) + ':' + add_lead_zero(minute) + '</span></td>');
            row.append(date_column);
        }
        
        if(!parent.hasClass('release_table_body')) {
            var tests_column = $('<td><a href="' +  build.tests_log +'" target="new" class="' + analytics_class_name + ' skip_outbound_link_analytics tests_passed_link">' + build.test_passed + ' / ' + build.total_tests + '</a></td>');
            var log_column = $('<td><a href="' + build.build_log + '" target="new" class="' + analytics_class_name + ' skip_outbound_link_analytics view_logs_link">View logs</a></td>');
            row.append(tests_column);
            row.append(log_column);
        }
        
        var zip_column = $('<td><a href="' + build.driver_location + '" class="' + analytics_class_name + ' skip_outbound_link_analytics build_download_button">Download (.zip)</a></td>');
        
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

        $('th .table_header_arrow', table).removeClass('table_header_arrow_down table_header_arrow_up');
        $('.table_header_arrow', event.currentTarget).addClass(descending? 'table_header_arrow_down' : 'table_header_arrow_up');

    });



    $.ajax({
        url: 'http://localhost:4000'
    }).done(function(data) {

        data = JSON.parse('{"latest_releases":{"runtime":{"test_passed":"6126","total_tests":"6126","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2017-09-27_1951/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2017-09-27_1951/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2017-09-27_1951/openliberty-17.0.0.3.zip","version":"17.0.0.3","date_time":"2017-09-27_1951","size_in_bytes":"79745618"},"tools":{"driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/release/2017-09-21_1325/open-wdt-update-site_0.0.1-RC.zip","date_time":"2017-09-21_1325","size_in_bytes":"4539642"}},"builds":{"runtime_releases":[{"test_passed":"6126","total_tests":"6126","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2017-09-27_1951/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2017-09-27_1951/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/release/2017-09-27_1951/openliberty-17.0.0.3.zip","version":"17.0.0.3","date_time":"2017-09-27_1951","size_in_bytes":"79745618"}],"runtime_nightly_builds":[{"test_passed":"6126","total_tests":"6126","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-18_1532/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-18_1532/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-18_1532/openliberty-2017.9.0.0-201709181525.zip","version":"2017.9.0.0-201709181532","date_time":"2017-09-18_1532","size_in_bytes":"88185263"},{"test_passed":"6126","total_tests":"6126","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-18_2025/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-18_2025/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-18_2025/openliberty-2017.9.0.0-201709182018.zip","version":"2017.9.0.0-201709182025","date_time":"2017-09-18_2025","size_in_bytes":"88183741"},{"test_passed":"6126","total_tests":"6126","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-19_1408/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-19_1408/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-19_1408/openliberty-2017.9.0.0-201709191401.zip","version":"2017.9.0.0-201709191408","date_time":"2017-09-19_1408","size_in_bytes":"88185380"},{"test_passed":"6126","total_tests":"6126","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-20_1559/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-20_1559/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-20_1559/openliberty-2017.9.0.0-201709201552.zip","version":"2017.9.0.0-201709201559","date_time":"2017-09-20_1559","size_in_bytes":"88194617"},{"test_passed":"6133","total_tests":"6133","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-22_1358/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-22_1358/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-22_1358/openliberty-17.0.0.3-201709221352.zip","version":"17.0.0.3-201709221358","date_time":"2017-09-22_1358","size_in_bytes":"92595322"},{"test_passed":"6139","total_tests":"6139","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-26_1344/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-26_1344/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-26_1344/openliberty-17.0.0.3-201709261338.zip","version":"17.0.0.3-201709261344","date_time":"2017-09-26_1344","size_in_bytes":"92730698"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-26_2025/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-26_2025/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-26_2025/openliberty-17.0.0.3-201709262018.zip","version":"17.0.0.3-201709262025","date_time":"2017-09-26_2025","size_in_bytes":"79740569"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_0341/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_0341/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_0341/openliberty-17.0.0.3-201709270334.zip","version":"17.0.0.3-201709270341","date_time":"2017-09-27_0341","size_in_bytes":"79740937"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_0750/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_0750/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_0750/openliberty-17.0.0.3-201709270743.zip","version":"17.0.0.3-201709270750","date_time":"2017-09-27_0750","size_in_bytes":"79740729"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_1117/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_1117/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_1117/openliberty-17.0.0.3-201709271109.zip","version":"17.0.0.3-201709271117","date_time":"2017-09-27_1117","size_in_bytes":"79741046"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_1344/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_1344/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_1344/openliberty-17.0.0.3-201709271337.zip","version":"17.0.0.3-201709271344","date_time":"2017-09-27_1344","size_in_bytes":"79741074"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_2347/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_2347/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-27_2347/openliberty-17.0.0.3-201709272339.zip","version":"17.0.0.3-201709272347","date_time":"2017-09-27_2347","size_in_bytes":"79741076"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_0159/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_0159/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_0159/openliberty-17.0.0.3-201709280151.zip","version":"17.0.0.3-201709280159","date_time":"2017-09-28_0159","size_in_bytes":"79741533"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_0848/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_0848/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_0848/openliberty-17.0.0.3-201709280841.zip","version":"17.0.0.3-201709280848","date_time":"2017-09-28_0848","size_in_bytes":"79741332"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_1408/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_1408/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_1408/openliberty-17.0.0.3-201709281401.zip","version":"17.0.0.3-201709281408","date_time":"2017-09-28_1408","size_in_bytes":"79740604"},{"test_passed":"6147","total_tests":"6147","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_2051/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_2051/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-28_2051/openliberty-17.0.0.3-201709282043.zip","version":"17.0.0.3-201709282051","date_time":"2017-09-28_2051","size_in_bytes":"79740088"},{"test_passed":"6150","total_tests":"6150","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_0157/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_0157/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_0157/openliberty-17.0.0.3-201709290150.zip","version":"17.0.0.3-201709290157","date_time":"2017-09-29_0157","size_in_bytes":"79747728"},{"test_passed":"6150","total_tests":"6150","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_0749/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_0749/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_0749/openliberty-17.0.0.3-201709290742.zip","version":"17.0.0.3-201709290749","date_time":"2017-09-29_0749","size_in_bytes":"79747615"},{"test_passed":"6150","total_tests":"6150","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_1350/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_1350/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_1350/openliberty-17.0.0.3-201709291343.zip","version":"17.0.0.3-201709291350","date_time":"2017-09-29_1350","size_in_bytes":"79761011"},{"test_passed":"6150","total_tests":"6150","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_1944/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_1944/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-29_1944/openliberty-17.0.0.3-201709291937.zip","version":"17.0.0.3-201709291944","date_time":"2017-09-29_1944","size_in_bytes":"79760295"},{"test_passed":"6150","total_tests":"6150","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_0155/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_0155/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_0155/openliberty-17.0.0.3-201709300148.zip","version":"17.0.0.3-201709300155","date_time":"2017-09-30_0155","size_in_bytes":"79761473"},{"test_passed":"6150","total_tests":"6150","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_0749/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_0749/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_0749/openliberty-17.0.0.3-201709300741.zip","version":"17.0.0.3-201709300749","date_time":"2017-09-30_0749","size_in_bytes":"79762044"},{"test_passed":"6150","total_tests":"6150","tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_1346/open-liberty.unitTest.results.zip","build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_1346/gradle.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/2017-09-30_1346/openliberty-17.0.0.3-201709301338.zip","version":"17.0.0.3-201709301346","date_time":"2017-09-30_1346","size_in_bytes":"79910630"}],"tools_releases":[{"driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/release/2017-09-21_1325/open-wdt-update-site_0.0.1-RC.zip","date_time":"2017-09-21_1325","size_in_bytes":"4539642"}],"tools_nightly_builds":[{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-16_0010/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-16_0010/open-wdt-update-site_0.0.1.v2017-09-16_0010.zip","test_passed":107,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-16_0010/test_results.html","date_time":"2017-09-16_0010","size_in_bytes":"4536232"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-17_0010/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-17_0010/open-wdt-update-site_0.0.1.v2017-09-17_0010.zip","test_passed":108,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-17_0010/test_results.html","date_time":"2017-09-17_0010","size_in_bytes":"4535688"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-18_0010/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-18_0010/open-wdt-update-site_0.0.1.v2017-09-18_0010.zip","test_passed":108,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-18_0010/test_results.html","date_time":"2017-09-18_0010","size_in_bytes":"4535025"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-19_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-19_0030/open-wdt-update-site_0.0.1.v2017-09-19_0030.zip","test_passed":108,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-19_0030/test_results.html","date_time":"2017-09-19_0030","size_in_bytes":"4532062"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-21_1325/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-21_1325/open-wdt-update-site_0.0.1.v2017-09-21_1325.zip","test_passed":101,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-21_1325/test_results.html","date_time":"2017-09-21_1325","size_in_bytes":"4539642"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-22_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-22_0030/open-wdt-update-site_0.0.1.v2017-09-22_0030.zip","test_passed":102,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-22_0030/test_results.html","date_time":"2017-09-22_0030","size_in_bytes":"4543787"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-23_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-23_0030/open-wdt-update-site_0.0.1.v2017-09-23_0030.zip","test_passed":102,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-23_0030/test_results.html","date_time":"2017-09-23_0030","size_in_bytes":"4535896"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-24_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-24_0030/open-wdt-update-site_0.0.1.v2017-09-24_0030.zip","test_passed":101,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-24_0030/test_results.html","date_time":"2017-09-24_0030","size_in_bytes":"4535767"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-25_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-25_0030/open-wdt-update-site_0.0.1.v2017-09-25_0030.zip","test_passed":101,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-25_0030/test_results.html","date_time":"2017-09-25_0030","size_in_bytes":"4539028"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-26_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-26_0030/open-wdt-update-site_0.0.1.v2017-09-26_0030.zip","test_passed":100,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-26_0030/test_results.html","date_time":"2017-09-26_0030","size_in_bytes":"4535690"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-27_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-27_0030/open-wdt-update-site_0.0.1.v2017-09-27_0030.zip","test_passed":103,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-27_0030/test_results.html","date_time":"2017-09-27_0030","size_in_bytes":"4531986"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-28_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-28_0030/openlibertytools-0.0.1.v2017-09-28_0030.zip","test_passed":103,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-28_0030/test_results.html","date_time":"2017-09-28_0030","size_in_bytes":"4546737"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-29_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-29_0030/openlibertytools-0.0.1.v2017-09-29_0030.zip","test_passed":103,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-29_0030/test_results.html","date_time":"2017-09-29_0030","size_in_bytes":"4547108"},{"build_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-30_0030/build.log","driver_location":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-30_0030/openlibertytools-0.0.1.v2017-09-30_0030.zip","test_passed":102,"total_tests":109,"tests_log":"https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/tools/nightly/2017-09-30_0030/test_results.html","date_time":"2017-09-30_0030","size_in_bytes":"4546466"}]}}');
        
        $('#runtime_download_button_version').text(data.latest_releases.runtime.version);     

        $('#runtime_download_link').attr('href', data.latest_releases.runtime.driver_location);
        $('#eclipse_developer_tools_download_link').attr('href', data.latest_releases.tools.driver_location);

        runtime_releases = formatBuilds(data.builds.runtime_releases);
        developer_tools_releases = formatBuilds(data.builds.tools_releases);
        runtime_development_builds = formatBuilds(data.builds.runtime_nightly_builds);
        developer_tools_development_builds = formatBuilds(data.builds.tools_nightly_builds);

        function formatBuilds(builds_from_response) {
            for(var i = 0; i < builds_from_response.length; i++) {
                var date_string = builds_from_response[i].date_time;
                var date = new Date(date_string.substr(0, 4), date_string.substr(5, 2), date_string.substr(8, 2), date_string.substr(11, 2), date_string.substr(13, 2));
                builds_from_response[i].date = date.getTime();
            }
            return builds_from_response;
        }

        builds['runtime_releases'] = runtime_releases;
        builds['runtime_development_builds'] = runtime_development_builds;
        builds['developer_tools_releases'] = developer_tools_releases;
        builds['developer_tools_development_builds'] = developer_tools_development_builds;

        sort_builds(runtime_releases, 'version', true);
        render_builds(runtime_releases, $('table[data-builds-id="runtime_releases"] tbody'));

        sort_builds(runtime_development_builds, 'date', true);
        render_builds(runtime_development_builds, $('table[data-builds-id="runtime_development_builds"] tbody'));

        sort_builds(developer_tools_releases, 'date', true);
        render_builds(developer_tools_releases, $('table[data-builds-id="developer_tools_releases"] tbody'));

        sort_builds(developer_tools_development_builds, 'date', true);
        render_builds(developer_tools_development_builds, $('table[data-builds-id="developer_tools_development_builds"] tbody'));

    });
    
});
