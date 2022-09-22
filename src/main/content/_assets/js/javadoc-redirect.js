$(function () {
  if (
      window.top.location.href.includes('/docs/modules/reference/microprofile-')
  ) {
      var jd = window.top.location.href;
      var version = jd.substring(
          jd.indexOf('microprofile-') + 13,
          jd.indexOf('microprofile-') + 16
      );
      jd = jd.substring(jd.indexOf('microprofile-') + 25);
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
    var version = jd.substring(
        jd.indexOf('liberty-jakartaee') + 17,
        jd.indexOf('liberty-jakartaee') + 20
    );
    jd = jd.substring(jd.indexOf('liberty-jakartaee') + 29);
    javadocRedirect('liberty-jakartaee',version,jd);
  }
});

function javadocRedirect(api,version,jd) {
  if (jd.indexOf("index.html?") > -1) {
    jd = jd.replace("index.html?","");
  }
  var pack = jd.substring(0, jd.lastIndexOf('/'));
  var port = window.top.location.port !== '' ? ':' + window.top.location.port : '';
  window.top.location.href =
  'https://' +
  window.top.location.hostname +
  port +
  '/docs/latest/reference/javadoc/'+ api +
  version +
  (pack ? '-javadoc.html?package='+pack+'/package-frame.html&class=': '-javadoc.html?class=') +
  jd;
}

