// Read tags from json file and add tag to class
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

                $(".blog_post_content:eq(" + i + ")").addClass(tag_class);
                $(".blog_tags_container:eq(" + i + ")").append(tags_html);
            }
        });
    });
});

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
    $("." + tag).show();
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
    init();
});