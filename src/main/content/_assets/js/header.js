$(document).ready(function(){
    $('#navbar_responsive_button').on('click', function(){
        $(this).toggle();
        $('#mobile_close_button').toggle();
        $('#navbar').toggle();
        $('.navbar').toggleClass('open');
    });

    $('#mobile_close_button').on('click', function(){
        $('#navbar_responsive_button').trigger('click');
    });

    // Toggle between down caret and up caret
    $('.dropdown_container').on('click', function(){
        var img = $(this).find('.mobile_caret img');
        var src = img[0].src;
        var newSVG = $('<img></img>');
        if(src.indexOf('upcaret') > -1){
            newSVG.attr('src','/img/downcaret.svg');    
            newSVG.attr('alt','Open nav menu');   
        } else{
            newSVG.attr('src','/img/upcaret.svg');
            newSVG.attr('alt','Close nav menu');   
        }
        img.remove();
        $(this).find('.mobile_caret').append(newSVG);
    });
});