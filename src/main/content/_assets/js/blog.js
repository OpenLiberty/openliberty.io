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
                    featured_tags_html = '<p tabindex="0" role="listitem" class="featured_tag" onclick="blog.filterPosts(' + "'" + tag_class + "'" + '); blog.updateSearchUrl(' + "'" + tag_class + "'" + ');" onkeypress="blog.filterPosts(' + "'" + tag_class + "'" + '); blog.updateSearchUrl(' + "'" + tag_class + "'" + ');">' + tag.name + '</p>' + '<span>, </span>';
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
                        tags_html = '<p tabindex="0" role="listitem" class="blog_tag" onclick="blog.filterPosts(' + "'" + tag_class + "'" + '); blog.updateSearchUrl(' + "'" + tag_class + "'" + ');" onkeypress="blog.filterPosts(' + "'" + tag_class + "'" + '); blog.updateSearchUrl(' + "'" + tag_class + "'" + ');">' + tag.name + '</p>' + '<span>, </span>';
                        
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

    function filterPosts(tag, exclude) {
        // scroll to top of page to see filter message
        $(window).scrollTop(0);

        $('#no_results_message').hide();
        $('#older_posts').hide();

        if(exclude){
            // hide posts that have tag
            $("." + tag.toLowerCase()).hide();

        } else {
            // clear blog post content
            $('.blog_post_content').hide();
            // show filter message at top of page
            $('#filter').show();
            $('#filter_message').show();
            $('#filter_tag').text(tag.replace("_", " "));

            // show posts that have tag
            $("." + tag.toLowerCase()).show();
        }
        
        $('#final_post').show();
        adjustWhiteBackground();
    }

    function removeFilter() {
        $('#filter').hide();
        $('.blog_post_content').show();
        $('#older_posts').show();
        adjustWhiteBackground();
    }

    function showNoResultsMessage(){
        // hide posts that dont have tag
        $('.blog_post_content').hide();
        $('#older_posts').hide();

        // show filter message at top of page
        $('#filter').show();
        $('#filter_message').hide();
        $('#no_results_message').show(); 
        
        adjustWhiteBackground();
    }

    $(window).on('popstate', function(){
        removeFilter();
        var tagObj = getTagFromUrl();
        var tag = tagObj.tag;
        var ex = tagObj.exclude;
        if (tag) {
            filterPosts(tag, ex);
        }
    });

    function getTagFromUrl(){
        var t;
        var query_string = location.search;
        var ex = false;
        var ret = {};

        if(query_string === ""){
            return;
        }

        // Process the url parameters for searching
        if (query_string.length > 0) {
            var query_params = query_string.substring(1).split('&');
            for(var i = 0; i < query_params.length; i++){
                if(query_params[i].indexOf('search=') === 0) {
                    console.log(query_params[i]);
                    var tag_name;
                    if(query_params[i].indexOf('!') > -1){
                        tag_name = query_params[i].substring(8);
                        ex = true;
                    } 
                    else {
                        tag_name = query_params[i].substring(7);
                    }
                    // Check if the tag search query is in the list of supported tags before filtering
                    if(tag_names.indexOf(tag_name.toLowerCase()) > -1){
                        t = tag_name;
                    }
                    else {
                        showNoResultsMessage();
                    } 
                    console.log("Tag="+t+", Exclude="+ex);               
                    break;
                }
            }        
        }
        ret['tag'] = t;
        ret['exclude'] = ex;
        return ret;
    }

    // Calculate the viewport height and make sure that the blogs column takes up at least
    // that height.
    function adjustWhiteBackground(){
        var page_height = window.innerHeight;
        var nav_height = $('nav').outerHeight();
        var footer_height = $('footer').outerHeight();
        var min_height = page_height - nav_height - footer_height;
        $('#right_column').css({'min-height': min_height});
    }


    function init() {
        var tagObj = getTagFromUrl();
        var tag = tagObj.tag;
        var ex = tagObj.exclude;
        if(tag){
            filterPosts(tag, ex);
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
        adjustWhiteBackground: adjustWhiteBackground,   
        init: init
    };
}();

$(window).on('resize', function(){
    blog.adjustWhiteBackground();
});

$(document).ready(function() {
    blog.getTags(function () {
        blog.init();
    });
});

