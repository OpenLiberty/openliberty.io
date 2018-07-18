/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
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

    // Look for guides that contain every search word
    function filter_guides(key, search_value) {
        $('.guide_item').each(function(index, element) {
            
            var guide_item = $(element);
            var title = guide_item.data('title');
            var description = guide_item.data('description');
            var tags = guide_item.data('tags');

            // Split on whitespaces.  Treat consecutive whitespaces as one.
            var tokens = search_value.trim().split(/\s+/);

            // Look for guides that contain all the search words.
            var matches_all_words = false;
            for(var i = 0; i < tokens.length; i++) {
                var word = tokens[i];
                if (((key & title_key) && title.indexOf(word) != -1)
                || ((key & description_key) && description.indexOf(word) != -1)
                || ((key & tags_key) && tags.indexOf(word) != -1)) {
                    // Guide contains one of the search word.
                    // Keep checking this guide if it contains the other
                    // search words.
                    matches_all_words = true;
                } else {
                    // Guide is missing the search word.
                    // mark guide as not a search result.
                    matches_all_words = false;
                    break;
                }
            }

            if(matches_all_words) {
                guide_item.parent().show();
            } else {
                guide_item.parent().hide();
            }
        });
    }

    function processSearch(input_value){
        if(input_value.length == 0) {
            //revert elements to their original state
            $('#guides_microprofile_container').addClass("color_guides_background");
            $('#guides_microprofile_container').removeClass("no_guides_background");
            $('#microprofile_header').show();
            $('#microprofile_subtitle').show();
            $('.mp_guide_column').show();
            $('#additional_header').show();
            $('.guide_column').show();
            $('#guide_counter_title').hide();
        } else {
            if(input_value.indexOf('tag:') === 0) {
                var search_value = input_value.substring(4).trim();
                filter_guides(tags_key, search_value);
            } else {
                filter_guides(title_key | description_key | tags_key, input_value);
            }
            
            var mpGuideVisible = $('.mp_guide_column:visible').size();
            var additionalGuideVisible = $('.guide_column:visible').size();
            var totalGuideVisible = mpGuideVisible + additionalGuideVisible;

            // Hide categories if there are no search results in them 
            if (mpGuideVisible == 0) {
                $('#guides_microprofile_container').removeClass("color_guides_background");
                $('#guides_microprofile_container').addClass("no_guides_background");
                $('#microprofile_header').hide();
            } else {
                $('#guides_microprofile_container').addClass("color_guides_background");
                $('#microprofile_header').show();
            }

            if (additionalGuideVisible == 0) {
                $('#additional_header').hide();
            } else {
                $('#additional_header').show();
            }
            $('#microprofile_subtitle').hide();
            $('#guide_counter_title').show();
            $('#guide_counter_title').text('Total search results (' + totalGuideVisible + ')');
        }        
    }


    $('#guide_search_input').keyup(function(event) {
        var input_value = event.currentTarget.value.toLowerCase();
        processSearch(input_value);        
    });

    $('#guide_search_input').keypress(function(event) {
        if(event.which == 13) { // 13 is the enter key
            var searchInput = $('#guide_search_input').val();
            updateSearchUrl(searchInput);
        }
    });

    var query_string = location.search;
    // Process the url parameters for searching
    if(query_string.length > 0) {
        var parameters = decodeURI(query_string.substring(1)).split('&');
        var search_value = false;
        var search_key = false;
        for(var i = 0; i < parameters.length; i++) {
            if(parameters[i].indexOf('search=') === 0) {
                search_value = parameters[i].substring(7);
            } else if (parameters[i].indexOf('key=') === 0) {
                search_key = parameters[i].substring(4);
            }
        }
        if(search_value) {
            var input_text = search_key? search_key + ': ' + search_value : search_value;
            $('#guide_search_input').val(input_text).keyup();
        }
    }
    // If the search field is still populated from returning to this page, process the search value
    else if($('#guide_search_input').val()){
        var input_value = $('#guide_search_input').val().toLowerCase();
        processSearch(input_value);
    }


    function updateSearchUrl(value) {
        if(! value) {
            // Remove query string because search text is empty
            location.href = [location.protocol, '//', location.host, location.pathname].join('');
        } else {
            // Handle various search functions
            _processSearchText(value);
        }
    }

    function _processSearchText(value) {
        // We support searching with prefex
        // 1.  tag: <tag text>
        // 2.  Free form text
        if(value.startsWith("tag:")) {
            var searchTextWithoutTag = value.substring(value.indexOf(':') + 1);
            searchTextWithoutTag = searchTextWithoutTag.trim();
            location.search = "search=" + encodeURIComponent(searchTextWithoutTag) + "&key=tag";

        } else {
            value = value.trim();
            location.search = "search=" + encodeURIComponent(value);
        }
    }

    // Create popover when search bar is focused
    $("#guide_search_input").popover({
        container: "#guides_search_container",
        delay: {
            show: "520"
        },
        content: function() {
            return $("#popover_content").html();
        },
        trigger: "focus"
    });

    // Click buttons to fill search bar
    $("#guides_search_container").on('click', '.tag_button', function() {
        var input_value = 'tag: ' + $(this).html()
        $("#guide_search_input").val(input_value);
        $(".tag_button").removeClass("hidden");
        $(this).addClass("hidden");
        $("#guide_search_input").focus();
        processSearch(input_value);
    });
});