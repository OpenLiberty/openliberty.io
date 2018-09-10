$(document).ready(function(){
    $('#navbar_responsive_button').on('click', function(){     
        $(this).toggle();
        $('#mobile_close_button').toggle();   
        // $(this).hide();
        // $('#mobile_close_button').show();
        // $('.navbar-header').toggle();
    });

    $('#mobile_close_button').on('click', function(){
        // $(this).hide();
        // $('#navbar_responsive_button').show();
        $('#navbar_responsive_button').click();
    });

    // Toggle between down caret and up caret
    $('.caret').on('click', function(){
        $(this).toggleClass('upsideDown');
    });
});