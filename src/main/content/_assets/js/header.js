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

    // Toggle between down caret and up caret.
    // If focusout is set, then the button was clicked out of so reset to a down caret.
    var toggleDropdownIcon = function(dropdownMenu, focusout){
        // Check if the dropdown menu is open or closed
        var button = dropdownMenu.find('button');
        var open = button.attr('aria-expanded') == "true";

        var img = dropdownMenu.find('.mobile_caret img');
        img.remove();

        var newSVG = $('<img></img>');
        if(open || focusout){
            newSVG.attr('src','/img/downcaret.svg');    
            newSVG.attr('alt','Open nav menu');   
        } else{
            newSVG.attr('src','/img/upcaret.svg');
            newSVG.attr('alt','Close nav menu');   
        }        
        dropdownMenu.find('.mobile_caret').append(newSVG);
    };

    $('.dropdown_container').on('focusout', function(){   
        toggleDropdownIcon($(this), true);
    });

    $('.dropdown_container').on('click', function(){
        toggleDropdownIcon($(this));
    });
});