$(document).ready(function(){
    console.error('Entering redirect code');
    var path = window.location.pathname;
    var hash = window.location.hash;
    if(path.indexOf('/docs/ref/feature/') > -1 || path.indexOf('/docs/ref/config/') > -1 || path.indexOf('/docs/ref/command/') > -1 || href.indexOf('/docs/ref/general/') > -1){
        if(hash.indexOf('#') === 0){            
            hash = hash.substring(1); // Remove hash
        }
        window.location.replace(window.location.origin + '/docs/latest/' + hash);
    } else if(path.indexOf('/docs/ref/javaee/') > -1){
       // Remove /docs/ref/javaee/, version, and hash
       // If there is no hash, just redirect to the overview of the javadoc
       var version_path = path.path.substring(17);
       var version = version_path.substring(0, version_path.indexOf('/'));
        window.location.replace(window.location.origin + '/docs/latest/reference/liberty-javaee' + version + '-javadoc.html' + hash);
    } else if(href.indexOf('/docs/ref/microprofile/') > -1) {
        // Remove /docs/ref/microprofile/, version, and hash
       // If there is no hash, just redirect to the overview of the javadoc
       var version_path = path.path.substring(23);
       var version = version_path.substring(0, version_path.indexOf('/'));
        window.location.replace(window.location.origin + '/docs/latest/reference/microprofile-' + version + '-javadoc.html' + hash);
    }
});