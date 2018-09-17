$(document).ready(function(){
    $('#navbar_responsive_button').on('click', function(){     
        $(this).toggle();
        $('#mobile_close_button').toggle();  
    });

    $('#mobile_close_button').on('click', function(){
        $('#navbar_responsive_button').click();
    });

    // Toggle between down caret and up caret
    $('.caret').on('click', function(){
        $(this).toggleClass('upsideDown');
    });
});