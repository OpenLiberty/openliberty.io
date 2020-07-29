$(window).on("load", function(){
    $.ready.then(function(){
        var path = window.location.search;
        var page_index = path.indexOf('?page=');
        if(page_index > -1){
            var page_name = decodeURIComponent(path.substring(page_index + 6));

            var version = $('.context .version').text();
            $('.doc > .paragraph').text("The page " + page_name + " does not exist in the " + version + " version of the documentation.");
        }        
    });
});