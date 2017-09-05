$(document).ready(function() {

    let title_key = 1;
    let description_key = 2;
    let tags_key = 4;


    function filter_guides(key, search_value) {
        $('.guide_item').each(function(index, element) {
            
            let guide_item = $(element);
            let title = guide_item.data('title');
            let description = guide_item.data('description');
            let tags = guide_item.data('tags');

            if (((key & title_key) && title.indexOf(search_value) != -1)
             || ((key & description_key) && description.indexOf(search_value) != -1)
             || ((key & tags_key) && tags.indexOf(search_value) != -1)) {
                guide_item.parent().removeClass('hidden');
            } else {
                guide_item.parent().addClass('hidden');
            }

        });
    }

    $('#guide_search_input').keyup(function(event) {
        let input_value = event.currentTarget.value.toLowerCase();
        if(input_value.length == 0) {
            $('.guide_column').removeClass('hidden');
        } else {
            if(input_value.startsWith('tag:')) {
                let search_value = input_value.substring(4).trim();
                filter_guides(tags_key, search_value);
            } else {
                filter_guides(title_key | description_key | tags_key, input_value);
            }
        }
    });

    let query_string = location.search;
    if(query_string.length > 0) {
        let parameters = decodeURI(query_string.substring(1)).split('&');
        let search_value = false;
        let search_key = false;
        for(let i = 0; i < parameters.length; i++) {

            if(parameters[i].startsWith('search=')) {
                search_value = parameters[i].substring(7);
            } else if (parameters[i].startsWith('key=')) {
                search_key = parameters[i].substring(4);
            }
        }
        if(search_value) {
            let input_text = search_key? search_key + ': ' + search_value : search_value;
            $('#guide_search_input').val(input_text).keyup();
        }
    }
    
});