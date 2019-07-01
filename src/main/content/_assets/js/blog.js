// Read tags from json file and add tag to class
$.getJSON( "../../blog_tags.json", function(data) {
    $.each(data.blog_tags, function(j, tag) {
        // get featured tags from json
        if (tag.featured) {
            featured_tags_html = '<p class="featured_tag" onclick="filter_posts(' + "'" + tag.name.replace(" ", "_") + "'" + ');">' + tag.name + '</p>' + '<span>, </span>';
            $('#featured_tags_list').append(featured_tags_html);
        }
        $(".blog_post_title_link").each(function(i, link) {
            var href = this.getAttribute('href');
            post_name = href.substring(17).replace('.html', '');
            var tags_html = "";
            if (tag.posts.indexOf(post_name) > -1) {
                var tag_class = tag.name.replace(" ", "_");
                tags_html = '<p class="blog_tag" onclick="filter_posts(' + "'" + tag_class + "'" + ');">' + tag.name + '</p>' + '<span>, </span>';

                $(".blog_post_content:eq(" + i + ")").addClass(tag_class);
                $(".blog_tags_container:eq(" + i + ")").append(tags_html);
            }
        });
    });
});


function filter_posts(tag) {
    // show filter message at top of page
    $('#filter').show();
    $('#filter_tag').text(tag.replace("_", " "));

    // hide posts that dont have tag
    $('.blog_post_content').hide();
    $('#older_posts').hide();
    $("." + tag).show();
    $('#final_post').show();
}
