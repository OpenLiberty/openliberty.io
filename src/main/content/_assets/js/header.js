$(document).ready(function(){
    $('#navbar_responsive_button').on('click', function(){
        $(this).toggle();
        $('#mobile_close_button').toggle();
        $('.navbar').toggleClass('open');
    });

    $('#mobile_close_button').on('click', function(){
        $('#navbar_responsive_button').click();
    });

    // Toggle between down caret and up caret
    $('.mobile_caret').on('click', function(){
        var img = $(this).find('img');
        var src = img[0].src;
        var newSVG = $('<img></img>');
        if(src.indexOf('upcaret') > -1){
            newSVG.attr('src','/img/downcaret.svg');    
            newSVG.attr('alt','Open nav menu');   
        } else{
            newSVG.attr('src','/img/upcaret.svg');
            newSVG.attr('alt','Close nav menu');   
        }
        $(this).children().remove();
        $(this).append(newSVG);
    });
});