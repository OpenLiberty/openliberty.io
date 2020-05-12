$(document).ready(function(){
    console.error('Entering redirect code');
    var href = window.location.href;
    var hash = location.hash;
    if(href.indexOf('/docs/ref/feature/') > -1 || href.indexOf('/docs/ref/config/') > -1 || href.indexOf('/docs/ref/command/') > -1 || href.indexOf('/docs/ref/general/') > -1){
        if(hash.indexOf('#') === 0){            
            hash = hash.substring(1); // Remove hash
        }
        location.replace(location.origin + '/docs/latest/' + hash);
    }
});