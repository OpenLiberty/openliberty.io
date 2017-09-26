var latest_release_url = '/api/builds/latest';

$(document).ready(function() {

    $.ajax({
        url: latest_release_url
    }).done(function(data) {

        $('#download_link').attr('href', data.runtime.driver_location);
        $('#download_link_size_label').text('(' + Math.floor(data.runtime.size_in_bytes / 1048576) + ' MB)');

    });
});