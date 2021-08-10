$(function () {
  if (
    window.top.location.href.includes("/docs/modules/reference/microprofile-")
  ) {
    var jd = window.top.location.href;
    var version = jd.substring(
      jd.indexOf("microprofile-") + 13,
      jd.indexOf("microprofile-") + 16
    );
    jd = jd.substring(jd.indexOf("microprofile-") + 25);
    var pack = jd.substring(0, jd.lastIndexOf("/"));
    var port =
      window.top.location.port !== "" ? ":" + window.top.location.port : "";
    window.top.location.href =
      "https://" +
      window.top.location.hostname +
      port +
      "/docs/ref/microprofile/" +
      version +
      "/#package=" +
      pack +
      "/package-frame.html&class=" +
      jd;
  } else if (
    window.top.location.href.includes("/docs/modules/reference/liberty-javaee")
  ) {
    var jd = window.top.location.href;
    var version = jd.substring(
      jd.indexOf("liberty-javaee") + 14,
      jd.indexOf("liberty-javaee") + 15
    );
    jd = jd.substring(jd.indexOf("liberty-javaee") + 24);
    var pack = jd.substring(0, jd.lastIndexOf("/"));
    var port =
      window.top.location.port !== "" ? ":" + window.top.location.port : "";
    window.top.location.href =
      "https://" +
      window.top.location.hostname +
      port +
      "/docs/latest/reference/javadoc/liberty-javaee" +
      version +
      "-javadoc.html#package=" +
      pack +
      "/package-frame.html&class=" +
      jd;
  }
});
