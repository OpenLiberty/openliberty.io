// Read tags from json file and add tag to class
function getTags(callback) {
    $.getJSON( "../../blog_tags.json", function(data) {
        $.each(data.blog_tags, function(j, tag) {
            var tag_class = tag.name.replace(" ", "_");
            // get featured tags from json
            if (tag.featured) {
                featured_tags_html = '<p class="featured_tag" onclick="filterPosts(' + "'" + tag_class + "'" + '); updateSearchUrl(' + "'" + tag_class + "'" + ');">' + tag.name + '</p>' + '<span>, </span>';
                $('#featured_tags_list').append(featured_tags_html);
            }
            $(".blog_post_title_link").each(function(i, link) {
                var href = this.getAttribute('href');
                post_name = href.substring(17).replace('.html', '');
                var tags_html = "";
                if (tag.posts.indexOf(post_name) > -1) {
                    tags_html = '<p class="blog_tag" onclick="filterPosts(' + "'" + tag_class + "'" + '); updateSearchUrl(' + "'" + tag_class + "'" + ');">' + tag.name + '</p>' + '<span>, </span>';

                    $(".blog_post_content:eq(" + i + ")").addClass(tag_class.toLowerCase());
                    $(".blog_tags_container:eq(" + i + ")").append(tags_html);
                }
            });
        });
        callback(data);
    });
}

function updateSearchUrl(tag) {
    if (!tag) {
        // Remove query string because search text is empty
        search_value = [location.protocol, '//', location.host, "/blog/"].join('');
        history.pushState(null, "", search_value);
    } else {
        // Handle various search functions
        search_value = "?search=" + tag;
        history.pushState(null, "", search_value);
    }

}

function filterPosts(tag) {
    // scroll to top of page to see filter message
    $(window).scrollTop(0);

    // show filter message at top of page
    $('#filter').show();
    $('#filter_tag').text(tag.replace("_", " "));

    // hide posts that dont have tag
    $('.blog_post_content').hide();
    $('#older_posts').hide();
    $("." + tag.toLowerCase()).show();
    $('#final_post').show();
}


function removeFilter() {
    $('#filter').hide();
    $('.blog_post_content').show();
    $('#older_posts').show();
}

$(window).on('popstate', function(){
    var query_string = location.search;
    if (query_string.length > 0) {
        var tag = query_string.replace("?search=", "");
        filterPosts(tag);
    }
    else {
        removeFilter();
    }
});


function init() {
    var query_string = location.search;

    // Process the url parameters for searching
    if (query_string.length > 0) {
        var tag = query_string.replace("?search=", "");
        filterPosts(tag);
    }
}

$(document).ready(function() {
    getTags(function () {
        init();
    });

    // if blog post has no tags, add col-md-7 class so that text doesn't overlap
    $('.blog_tags_container').each(function() {
        if ($(this).is(':empty')) {
            // get author container for same post
            var author_container = $(this).parent().prev().children('.blog_post_author_data_container');
            author_container.addClass("col-md-7");
        }
    });

});
