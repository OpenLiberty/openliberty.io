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

var mobileBreakpoint = 767.98;
var tabletBreakpoint = 991.98;

function isMobileView() {
    return(window.innerWidth <= mobileBreakpoint);
}

function isTabletView() {
    return(window.innerWidth <= tabletBreakpoint && window.innerWidth > mobileBreakpoint);
}

function isDesktopView() {
    return(window.innerWidth > tabletBreakpoint);
}

$(document).ready(function() {

    var title_key = 1;
    var description_key = 2;
    var tags_key = 4;
    var search_term_key = 8;

    var nav_banner_bottom = $('#guides_information_container').outerHeight(true) + $('nav.navbar.navbar-default').outerHeight(true);

    // Remove previous TOC section highlighted and highlight correct step
    function updateTOCHighlighting(id) {
        $('.liSelected').removeClass('liSelected');
        var anchor = $("#toc_container a[href='#" + id + "']");
        anchor.parent().addClass('liSelected');
    }

    // Find the first subcategory header that is visible in the viewport and return the id.
    function getMostVisible($elements) {
        var scrolledToBottom = $(window).scrollTop() + $(window).height() == $(document).height();
        if ($(window).scrollTop() <= nav_banner_bottom) {
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

    function handleSectionChanging(event) {
        var sections = $('.guide_subcategory_title:visible');
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
        var top_section_height = getVisibleHeightPx($('nav.navbar.navbar-default'), $(window).height()) + getVisibleHeightPx($('#guides_information_container'), $(window).height());
        var isTOCPositionFixed = ($('#toc_column').css('position') == 'fixed');
        var isAccordionPositionFixed = ($('#tablet_toc_accordion_container').css('position') == 'fixed');
        var accordion_height = $('#tablet_toc_accordion_container').outerHeight();
        // make toc fixed once you scroll past header
        if ($(this).scrollTop() > nav_banner_bottom){
            if (isDesktopView()) {
                $('#toc_container').css({'height': 'calc(100%)'});
                if (!isTOCPositionFixed) {
                    $('#toc_column').css({'position': 'fixed', 'top': '0px'});
                }
            }
            if (isTabletView()) {
                if (!isTOCPositionFixed) {
                    $('#toc_column').css({'position': 'fixed', 'top': accordion_height + 'px'});
                }
                if (!isAccordionPositionFixed) {
                    $('#tablet_toc_accordion_container').css({'position': 'fixed', 'top': '0px'});
                }
            }
        }
        if ($(this).scrollTop() <= nav_banner_bottom){
            if (isDesktopView()) {
                $('#toc_container').css({'height': 'calc(100% - ' + top_section_height + 'px)'});
                if (isTOCPositionFixed){
                    $('#toc_column').css({'position': 'static', 'top': '0px'});
                }
            }
            if (isTabletView()) {
                if (isTOCPositionFixed){
                    $('#toc_column').css({'position': 'absolute', 'top': 'auto'});
                }
                if (isAccordionPositionFixed){
                    $('#tablet_toc_accordion_container').css({'position': 'static', 'top': '0px'});
                }
            }
        }

        if (!isMobileView()) {
            handleSectionChanging(event);
        }
    });

    // function accessContentsFromHash(hash, callback) {
    //     console.log("accessContentFromHash called");
    //     var $focusSection = $(hash);
    //     console.log("focusSection: ", $focusSection);
    //     if ($focusSection.length > 0) {
    //         console.log("focus section found");
    //         updateTOCHighlighting(hash.substring(1));  // Remove the '#' in the hash
    //         var scrollSpot = $focusSection.offset().top;
    //         console.log("initial scrollSpot: ", scrollSpot)
    //         if (isTabletView()) {
    //             console.log('tablet view. updating scroll spot');
    //             scrollSpot -= $('#tablet_toc_accordion_container').height();
    //         }
    //         console.log("scrollSpot = ", scrollSpot);
    //         $("body").data('scrolling', true); // Prevent the default window scroll from triggering until the animation is done.
    //         $("html, body").animate({scrollTop: scrollSpot}, 400, function() {
    //             // Callback after animation.  Change the focus.
    //             $focusSection.trigger('focus');
    //             $("body").data('scrolling', false);   // Allow the default window scroll listener to process scrolls again.
    //             // Check if the section was actually focused
    //             if ($focusSection.is(":focus")) {
    //                 if(callback){
    //                     callback();
    //                 }
    //                 return false;
    //             } else {
    //                 // Add a tabindex to section header since they aren't focusable.
    //                 // tabindex = -1 means that the element should be focusable,
    //                 // but not via sequential keyboard navigation.
    //                 $focusSection.attr('tabindex', '-1');
    //                 $focusSection.trigger('focus');
    //                 if(callback){
    //                     callback();
    //                 }
    //             }
    //         });
    //     }

    // }

    $(document).on('click','#toc_container li > a', function(e) {
        if (isMobileView()) {
            e.preventDefault();
            clicked_id = $(this).attr('href').toLowerCase().replace(/ /g,"_");
            var showSection = $(clicked_id + "_row");
            var img = $(this).find('img');
            if (img.attr('src') == "/img/guides_gray_plus.svg") {
                // change plus to minus
                img.attr({"src": "/img/guides_gray_minus.svg", "alt": "Collapse", "aria-label": "Collapse"});

                // show guides section
                $(this).parent().after(showSection);
                showSection.show();
            }
            else {
                // change minus to plus
                img.attr({"src": "/img/guides_gray_plus.svg", "alt": "Expand", "aria-label": "Expand"});

                // hide guides section
                $(clicked_id + "_section").append(showSection);
                showSection.hide();
            }
        }

        if (isTabletView()) {
            e.preventDefault();
            var accordion_height = $('#tablet_toc_accordion_container').height();
            $("html, body").animate({ scrollTop: $($(this).attr("href")).offset().top - accordion_height }, 500);
        }

        else {
            var hash = $(this).attr('href').replace("#", "");
            updateTOCHighlighting(hash);
        }
    });

    $(window).on('hashchange', function(e) {
        if (isTabletView()) {
            var accordion_height = $('#tablet_toc_accordion_container').height();
            $("body").data('scrolling', true); // Prevent the default window scroll from triggering until the animation is done.
            $("html, body").animate({ scrollTop: $(window.location.hash).offset().top - accordion_height}, 500);
        }
    } );

    // window.addEventListener("hashchange", function(e){
    //     e.preventDefault();

    //     var hash = location.hash;
    //     accessContentsFromHash(hash);
    //     // Note: Scrolling to the new content will cause the onScroll method
    //     //       above to be invoked.
    // });

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
        $.getJSON( "../../guide_categories.json", function(data) {
            $.each(data, function(index, category) {
                // count number of guides in each category
                // make lowercase, replace spaces with underscores
                category_id = category.category_name.toLowerCase().replace(/ /g,"_");
                // add categories to TOC 
                $("#toc_column > #toc_container > ul").append('<h1 class="toc_title">' + category.category_name + '</h1><button class="caret_button"><img src="/img/guides_caret_up.svg" alt="Collapse" aria-label="Collapse"></button><div id="' + category_id + '_num_guides" class="num_guides"></div>');
                // create div and header for each category
                $("#guides_container").append('<div id="' + category_id + '_category" class="category_section"><h3 class="guide_category_title">' + category.title + '</h3></div>');
                $.each(category.subcategories, function(j, subcategory) {
                    // make lowercase, replace spaces with underscores
                    subcategory_id = subcategory.subcategory.toLowerCase().replace(/ /g,"_");
                    // add subcategories to TOC
                    $("#toc_column > #toc_container > ul").append('<li><a href="#' + subcategory_id + '"><img src="/img/guides_gray_plus.svg" alt="Expand" aria-label="Expand">' + subcategory.subcategory + '</a></li>');
                    // create div and header for each subcategory
                    $("#" + category_id + "_category").append('<div id="' + subcategory_id + '_section" class="guide_subcategory_section"><h4 id="' + subcategory_id + '" class="guide_subcategory_title">' + subcategory.subcategory + '</h4><div class="row guide_subcategory_row" id="' + subcategory_id +'_row"></div></div>');
                    // sort guides into appropriate subcategories
                    sortGuides(subcategory_id, subcategory.guides);
                });                
                $("#toc_column > #toc_container > ul").append('<div class="toc_separator">');
                resetTotals();
            });
            // remove guides that have not been put into categories
            $(".guide_column").not(".guide_subcategory_row .guide_column").remove();

            callback();
        });
    }

    // Reset number of guides to total per category
    function resetTotals(no_search_text) {
        $('.category_section').each(function(index, category) {
            // count number of guide cards in each category
            var updatedTotal = $(this).find('.guide_column').length;
            // update num_guides
            $('#' + $(this).attr('id').replace("_category", "_num_guides")).html(updatedTotal + ' guides');
        })
    }
    
    // Look for guides that contain every search word
    function filter_guides(key, search_value) {
        develop_count = 0;
        build_count = 0;
        deploy_count = 0;

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
            for (var i = 0; i < tokens.length; i++) {
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
            if (matches_all_words) {
                guide_item.parent().removeClass('hidden_guide');
                var category = guide_item.closest('.category_section').attr('id');

                if (category == 'develop_category') {
                    develop_count += 1;
                }
                if (category == 'build_category') {
                    build_count += 1;
                }
                if (category == 'deploy_category') {
                    deploy_count += 1;
                }
                // Make sure we are not hiding categories when there are visible guide cards
                guide_item.closest('.container').show();
            } else {
                guide_item.parent().addClass('hidden_guide');
            }
        });
        $('#develop_num_guides').html(develop_count + ' guides');
        $('#build_num_guides').html(build_count + ' guides');
        $('#deploy_num_guides').html(deploy_count + ' guides');
    }

    function showAllCategories() {
        $('.no_results_section').hide();
        $('.guide_category_title').show();
        $('.guide_subcategory_section').show();
        $('.guide_subcategory_title').show();
        $('#toc_container ul li a').removeClass('disabled');
        $('.guide_column').removeClass('hidden_guide');
    }

    // hide and show categories based on whether or not there are search results in that category
    function updateVisibleCategories() {
        // iterate over subcategories and determine if all the guide cards are hidden
        $('.guide_subcategory_row').each(function(index, row) {
            var id = $(this).prev().attr('id');
            var anchor = $("#toc_container a[href='#" + id + "']");
            if($(this).children().not('.hidden_guide').length == 0) {
                // all guide cards hidden in subcategory. Hide subcategory title
                $(this).prev().hide();
                anchor.addClass('disabled');
                anchor.parent().css('cursor', 'not-allowed');
                // anchor.attr("disabled", "disabled");
            }
            else {
                // visible guide cards found in subcategory. Show subcategory title
                if ($(this).prev().is(":hidden")) {
                    $(this).prev().show();
                    anchor.removeClass('disabled');
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
            resetTotals();
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
        resetTotals();
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


    $('#toc_container').on('click', '.caret_button', function() {
        var showSection = $(this).next().nextUntil('.toc_separator');
        // var showSection = $(clicked_id + "_row");
        var img = $(this).find('img');
        if (img.attr('src') == "/img/guides_caret_up.svg") {
            // change up caret to down caret
            img.attr({"src": "/img/guides_caret_down.svg", "alt": "Collapse", "aria-label": "Collapse"});

            // add margin-bottom to num_guides
            $(this).next().css('margin-bottom', '4px');

            // hide guides section
            showSection.hide();
        }
        else {
            // change down caret to up caret
            img.attr({"src": "/img/guides_caret_up.svg", "alt": "Expand", "aria-label": "Expand"});

            // remove margin-bottom to num_guides
            $(this).next().css('margin-bottom', '0px');


            // show guides section
            showSection.show();
        }

    });

    $("#breadcrumb_hamburger").on('click', function(){
        if ($("#toc_column").hasClass('in')) {
            // TOC is expanded
            $("#guide_column").addClass('expanded');
        }
        else {
            // TOC is closed
            $("#guide_column").removeClass('expanded');
        }
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
            if (isTabletView()) {
                var accordion_height = $('#tablet_toc_accordion_container').height();
                $(window).scrollTop($(location.hash).offset().top - accordion_height);
            }
            else {
                $(window).scrollTop($(location.hash).offset().top);

            }
        }
    })
});
