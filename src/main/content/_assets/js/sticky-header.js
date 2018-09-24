$(document).ready(function(){
    var navbar = $('.navbar');
    var navHeight = navbar.outerHeight();
    $(window).on('scroll', function(){
        var offset = window.scrollY;        
        if(offset > navHeight){
            navbar.addClass('stickyNav');
        } else{
            navbar.removeClass('stickyNav');
        }
    });
});