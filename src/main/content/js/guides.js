$(document).ready(function() {

    function filter_guides(key) {
        $('.guide_item').each(function(index, element) {
            
            let guide_item = $(element);
            let hash = guide_item.data('hash');

            if(hash.indexOf(key) != -1) {
                guide_item.parent().removeClass('hidden');
            } else {
                guide_item.parent().addClass('hidden');
            }
        });
    }

    $('#guide_search_input').keyup(function(event) {
        let value = event.currentTarget.value.toLowerCase();
        if(value.length == 0) {
            $('.guide_column').removeClass('hidden');
        } else {
            filter_guides(value);
        }
    });

});