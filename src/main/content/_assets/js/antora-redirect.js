$(document).ready(function(){
    var href = window.location.href;
    var path = window.location.pathname;
    var hash = window.location.hash;
    var page = "";
    if(path.indexOf('/docs/ref/general/') > -1){
        // General reference redirects to the ROOT Antora module with no page type in the url
        if(hash.indexOf('#') === 0){
            hash = hash.substring(1); // Remove hash
        }
        window.location.replace(window.location.origin + '/docs/latest/' + hash);
    } else if(path.indexOf('/docs/ref/feature/') > -1 || path.indexOf('/docs/ref/config/') > -1 || path.indexOf('/docs/ref/command/') > -1){
        // Features, config, and command redirect to the reference module which has the doc type in the url
        var resource_path = href.substring(href.indexOf('/docs/ref/') + 10);
        var resource_type = resource_path.substring(0, resource_path.lastIndexOf('/'));       
        if(hash.indexOf('#') === 0){
            hash = hash.substring(1); // Remove hash
        }
        if(hash === ""){
            // Redirect to a certain page for features, config, and commands if no page is supplied in the url.
            switch(resource_type){
                case "feature":
                    page = "feature-overview.html";
                    break;
                case "config":
                    page = "server-configuration-overview.html";
                    break;
                case "command":
                    page = "server-create.html";
                    break;
            }
        }
        window.location.replace(window.location.origin + '/docs/latest/reference/' + resource_type + '/' + page + hash);
    } else if(path.indexOf('/docs/ref/javaee/') > -1){
       // Remove /docs/ref/javaee/ and the version
       var version_path = path.substring(17);
       var version = version_path.substring(0, version_path.indexOf('/'));
        window.location.replace(window.location.origin + '/docs/latest/reference/javadoc/liberty-javaee' + version + '-javadoc.html' + hash);
    } else if(path.indexOf('/docs/ref/microprofile/') > -1) {
        // Remove /docs/ref/microprofile and the version
       var version_path = path.substring(23);
       var version = version_path.substring(0, version_path.indexOf('/'));
        window.location.replace(window.location.origin + '/docs/latest/reference/javadoc/microprofile-' + version + '-javadoc.html' + hash);
    }
});