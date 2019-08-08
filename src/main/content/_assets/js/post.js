// Read tags from json file and add tag to class
$.getJSON( "../../../../blog_tags.json", function(data) {
    var path = $(location).attr('pathname');
    post_name = path.substring(17).replace('.html', '');

    var tags_html = "";
    $.each(data.blog_tags, function(j, tag) {
        if (tag.posts.indexOf(post_name) > -1) {
            tags_html = '<a href="/blog/?search=' + tag.name + '" class="post_tag">' + tag.name + '</a>' + '<span>, </span>';
            $(".post_tags_container").append(tags_html);
        }
    });

});