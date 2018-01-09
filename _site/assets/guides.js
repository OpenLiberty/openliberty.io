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


$(document).ready(function() {

    var title_key = 1;
    var description_key = 2;
    var tags_key = 4;

    function filter_guides(key, search_value) {
        $('.guide_item').each(function(index, element) {
            
            var guide_item = $(element);
            var title = guide_item.data('title');
            var description = guide_item.data('description');
            var tags = guide_item.data('tags');

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
        var input_value = event.currentTarget.value.toLowerCase();
        if(input_value.length == 0) {
            $('.guide_column').removeClass('hidden');
            $('#guide_counter_title').text('All Open Liberty guides (' + $('.guide_column').size() + ')');
        } else {
            if(input_value.startsWith('tag:')) {
                var search_value = input_value.substring(4).trim();
                filter_guides(tags_key, search_value);
            } else {
                filter_guides(title_key | description_key | tags_key, input_value);
            }
            $('#guide_counter_title').text('Search results (' + $('.guide_column:visible').size() + ')');
        }
    });


    var query_string = location.search;
    if(query_string.length > 0) {
        var parameters = decodeURI(query_string.substring(1)).split('&');
        var search_value = false;
        var search_key = false;
        for(var i = 0; i < parameters.length; i++) {
            if(parameters[i].startsWith('search=')) {
                search_value = parameters[i].substring(7);
            } else if (parameters[i].startsWith('key=')) {
                search_key = parameters[i].substring(4);
            }
        }
        if(search_value) {
            var input_text = search_key? search_key + ': ' + search_value : search_value;
            $('#guide_search_input').val(input_text).keyup();
        }
    }
    
});
