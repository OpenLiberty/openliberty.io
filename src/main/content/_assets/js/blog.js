var blog = function(){
    var tag_names = [];

    // Read tags from json file and add tag to class
    function getTags(callback) {
        $.getJSON( "../../blog_tags.json", function(data) {
            $.each(data.blog_tags, function(j, tag) {
                var tag_class = tag.name.replace(" ", "_");
                tag_names.push(tag_class.toLowerCase());
                // get featured tags from json
                if (tag.featured) {
                    featured_tags_html = '<p class="featured_tag" onclick="blog.filterPosts(' + "'" + tag_class + "'" + '); blog.updateSearchUrl(' + "'" + tag_class + "'" + ');">' + tag.name + '</p>' + '<span>, </span>';
                    $('#featured_tags_list').append(featured_tags_html);
                }
                $(".blog_post_title_link").each(function(i, link) {
                    if (this.hasAttribute('data-path')) {
                        var post_name = this.getAttribute('data-path').substring(19).replace(".adoc", "");
                    }
                    else {
                        var post_name = this.getAttribute('href').substring(17).replace('.html', '');
                    }
                    var tags_html = "";
                    if (tag.posts.indexOf(post_name) > -1) {
                        tags_html = '<p class="blog_tag" onclick="blog.filterPosts(' + "'" + tag_class + "'" + '); blog.updateSearchUrl(' + "'" + tag_class + "'" + ');">' + tag.name + '</p>' + '<span>, </span>';
                        
                        $(".blog_post_content:eq(" + i + ")").addClass(tag_class.toLowerCase());
                        $(".blog_tags_container:eq(" + i + ")").append(tags_html);
                    }
                });
            });
            callback();
        });
    }

    function updateSearchUrl(tag) {
        if (!tag) {
            // Remove query string because search text is empty
            search_value = [location.protocol, '//', location.host, "/blog/"].join('');
            history.pushState(null, "", search_value);
        } else {
            // Handle various search functions
            search_value = "?search=" + tag + "&key=tag";
            history.pushState(null, "", search_value);
        }
    }

    function filterPosts(tag) {
        // scroll to top of page to see filter message
        $(window).scrollTop(0);

        // show filter message at top of page
        $('#filter').show();
        $('#filter_message').show();
        $('#no_results_message').hide();
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

    function showNoResultsMessage(){
        // hide posts that dont have tag
        $('.blog_post_content').hide();
        $('#older_posts').hide();

        // show filter message at top of page
        $('#filter').show();
        $('#filter_message').hide();
        $('#no_results_message').show();        
    }

    $(window).on('popstate', function(){
        removeFilter();
        var tag = get_tag_from_url();
        if (tag) {
            filterPosts(tag);
        }
    });

    function get_tag_from_url(){
        var tag;
        var query_string = location.search;

        if(query_string === ""){
            return;
        }

        // Process the url parameters for searching
        if (query_string.length > 0) {
            var query_params = query_string.substring(1).split('&');
            for(var i = 0; i < query_params.length; i++){
                if(query_params[i].indexOf('search=') === 0) {
                    var tag_name = query_params[i].substring(7);
                    // Check if the tag search query is in the list of supported tags before filtering
                    if(tag_names.indexOf(tag_name.toLowerCase()) > -1){
                        tag = tag_name;
                    }
                    else {
                        showNoResultsMessage();
                    }                
                    break;
                }
            }        
        }
        return tag;
    }


    function init() {
        var tag = get_tag_from_url();
        if(tag){
            filterPosts(tag);
        }
        // if blog post has no tags, add col-md-7 class so that text doesn't overlap
        $('.blog_tags_container').each(function() {
            if ($(this).is(':empty')) {
                // get author container for same post
                var author_container = $(this).parent().prev().children('.blog_post_author_data_container');
                author_container.addClass("col-md-7");
            }
        });
    }
    return {
        getTags: getTags,
        updateSearchUrl: updateSearchUrl,    
        filterPosts: filterPosts,
        removeFilter: removeFilter,        
        init: init
    };
}();

$(document).ready(function() {
    blog.getTags(function () {
        blog.init();
    });
});

