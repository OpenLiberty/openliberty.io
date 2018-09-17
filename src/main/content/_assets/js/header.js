$(document).ready(function(){
    $('#navbar_responsive_button').on('click', function(){     
        $(this).toggle();
        $('#mobile_close_button').toggle();  
    });

    $('#mobile_close_button').on('click', function(){
        $('#navbar_responsive_button').click();
    });

    // Toggle between down caret and up caret
    $('.mobile_caret').on('click', function(){
        var img = $(this).find('img');
        $(this).toggleClass('upsideDown');
    });
});