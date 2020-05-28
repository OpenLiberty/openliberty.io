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

    var programScrolling = false;

    var mobileBreakpoint = 767.98;
    var tabletBreakpoint = 991.98;
    
    function isMobileView() {
        return (window.innerWidth <= mobileBreakpoint);
    }
    
    function isTabletView() {
        return (window.innerWidth <= tabletBreakpoint && window.innerWidth > mobileBreakpoint);
    }
    
    function isDesktopView() {
        return (window.innerWidth > tabletBreakpoint);
    }

    // Remove previous TOC section highlighted and highlight correct step
    function updateTOCHighlighting(id) {
        $('.liSelected').removeClass('liSelected');
        var anchor = $("#toc_container a[href='#" + id + "']");
        anchor.parent().addClass('liSelected');
    }

    // Find the first subcategory header that is visible in the viewport and return the id
    function getFirstVisibleTitle($elements) {
        var highlightElement = $(location.hash);
        // iterate over subcategory headers and get first on screen
        $elements.each(function(index, element) {
            if ($(this).isInViewport()) {
                highlightElement = $(this);
                return false; // break out of loop because we found first title in viewport. No need to keep looking.
            }
        })
        return highlightElement.attr('id');
    }

    // Determine if an element is in the viewport
    $.fn.isInViewport = function() {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
    
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
    
        return elementBottom > viewportTop && elementTop < viewportBottom;
    };

    // add enough padding to last subcategory so that it gets highlighted in toc
    function addPadding() {
        var lastSection = $("#guides_container .category_section:last-child .guide_subcategory_section:last-child");
        if (isDesktopView()) {
            var lastSectionHeight = lastSection.height();
            var windowHeight = $(window).height()
            var footerHeight = $('footer').outerHeight();
            var padding = windowHeight - lastSectionHeight - footerHeight - 50;
            lastSection.css('padding-bottom', padding + 'px');
        }
        else {
            lastSection.css('padding-bottom', '50px');
        }
    }

    // Get number of pixels that are visible in viewport for $element
    function getVisibleHeightPx($element) {
        console.log("getting visible height of element");
        var viewportHeight = $(window).height();
        var rect = $element.get(0).getBoundingClientRect(),
            height = rect.bottom - rect.top,
            visible = {
                top: rect.top >= 0 && rect.top < viewportHeight,
                bottom: rect.bottom > 0 && rect.bottom < viewportHeight
            },
            visiblePx = 0;

        if (visible.top && visible.bottom) {
            // whole element is visible
            visiblePx = height;
        } else if (visible.top) {
            visiblePx = viewportHeight - rect.top;
        } else if (visible.bottom) {
            visiblePx = rect.bottom;
        } else if (height > viewportHeight && rect.top < 0) {
            var absTop = Math.abs(rect.top);

            if (absTop < height) {
                // part of the element is visible
                visiblePx = height - absTop;
            }
        }

        return visiblePx;
    }

    // Add hash to url and update TOC highlighting
    function handleSectionChanging(id) {
        if (id !== " ") {
            scrolledToHash = '#' + id;
            var currentPath = window.location.pathname;
            var newPath = currentPath.substring(currentPath.lastIndexOf('/')+1) + scrolledToHash;
        }
        else {
            scrolledToHash = "";
            newPath = id;
        }
        // update the URL hash with new section we scrolled into
        if (window.location.hash !== scrolledToHash) {
            history.replaceState(null, null, newPath);
            updateTOCHighlighting(id);
        }
    }

    function fixTOCHeight() {
        var headerVisibleHeight = getVisibleHeightPx($('nav#nav_bar')) + getVisibleHeightPx($('#guides_information_container'));
        var tocHeight = $('#toc_container ul').height();
        var footerVisibleHeight = getVisibleHeightPx($('footer'));
        var totalHeight = headerVisibleHeight + tocHeight + footerVisibleHeight;
        var windowHeight = $(window).height();
        var headerAndFooterHeight = headerVisibleHeight + footerVisibleHeight;

        if (totalHeight > windowHeight) {
            $('#toc_container').css({'height': 'calc(100vh - ' + headerAndFooterHeight + 'px)'});
        }
        else {
            $('#toc_container').css({'height': 'auto'});
        }
    }

    var width = window.outerWidth;
    $(window).on('resize', function() {

        // fix positioning of filter box popover when page resized
        if ($('#guide_search_input').is(':focus')) {
            var popover_left_position = $("#guide_search_input").position().left;
            var popover_width = $('.popover').outerWidth();
            var search_box_width = $('#guide_search_input').outerWidth();

            // if popover is wider than filter box, center popover below filter box
            if (popover_width > search_box_width) {
                $(".popover").css('left', popover_left_position - (popover_width - search_box_width)/2);
            }
            // else match popover position to filter box left position
            else {
                $(".popover").css('left', popover_left_position);
            }
        }

        addPadding();
        var navBannerBottom = $('#guides_information_container').outerHeight(true) + $('nav#nav_bar').outerHeight(true);

        // fix TOC height to account for footer and make it scrollable if necessary
        if (isDesktopView()) {
            fixTOCHeight();
        }

        // going from mobile to tablet or desktop view
        if (width <= mobileBreakpoint && $(this).outerWidth() > mobileBreakpoint) {
            // look for guides that have been moved to the TOC on mobile view and move them back to their place in the guides section
            $('#toc_container ul').find('.guide_subcategory_row').each(function() {
                // move subcategory row back to it's section
                $("#" + $(this).attr('id').replace("row", "section")).append($(this));
                // show subcategory row in case it was hidden on mobile when it's category was collapsed
                $(this).show();
            });

            // add collapsed sections back to TOC
            $('#toc_container ul').find('li:hidden').show();
            $('.toc_title_container').css('margin-bottom', "0");

            // move no_results_section back to guides_container and show TOC again
            $('#guides_container').prepend($('.no_results_section'));
            $('#toc_container ul').show();

            // mobile to tablet only
            if ($(this).outerWidth() <= tabletBreakpoint) {
                // if scrolled past banner, show hamburger menu
                if ($(window).scrollTop() > navBannerBottom) {
                    $('#tablet_toc_accordion_container').css({'position': 'fixed', 'top': '0px'});
                    $('#toc_column').css({'position': 'fixed', 'top': '41px', 'height': 'auto'});
                }
                else {
                    $('#tablet_toc_accordion_container').css({'position': 'static', 'top': '0px'});
                    $('#toc_column').css({'position': 'absolute', 'top': 'auto'});
                }

                // override TOC height set in mobile view
                $('#toc_container').css('height', '100vh');
            }

        }

        // going from tablet to mobile or desktop to mobile
        if (width > mobileBreakpoint && $(this).outerWidth() <= mobileBreakpoint) {      
            // look for minus sign (previously opened subcategory) and move guides back to that place in TOC
            $('#toc_container ul').find('img[src$="guides_gray_minus.svg"]').each(function() {
                expanded_id = $(this).parent().attr('href').toLowerCase().replace(/ /g,"_");
                var showSection = $(expanded_id + "_row");
                $(this).parent().parent().after(showSection);
            });

            // look for caret facing down (previsouly collapsed category) and hide those subcategories again
            $('#toc_container ul').find('img[src$="guides_caret_down.svg"]').each(function() {
                var showSection = $(this).parent().parent().nextUntil('.toc_separator');
                showSection.hide();
                $(this).parent().parent().css('margin-bottom', '4px');
            });

            // move no_results_section back to guides_container
            $('#toc_container').prepend($('.no_results_section'));

            // reset TOC to how it should appear on mobile
            $('#toc_column').css({'position': 'static', 'height': 'auto'});
            $('#toc_container').css('height', 'auto');
            $('#toc_container').find('li.liSelected').removeClass('liSelected');
        }

        // going from desktop to tablet view
        if (width > tabletBreakpoint && $(this).outerWidth() <= tabletBreakpoint && $(this).outerWidth() > mobileBreakpoint) {
            // if scrolled past banner, show hamburger menu
            if ($(window).scrollTop() > navBannerBottom) {
                $('#tablet_toc_accordion_container').css({'position': 'fixed', 'top': '0px'});
                $('#toc_column').css({'position': 'fixed', 'top': '41px', 'height': 'auto'});
            }
            else {
                $('#tablet_toc_accordion_container').css({'position': 'static', 'top': '0px'});
                $('#toc_column').css({'position': 'absolute', 'top': 'auto'});
            }

            // override toc_container height set on desktop view
            $('#toc_container').css('height', '100vh');
        }

        // going from tablet to desktop view
        if (width <= tabletBreakpoint && width > mobileBreakpoint && $(this).outerWidth() > tabletBreakpoint) {
            // if scrolled past banner, fix TOC to top
            if ($(window).scrollTop() > navBannerBottom) {
                $('#toc_column').css({'position': 'fixed', 'top': '0px'});
            }
            else {
                $('#toc_column').css({'position': '', 'top': ''});
            }
        }
        
        // update width with new width after resizing
        if ($(this).outerWidth() != width) {
            width = $(this).outerWidth();
        }
    });

    $(window).on('scroll', function(event) {
        var isTOCPositionFixed = ($('#toc_column').css('position') == 'fixed');
        var isAccordionPositionFixed = ($('#tablet_toc_accordion_container').css('position') == 'fixed');
        var accordionHeight = $('#tablet_toc_accordion_container').outerHeight();
        var navBannerBottom = $('#guides_information_container').outerHeight(true) + $('nav#nav_bar').outerHeight(true);
        
        // fix TOC height to account for footer and make it scrollable if necessary
        if (isDesktopView()) {
            fixTOCHeight();
        }

        // make TOC fixed once you scroll past header
        if ($(this).scrollTop() > navBannerBottom){
            if (isDesktopView()) {
                if (!isTOCPositionFixed) {
                    $('#toc_column').css({'position': 'fixed', 'top': '0px'});
                }
            }
            if (isTabletView()) {
                if (!isTOCPositionFixed) {
                    $('#toc_column').css({'position': 'fixed', 'top': accordionHeight + 'px'});
                }
                if (!isAccordionPositionFixed) {
                    $('#tablet_toc_accordion_container').css({'position': 'fixed', 'top': '0px'});
                }
            }
            // get the id of the section most in view
            var id = getFirstVisibleTitle($('.guide_subcategory_title:visible')); 
        }

        // make TOC static once you scroll above header
        if ($(this).scrollTop() <= navBannerBottom){
            if (isDesktopView()) {
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
            var id = " ";
        }

        if (!programScrolling) {
            if (!isMobileView()) {
                handleSectionChanging(id);
            }
        }

    });

    function accessContentsFromHash(hash, callback) {
        var $focusSection = $(hash);
        if ($focusSection.length > 0) {
            updateTOCHighlighting(hash.substring(1));  // Remove the '#' in the hash
            var scrollSpot = $focusSection.offset().top;
            if (isTabletView()) {
                scrollSpot -= 80; // adjust scrollSpot to account for hamburger menu
            }
            $("body").data('scrolling', true); // Prevent the default window scroll from triggering until the animation is done.
            programScrolling = true;
            $("html, body").animate({scrollTop: scrollSpot}, 400, function() {
                // Callback after animation.  Change the focus.
                $focusSection.trigger('focus');
                $("body").data('scrolling', false);   // Allow the default window scroll listener to process scrolls again.
                // Check if the section was actually focused
                if ($focusSection.is(":focus")) {
                    if(callback){
                        callback();
                    }
                    return false;
                } else {
                    // Add a tabindex to section header since they aren't focusable.
                    // tabindex = -1 means that the element should be focusable,
                    // but not via sequential keyboard navigation.
                    $focusSection.attr('tabindex', '-1');
                    $focusSection.trigger('focus');
                    if(callback){
                        callback();
                    }
                }
                programScrolling = false;
            });
        }
        $('#toc_container').height($('footer').offset().top + 25 - $('#toc_container').offset().top);
    }

    $(document).on('click','#toc_container li > a', function(e) {
        e.preventDefault();
        if (isMobileView()) {
            clicked_id = $(this).attr('href').toLowerCase().replace(/ /g,"_");
            var showSection = $(clicked_id + "_row");
            var img = $(this).find('img');
            if (img.attr('src') == "/img/guides_gray_plus.svg") {
                // change plus to minus
                img.attr({"src": "/img/guides_gray_minus.svg", "alt": "Collapse", "aria-label": "Collapse"});

                // show guides section
                $(this).parent().after(showSection);
            }
            else {
                // change minus to plus
                img.attr({"src": "/img/guides_gray_plus.svg", "alt": "Expand", "aria-label": "Expand"});

                // hide guides section
                $(clicked_id + "_section").append(showSection);
            }
        }

        else  {
            if (isTabletView()) {
                var accordionHeight = $('#tablet_toc_accordion_container').height();
            }
            else {
                var accordionHeight = 0;
            }

            programScrolling = true;
            $("html, body").animate({ scrollTop: $($(this).attr("href")).offset().top - accordionHeight }, 500, function() {
                programScrolling = false;
            });

            var id = $(this).attr('href').replace("#", "");
            handleSectionChanging(id);
        }
    });

    $(window).on('hashchange', function(e){
        e.preventDefault();

        var hash = location.hash;
        accessContentsFromHash(hash);
        // Note: Scrolling to the new content will cause the onScroll method
        //       above to be invoked.
    });

    // Read tags from JSON file and add tags to data-tags attribute to make tags searchable
    function getTags(callback) {
        $.getJSON( "../../guides/guides-common/guide_tags.json", function(data) {
            $.each(data.guide_tags, function(i, tag) {
                // check if tag has additional search terms to add to data-tags attribute
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
                    // add tag to data-tags attribute if the guide's project id is in the array for that tag
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

    // Turn the "New" flag into an actual searchable tag
    function createNewTag() {
        $('.new_guide_container').each(function(i, j) {
            if ($(this).parent().data('tags')) {
                $(this).parent().data("tags", $(this).data("tags") + " new");
            }
            else {
                $(this).parent().data("tags", "new");
            }
        })
    }

    // Move guide cards to correct subcategories
    function sortGuides(subcategory, guideList) {
        // iterate over array of guides from JSON file
        $.each(guideList, function(index, guide) {
            // look for guide card that matches the guide's projectid from the array
            var guide_card = $(".guide_item[href='/guides/" + guide + ".html']");            
            // move guide card to div with class that matches subcategory
            guide_card.parent().removeClass("hidden").appendTo("#" + subcategory + "_row");
        });
    }

    // Read guide categories from JSON file and create TOC and category sections
    function getCategories(callback) {
        $.getJSON( "../../guides/guides-common/guide_categories.json", function(data) {
            $.each(data, function(index, category) {
                // make category name lowercase and replace spaces with underscores
                categoryId = category.category_name.toLowerCase().replace(/ /g,"_");
                // add categories to TOC 
                $("#toc_column > #toc_container > ul").append('<div class="toc_title_container"><h1 class="toc_title">' + category.category_name + '</h1><p id="' + categoryId + '_num_guides" class="num_guides"></p><button class="caret_button"><img src="/img/guides_caret_up.svg" alt="Collapse" aria-label="Collapse"></button></div>');
                // create div and header in guides section for each category
                $("#guides_container").append('<div id="' + categoryId + '_category" class="category_section"><h3 class="guide_category_title">' + category.category_title + '</h3></div>');
                $.each(category.subcategories, function(j, subcategory) {
                    // make subcategory name lowercase and replace spaces with underscores
                    subcategoryId = subcategory.subcategory_name.toLowerCase().replace(/ /g,"_");
                    // add subcategories to TOC
                    $("#toc_column > #toc_container > ul").append('<li><a href="#' + subcategoryId + '"><img src="/img/guides_gray_plus.svg" alt="Expand" aria-label="Expand">' + subcategory.subcategory_name + '</a></li>');
                    // create div and header in guides section for each subcategory
                    $("#" + categoryId + "_category").append('<div id="' + subcategoryId + '_section" class="guide_subcategory_section"><h4 id="' + subcategoryId + '" class="guide_subcategory_title">' + subcategory.subcategory_name + '</h4><div class="row guide_subcategory_row" id="' + subcategoryId +'_row"></div></div>');
                    // sort guides into appropriate subcategories
                    sortGuides(subcategoryId, subcategory.guides);
                });
                $("#toc_column > #toc_container > ul").append('<div class="toc_separator">');
            });
            // remove guides that have not been put into categories
            $(".guide_column").not(".guide_subcategory_row .guide_column").remove();
            updateTotals(false);
            callback();
        });
    }

    // Update number of guides count for each category
    function updateTotals(showTotal) {
        $('.category_section').each(function(index, category) {
            // count number of guide cards visible in each category
            var count = $(this).find('.guide_column').not('.hidden_guide').length;
            // count total number of guides in each category (including hidden ones)
            var total = $(this).find('.guide_column').length;
            // update num_guides
            if (showTotal) {
                $('#' + $(this).attr('id').replace("_category", "_num_guides")).html('(' + count + '/' + total + ' guides)');
            }
            else {
                $('#' + $(this).attr('id').replace("_category", "_num_guides")).html('(' + count + ' guides)');
            }
        })
    }
    
    // Look for guides that contain every search word
    function filterGuides(key, search_value) {
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
                // Show hidden guides again
                guide_item.parent().removeClass('hidden_guide');
                // Make sure we are not hiding categories when there are visible guide cards
                guide_item.closest('.container').show();

                // Show TOC if it was hidden on mobile when there were no search results
                $('#toc_container ul').show();
            } else {
                // Hide guides that don't match search
                guide_item.parent().addClass('hidden_guide');
            }
        });
    }

    // Show all hidden categories again
    function showAllCategories() {
        $('.no_results_section').hide();
        $('.guide_category_title').show();
        $('.guide_subcategory_section').show();
        $('.guide_subcategory_title').show();
        $('#toc_container ul').show();
        $('#toc_container ul li a').removeClass('disabled');
        $('#toc_container ul li').removeAttr("title");
        $('#toc_container ul li').css('cursor', 'auto');
        $('.guide_column').removeClass('hidden_guide');
    }

    // Hide and show categories based on whether or not there are search results in that category
    function updateVisibleCategories() {
        // iterate over subcategories and determine if all the guide cards are hidden
        $('.guide_subcategory_row').each(function(index, row) {
            var subcategory_title_id = $(this).attr('id').replace("_row", "");
            var anchor = $("#toc_container a[href='#" + subcategory_title_id + "']");
            var subcategory_title = $('#' + subcategory_title_id);
            // all guide cards hidden in subcategory
            if($(this).children().not('.hidden_guide').length == 0) {
                // hide subcategory title
                subcategory_title.hide();
                // disable links in TOC
                anchor.addClass('disabled');
                anchor.parent().attr('title', 'No guides matching search.');
                anchor.parent().css('cursor', 'text');
            }
            // visible guide cards found in subcategory
            else {
                if ($(this).prev().is(":hidden")) {
                    // show subcategory title
                    subcategory_title.show();
                    // reenable links in TOC
                    anchor.removeClass('disabled');
                    anchor.parent().removeAttr("title");
                    anchor.parent().css('cursor', 'auto');
                }
            }
        })

        // iterate over categories and determine if all subcategories are hidden
        $('.category_section').each(function(index, section) {
            // all subcategories hidden, hide category
            if ($(this).find('.guide_subcategory_title:visible').length == 0) {
                $(this).find('.guide_category_title').hide();
            }
            // visible subcategories found, show category
            else {
                $(this).find('.guide_category_title').show();
            }
        })

        // check if there are no search results
        if ($('#toc_container ul').find('a:not(.disabled)').length == 0) {
            // all categories are hidden. Show no results section
            $('.no_results_section').show();

            // if on mobile view, move no results message into TOC so it is visible
            if (isMobileView()) {
                $('#toc_container').prepend($('.no_results_section'));
                $('#toc_container ul').hide();
            }

            var search_text = $('#guide_search_input').val();
            $('.search_term').text('"' + search_text + '"');
        }
        
        else {
            // all categories not hidden. Hide no results section
            $('.no_results_section').hide();
        }
    }

    function processSearch(inputValue) {
        if (inputValue.length == 0) {
            showAllCategories();
            updateTotals(false);
        } else {
            if(inputValue.indexOf('tag:') === 0) {
                var search_value = inputValue.substring(4).trim();
                filterGuides(tags_key, search_value);
            } else {
                filterGuides(title_key | description_key | tags_key | search_term_key, inputValue);
            }
            updateVisibleCategories();
            updateTotals(true);
        }
    }

    $('#guide_search_input').on("keyup", function(event) {
        var inputValue = event.currentTarget.value.toLowerCase();
        processSearch(inputValue);
    });

    $(window).on('popstate', function(){
        var inputValue = location.search;
        queryString = inputValue.substring(8);
        document.getElementById("guide_search_input").value = queryString;
        processSearch(queryString);
    });

    // Clear search input when x button clicked
    $('.clear_btn').on('click', function(){
        $('#guide_search_input').val('');
        var searchInput = $('#guide_search_input').val();
        updateSearchUrl(searchInput);
        processSearch(searchInput);        
        showAllCategories();
        updateTotals(false);
    });

    $('#guide_search_input').on("keypress", function(event) {
        if(event.which == 13) { // 13 is the enter key
            var searchInput = $('#guide_search_input').val();
            updateSearchUrl(searchInput);
        }
    });

    function updateSearchUrl(value) {
        if (!value) {
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
        if (value.startsWith('tag:')) {
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

    function init() {
        if (isDesktopView()) {
            fixTOCHeight();
        }

        var queryString = location.search;
        // Process the url parameters for searching
        if (queryString.length > 0) {
            var parameters = decodeURI(queryString.substring(1)).split('&');
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
            var inputValue = $('#guide_search_input').val().toLowerCase();
            processSearch(inputValue);
        }

        if (location.hash) {
            var hash = location.hash;
            accessContentsFromHash(hash);
        }

        addPadding();
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
        var inputValue = 'tag: ' + $(this).html();
        $('#guide_search_input').val(inputValue);
        $('.tag_button').removeClass('hidden');
        $(this).addClass('hidden');
        $('#guide_search_input').trigger('focus');
        processSearch(inputValue);
    });

    // Handle click on caret button on mobile view
    $('#toc_container').on('click', '.caret_button', function() {
        var showSection = $(this).parent().nextUntil('.toc_separator');
        var img = $(this).find('img');
        if (img.attr('src') == "/img/guides_caret_up.svg") {
            // change up caret to down caret
            img.attr({"src": "/img/guides_caret_down.svg", "alt": "Collapse", "aria-label": "Collapse"});

            // add margin-bottom to num_guides
            $(this).parent().css('margin-bottom', '4px');

            // hide guides section
            showSection.hide();
        }
        else {
            // change down caret to up caret
            img.attr({"src": "/img/guides_caret_up.svg", "alt": "Expand", "aria-label": "Expand"});

            // remove margin-bottom to num_guides
            $(this).parent().css('margin-bottom', '0px');

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
    
    createNewTag();
});
