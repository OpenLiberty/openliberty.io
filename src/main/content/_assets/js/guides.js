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
    var search_term_key = 8;
    
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
            $.each(data, function(index, category) {
                // make lowercase, replace spaces with underscores
                category_id = category.category_name.toLowerCase().replace(/ /g,"_");
                // add categories to TOC 
                $("#toc_column > #toc_container > ul").append('<div id="toc_separator"></div><h1 class="toc_title">' + category.category_name + '</h1>');
                // create div and header for each category
                $("#guides_container").append('<div id="' + category_id + '" class="category_section"><h3 class="guide_category_title">' + category.title + '</h3></div>');
                $.each(category.subcategories, function(j, subcategory) {
                    // make lowercase, replace spaces with underscores
                    subcategory_id = subcategory.subcategory.toLowerCase().replace(/ /g,"_");
                    // add subcategories to TOC
                    $("#toc_column > #toc_container > ul").append('<li><a href="#' + subcategory_id + '">' + subcategory.subcategory + '</a></li>');
                    // create div and header for each subcategory
                    $("#" + category_id).append('<div id="' + subcategory_id + '_section" class="guide_subcategory_section"><h4 id="' + subcategory_id + '" class="guide_subcategory_title">' + subcategory.subcategory + '</h4><div class="row guide_subcategory_row" id="' + subcategory_id +'_row"></div></div>');
                    // sort guides into appropriate subcategories
                    sortGuides(subcategory_id, subcategory.guides);
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

    function showAllCategories() {
        $('.no_results_section').hide();
        $('.guide_category_title').show();
        $('.guide_subcategory_section').show();
        $('.guide_subcategory_title').show();
        $('.guide_column').show();
    }

    // hide and show categories based on whether or not there are search results in that category
    function updateVisibleCategories() {
        // iterate over subcategories and determine if all the guide cards are hidden
        $('.guide_subcategory_row').each(function(index, row) {
            if($(this).children(':visible').length == 0) {
                // all guide cards hidden in subcategory. Hide subcategory title
                $(this).prev().hide();
            }
            else {
                // visible guide cards found in subcategory. Show subcategory title
                if ($(this).prev().is(":hidden")) {
                    $(this).prev().show();
                }
            }
        })
        // iterate over categories and determine if all subcategories are hidden
        $('.category_section').each(function(index, section) {
            if ($(this).find('.guide_subcategory_title:visible').length == 0) {
                $(this).find('.guide_category_title').hide();
            }
            else {
                $(this).find('.guide_category_title').show();
            }
        })

        // check if there are no search results
        if($('#guides_container').find('.guide_category_title:visible').length == 0) {
            // All categories are hidden. Show no results section
            $('.no_results_section').show();

            var search_text = $('#guide_search_input').val();
            $('.search_term').text('"' + search_text + '"');
        } 
        else {
            // All categories not hidden. Hide no results section
            $('.no_results_section').hide();
        }
    }

    function processSearch(input_value) {
        if(input_value.length == 0) {
            showAllCategories();
        } else {
            if(input_value.indexOf('tag:') === 0) {
                var search_value = input_value.substring(4).trim();
                filter_guides(tags_key, search_value);
            } else {
                filter_guides(title_key | description_key | tags_key | search_term_key, input_value);
            }
            updateVisibleCategories();
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
        var searchInput = $('#guide_search_input').val();
        updateSearchUrl(searchInput);
        processSearch(searchInput);        
        showAllCategories();
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
