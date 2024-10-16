$(function () {
  if (
      window.top.location.href.includes('/docs/modules/reference/microprofile-')
  ) {
      var jd = window.top.location.href;
      var ver_start_index= jd.indexOf('microprofile-') + 13;
      var ver_string = jd.substring(ver_start_index); // To obtain the last index of version
      var ver_end_index = ver_string.indexOf('-');
      if(ver_end_index !== -1 ){
          var version = ver_string.substring(
              0,
              ver_end_index
          );
          var add_index = version.length - 3;
          jd = jd.substring(jd.indexOf('microprofile-') + add_index + 25);
      }
      else{
        version = null;
      }
      javadocRedirect('microprofile-',version,jd);
  } else if (
      window.top.location.href.includes('/docs/modules/reference/liberty-javaee')
  ) {
      var jd = window.top.location.href;
      var version = jd.substring(
          jd.indexOf('liberty-javaee') + 14,
          jd.indexOf('liberty-javaee') + 15
      );
      jd = jd.substring(jd.indexOf('liberty-javaee') + 24);
      javadocRedirect('liberty-javaee',version,jd);
  } else if (
    window.top.location.href.includes('/docs/modules/reference/liberty-jakartaee')
) {
    var jd = window.top.location.href;
    var ver_start_index= jd.indexOf('liberty-jakartaee') + 17;
      var ver_string = jd.substring(ver_start_index); // To obtain the last index of version
      var ver_end_index = ver_string.indexOf('-');
      if(ver_end_index !== -1 ){
          var version = ver_string.substring(
              0,
              ver_end_index
          );
          var add_index = version.length - 3;
          jd = jd.substring(jd.indexOf('liberty-jakartaee') + add_index + 29);
      }
      else{
        version = null;
      }
    javadocRedirect('liberty-jakartaee',version,jd);
  }
});

function javadocRedirect(api,version,jd) {
  if (jd.indexOf("index.html?") > -1) {
    jd = jd.replace("index.html?","");
  }
  var pack = jd.substring(0, jd.lastIndexOf('/'));
  var port = window.top.location.port !== '' ? ':' + window.top.location.port : '';
  var mainFrame = $('#javadoc_container');
  var isFrameless = mainFrame.contents().find('iframe').length === 0;
  if(isFrameless){
    window.top.location.href =
    'https://' +
    window.top.location.hostname +
    port +
    '/docs/latest/reference/javadoc/'+ api +
    version + (pack ? '-javadoc.html?path='+api+version+'-javadoc/'+jd: '-javadoc.html');
  }
  else{
    window.top.location.href =
    'https://' +
    window.top.location.hostname +
    port +
    '/docs/latest/reference/javadoc/'+ api +
    version +
    (pack ? '-javadoc.html?package='+pack+'/package-frame.html&class=': '-javadoc.html?class=') +
    jd;
  }
}

