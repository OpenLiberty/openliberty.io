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
    var num_of_additional_microprofile_guides = 0;

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
                // Make sure we are not hiding categories when there are visible guide cards
                guide_item.closest('.container').show();
            } else {
                guide_item.parent().hide();
            }
        });
    }

    // Change the numbers on the page based on the search results
    function updateTotals(no_search_text) {

        // Change the label for how many guides are visible to help indicate if the view is filtered
        var count_label = ' search results';
        if(no_search_text !== undefined && no_search_text) {
            count_label = ' guides';
            $('#microprofile_more_guides_button b').text(num_of_additional_microprofile_guides + ' additional MicroProfile Guides');
            showAllCategories();
        }

        // Count the number of visible guides to calculate the total number
        var numBasicResults = $('#guides_basic_container .guide_column').children(':visible').length;
        var numMPResults = $('#guides_microprofile_container .guide_column').children(':visible').length;
        var numMPEssentialResults = $('#guides_microprofile_container .essential .guide_column').children(':visible').length;
        var numAdditionalResults = $('#guides_additional_container .guide_column').children(':visible').length;
        hideEmptyCategories(
            numBasicResults == 0, 
            numMPResults == 0,
            numMPEssentialResults == 0, 
            numAdditionalResults == 0
        );

        // Change the total search results in each categorys' banner    
        $('#guides_basic_banner .total_guide_count b').text(numBasicResults + count_label);
        $('#guides_microprofile_banner .total_guide_count b').text(numMPResults + count_label);
        $('#guides_additional_banner .total_guide_count b').text(numAdditionalResults + count_label);

        // Change essential search result number
        var numBasicEssentialResults = $('#guides_basic_container .essential .guide_column').children(':visible').length;
        var numMPEssentialResults = $('#guides_microprofile_container .essential .guide_column').children(':visible').length;
        $('#guides_basic_container .subtitle .essential').text(numBasicEssentialResults + ' essentials');
        $('#guides_microprofile_container .subtitle .essential').text(numMPEssentialResults + ' essentials');

        // Change the additional MicroProfile search result number
        var numMPMoreResults = $('#microprofile_more_guides .guide_column').children(':visible').length;
        $('#microprofile_more_guides_button b').text(numMPMoreResults + ' additional MicroProfile Guides');
    }

    function showAllCategories() {
        $('.basic_section').show();
        $('.microprofile_section').show();
        $('.more_section').show();
    }

    function hideEmptyCategories(hideBasic, hideMP, hideMPEssentials, hideAdditional) {
        if(hideBasic) {
            $('.basic_section').hide();
        } else {
            $('.basic_section').show();
        }
        if(hideMP) {
            $('.microprofile_section').hide();
        } else {
            $('.microprofile_section').show();
        }
        // hide unnecessary labels when there are 0 essential MP guides
        if(hideMPEssentials) {
            $('.extraMP').hide();
        } else {
            $('.extraMP').show();
        }
        if(hideAdditional) {
            $('.more_section').hide();
        } else {
            $('.more_section').show();
        }
        if(hideBasic && hideMP && hideAdditional) {
            // All categories are hidden
            // Show no results
            $('.no_results_section').show();

            var search_text = $('#guide_search_input').val();
            $('.search_term').text('"' + search_text + '"');
        } else {
            $('.no_results_section').hide();
        }
    }

    // Show everything on the guides page
    function defaultView() {
        $('.guide_column').show();
        var no_search_text = true;
        updateTotals(no_search_text);
        collapseMicroProfileAdditionalGuides();
    }

    function expandMicroProfileAdditionalGuides() {
        // Expand the section with more microprofile guides
        if(! $('#microprofile_more_guides').is('.collapse.in')) {
            $('#microprofile_more_guides_button').click();
        }
    }

    function collapseMicroProfileAdditionalGuides() {
        // Collapse the section with more microprofile guides
        if($('#microprofile_more_guides').is('.collapse.in')) {
            $('#microprofile_more_guides_button').click();
        }
    }

    function processSearch(input_value) {
        if(input_value.length == 0) {
            defaultView();
        } else {
            if(input_value.indexOf('tag:') === 0) {
                var search_value = input_value.substring(4).trim();
                filter_guides(tags_key, search_value);
            } else {
                filter_guides(title_key | description_key | tags_key, input_value);
            }
            expandMicroProfileAdditionalGuides();
            updateTotals();
        }        
    }


    $('#guide_search_input').keyup(function(event) {
        var input_value = event.currentTarget.value.toLowerCase();
        processSearch(input_value);
    });

    $(window).on('popstate', function(){
        var input_value = location.search;
        query_string = input_value.substring(8);
        document.getElementById("guide_search_input").value = query_string;
        processSearch(query_string);
    });

    // clear search input when x button clicked
    $('.clear_btn').on('click', function(){
        $('#guide_search_input').val('');
        var searchInput = $('#guide_search_input').val();
        updateSearchUrl(searchInput);
        processSearch(searchInput);        
        showAllCategories();
    });

    $('#guide_search_input').keypress(function(event) {
        if(event.which == 13) { // 13 is the enter key
            var searchInput = $('#guide_search_input').val();
            updateSearchUrl(searchInput);
        }
    });

    function updateSearchUrl(value) {
        if(! value) {
            // Remove query string because search text is empty
            search_value = [location.protocol, '//', location.host, location.pathname].join('');
            history.pushState(null, "", search_value);
        } else {
            // Handle various search functions
            _processSearchText(value);
        }
    }

    function _processSearchText(value) {
        // We support searching with prefex
        // 1.  tag: <tag text>
        // 2.  Free form text
        if(value.startsWith('tag:')) {
            var searchTextWithoutTag = value.substring(value.indexOf(':') + 1);
            searchTextWithoutTag = searchTextWithoutTag.trim();
            search_value = '?search=' + encodeURIComponent(searchTextWithoutTag) + '&key=tag';
            history.pushState(null, "", search_value);
            document.activeElement.blur()
        } else {
            value = value.trim();
            search_value = '?search=' + encodeURIComponent(value);
            history.pushState(null, "", search_value);
            document.activeElement.blur()
        }
    }

    function getTotal_additional_MP_guides() {
        var label = $('#microprofile_more_guides_button b').text();
        return label.split(' ')[0];
    }

    function init() {

        num_of_additional_microprofile_guides = getTotal_additional_MP_guides();

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
    }

    // Create popover when search bar is focused
    $('#guide_search_input').popover({
        container: '#guides_search_container',
        delay: {
            show: '520'
        },
        content: function() {
            return $('#popover_content').html();
        },
        trigger: 'focus'
    });
    
    $('#back_to_guides_button').on('click', function() {
        $('#guide_search_input').val('');
        defaultView();
        // TODO: Need to clear any `?search=*` from the URL
    });

    // Click buttons to fill search bar
    $('#guides_search_container').on('click', '.tag_button', function() {
        var input_value = 'tag: ' + $(this).html();
        $('#guide_search_input').val(input_value);
        $('.tag_button').removeClass('hidden');
        $(this).addClass('hidden');
        $('#guide_search_input').focus();
        processSearch(input_value);
    });

    // Button to hide and show additional microprofile guides
    $('#microprofile_more_guides_button').on('click', function(e) {
        e.preventDefault();
        $('#microprofile_more_guides').collapse('toggle');
    });

    // Change icon when collapse is done
    $('#microprofile_more_guides').on('hidden.bs.collapse', function () {
        $('#microprofile_more_guides_icon').text('+');
    });

    // Change icon when collapse is done
    $('#microprofile_more_guides').on('shown.bs.collapse', function () {
        $('#microprofile_more_guides_icon').text('-');
    });

    init();
});