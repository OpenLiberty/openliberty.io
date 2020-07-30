$(window).on("load", function(){
    $.ready.then(function(){
        var version = $('.context .version').text();
        $('.doc .paragraph').text("The requested page does not exist in the " + version + " version of the documentation.");               
    });
});