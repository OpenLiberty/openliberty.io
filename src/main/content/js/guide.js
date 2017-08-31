$(document).ready(function() {

    let offset;
    let target;
    let target_position;
    let target_width;
    let target_height;

    $('#guide_content pre').hover(function(event) {

        offset = $('#guide_column').position();
        target = event.currentTarget;
        let current_target_object = $(event.currentTarget);
        target_position = current_target_object.position();
        target_width = current_target_object.outerWidth();
        target_height = current_target_object.outerHeight();
        $('#copy_to_clipboard').css({
            top: target_position.top + 20,
            right: 73
        });
        $('#copy_to_clipboard').stop().fadeIn();

    }, function(event) {

        let x = event.clientX - offset.left;
        let y = event.clientY - offset.top + $(window).scrollTop();
        if(!(x > target_position.left
        && x < target_position.left + target_width
        && y > target_position.top
        && y < target_position.top + target_height)) {
            $('#copy_to_clipboard').stop().fadeOut();
            $('#copied_to_clipboard_confirmation').stop().fadeOut();
        }  

    });

    $('#copy_to_clipboard').click(function(event) {
        
        event.preventDefault();
        window.getSelection().selectAllChildren(target);
        if(document.execCommand('copy')) {
            window.getSelection().removeAllRanges();
            let current_target_object = $(event.currentTarget);
            let position = current_target_object.position();
            $('#copied_to_clipboard_confirmation').css({
                top: position.top - 36,
                right: 50
            }).stop().fadeIn().delay(3500).fadeOut();
        } else {
            alert('To copy press CTRL + C');
        }

    });

});
