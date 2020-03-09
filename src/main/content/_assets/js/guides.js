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

    // Remove previous TOC section highlighted and highlight correct step
    function updateTOCHighlighting(id) {
        $('.liSelected').removeClass('liSelected');
        var anchor = $("#toc_container a[href='#" + id + "']");
        anchor.parent().addClass('liSelected');
    }

    // Find the first subcategory header that is visible in the viewport and return the id.
    function getMostVisible($elements) {
        var topBorder = $('#guides_information_container').outerHeight(true) + $('nav.navbar.navbar-default').outerHeight(true);
        var scrolledToBottom = $(window).scrollTop() + $(window).height() == $(document).height();
        if ($(window).scrollTop() <= topBorder) {
            // Header section is visible, don't look for subcategory headers.
            id = " ";
        }
        else {
            var visibleSectionCount = 0;
            var lastDiv = $elements.last();
            highlightElement = $(location.hash);
            // make sure last section gets highlighted (since it will never be first visible subcategory header)
            if (scrolledToBottom) {
                highlightElement = lastDiv;
            }
            else {
            // iterate over subcategory headers and get first on screen
                $elements.each(function(index, element) {
                    var visiblePx = getVisibleHeightPx($(this), $(window).height());
                    // check if element is on screen
                    if (visiblePx > 0) {
                        if (visibleSectionCount == 0) {
                            // found first subcategory header that is visible on screen
                            highlightElement = this;
                        }
                        visibleSectionCount += 1;
                    }
                })
            }
            id = $elements.filter(highlightElement).attr('id');
        }

        return id;
    }

    function getVisibleHeightPx($element, viewportHeight) {
        var rect = $element.get(0).getBoundingClientRect(),
            height = rect.bottom - rect.top,
            visible = {
                top: rect.top >= 0 && rect.top < viewportHeight,
                bottom: rect.bottom > 0 && rect.bottom < viewportHeight
            },
            visiblePx = 0;

        if (visible.top && visible.bottom) {
            // Whole element is visible
            visiblePx = height;
        } else if (visible.top) {
            visiblePx = viewportHeight - rect.top;
        } else if (visible.bottom) {
            visiblePx = rect.bottom;
        } else if (height > viewportHeight && rect.top < 0) {
            var absTop = Math.abs(rect.top);

            if (absTop < height) {
                // Part of the element is visible
                visiblePx = height - absTop;
            }
        }

        return visiblePx;
    }

    function handleSectionChanging(event){
        var sections = $('.guide_subcategory_title');
        // Get the id of the section most in view
        var id = getMostVisible(sections);
        if (id !== " ") {
            var windowHash = window.location.hash;
            var scrolledToHash = id === "" ? id : '#' + id;            
            if (windowHash !== scrolledToHash) {
                // Update the URL hash with new section we scrolled into....
                var currentPath = window.location.pathname;
                var newPath = currentPath.substring(currentPath.lastIndexOf('/')+1) + scrolledToHash;
            }
        }
        else {
            newPath = id;
        }
        // add hash to url and update TOC highlighting
        history.replaceState(null, null, newPath);
        updateTOCHighlighting(id);
    }

    $(window).on('scroll', function(event) {
        // make toc fixed once you scroll past header (281px)
        var isPositionFixed = ($('#toc_column').css('position') == 'fixed');
        var navbar_height = getVisibleHeightPx($('nav.navbar.navbar-default'), $(window).height());
        var banner_height = getVisibleHeightPx($('#guides_information_container'), $(window).height());
        var top_section_height = navbar_height + banner_height;

        if ($(this).scrollTop() > 281){ 
            $('#toc_container').css({'height': 'calc(100vh)'});
            if (!isPositionFixed) {
                $('#toc_column').css({'position': 'fixed', 'top': '0px'});
            }
        }
        if ($(this).scrollTop() < 281){
            $('#toc_container').css({'height': 'calc(100vh - ' + top_section_height + 'px)'});
            if (isPositionFixed){
                $('#toc_column').css({'position': 'static', 'top': '0px'});
            }
        } 

        handleSectionChanging(event);
    });

    $(document).on('click','#toc_container a',function(e) {
        var hash = $(this).attr('href').replace("#", "");
        updateTOCHighlighting(hash);
    });


    var title_key = 1;
    var description_key = 2;
    var tags_key = 4;
    var search_term_key = 8;
    var num_of_additional_microprofile_guides = 0;

    // Read tags from json file and add tags to data-tags attribute to make tags searchable
    function getTags(callback) {
        $.getJSON( "../../guides/guides-common/guide_tags.json", function(data) {
            $.each(data.guide_tags, function(i, tag) {
                // Check if tag has additional search terms to add to data-tags attribute
                search_terms_string = "";
                if (tag.additional_search_terms) {
                    if (Array.isArray(tag.additional_search_terms)) {
                        tag.additional_search_terms.forEach(function(search_term) {
                            search_terms_string += " " + search_term;
                        })
                    }
                    else {
                        search_terms_string += " " + tag.additional_search_terms;
                    }
                }
                tag_name = tag.name + search_terms_string;

                $(".guide_item").each(function(j, guide_item) {
                    project_id = $(this).attr('href').replace("/guides/", "").replace(".html", "");
                    // Add tag to data-tags attribute if the guide's project id is in the array for that tag
                    if (tag.guides.indexOf(project_id) > -1) {
                        if ($(this).data('tags')) {
                            $(this).data("tags", $(this).data("tags") + " " + tag_name.toLowerCase());
                        }
                        else {
                            $(this).data("tags", tag_name.toLowerCase());
                        }
                    }
                });
            });
            callback();
        });
    }

    // move guide cards to correct subcategories
    function sortGuides(subcategory, guideList) {
        // iterate over array of guides from json file
        $.each(guideList, function(index, guide) {
            // look for guide card that matches the guide's projectid from the array
            var guide_card = $(".guide_item[href='/guides/" + guide + ".html']");
            // move guide card to div with class that matches subcategory
            guide_card.parent().removeClass("hidden").appendTo("#" + subcategory + "_row");
        });
    }

    // Read guide categories from json file and
    function getCategories(callback) {
        $.getJSON( "../../guides/guides-common/guide_categories.json", function(data) {
            $.each(data, function(i, category) {
                // add categories to TOC 
                $("#toc_column > #toc_container > .sectlevel1").append('<div id="toc_separator"></div><h1 class="toc_title">' + category.category_name + '</h1>');
                // create header for each category
                $("#guides_container").append('<h3 class="guide_category_title">' + category.title + '</h3>');
                $.each(category.subcategories, function(j, subcategory) {
                    // make lowercase, replace spaces with underscores
                    subcategory_class = subcategory.subcategory.toLowerCase().replace(/ /g,"_");
                    // add subcategories to TOC
                    $("#toc_column > #toc_container > .sectlevel1").append('<li><a href="#' + subcategory_class + '">' + subcategory.subcategory + '</a></li>');
                    // create header and div for each subcategory
                    $("#guides_container").append('<div id="' + subcategory_class + '_section" class="guide_subcategory_section"><h4 id="' + subcategory_class + '" class="guide_subcategory_title">' + subcategory.subcategory + '</h4><div class="row guide_subcategory_row" id="' + subcategory_class +'_row"></div></div>');

                    sortGuides(subcategory_class, subcategory.guides);

                });
            });
            callback();
        });
    }
    
    // Look for guides that contain every search word
    function filter_guides(key, search_value) {
        $('.guide_item').each(function(index, element) {
            var guide_item = $(element);
            var title = guide_item.data('title');
            var description = guide_item.data('description');
            var tags = guide_item.data('tags');
            var search_terms = guide_item.data('search-keywords');
            // Split on whitespaces.  Treat consecutive whitespaces as one.
            var tokens = search_value.trim().split(/\s+/);
            // Look for guides that contain all the search words.
            var matches_all_words = false;
            for(var i = 0; i < tokens.length; i++) {
                var word = tokens[i];
                if (((key & title_key) && title.indexOf(word) != -1)
                || ((key & description_key) && description.indexOf(word) != -1)
                || ((key & tags_key) && tags.indexOf(word) != -1)
                || ((key & search_term_key) && search_terms.indexOf(word) != -1)) {
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
            $('#additional_microprofile_guides').text(num_of_additional_microprofile_guides + ' additional MicroProfile Guides');
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
        $('#additional_microprofile_guides').text(numMPMoreResults + ' additional MicroProfile Guides');
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
    }

    function processSearch(input_value) {
        if(input_value.length == 0) {
            defaultView();
        } else {
            if(input_value.indexOf('tag:') === 0) {
                var search_value = input_value.substring(4).trim();
                filter_guides(tags_key, search_value);
            } else {
                filter_guides(title_key | description_key | tags_key | search_term_key, input_value);
            }
            updateTotals();
        }        
    }


    $('#guide_search_input').on("keyup", function(event) {
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

    $('#guide_search_input').on("keypress", function(event) {
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
        var label = $('#additional_microprofile_guides').text();
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
        sanitize: false,
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
        $('#guide_search_input').trigger('focus');
        processSearch(input_value);
    });

    getCategories(function() {
        init();
    });

    getTags(function() {
        init();
    });
    
});


$(window).on("load", function(){
    $.ready.then(function(){
       // Both ready and loaded
       if (location.hash){
           $(window).scrollTop($(location.hash).offset().top);
       }
    })
});
