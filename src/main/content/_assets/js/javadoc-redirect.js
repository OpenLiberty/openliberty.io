$(function () {
  if (
    window.top.location.href.includes("/docs/modules/reference/microprofile-")
  ) {
    var jd = window.top.location.href;
    var version = jd.substring(
      jd.indexOf("microprofile-") + 14,
      jd.indexOf("microprofile-") + 17
    );
    jd = jd.substring(jd.indexOf("microprofile-") + 25);
    var pack = jd.substring(0, jd.lastIndexOf("/"));
    var port =
      window.top.location.port !== "" ? ":" + window.top.location.port : "";
    window.top.location.href =
      "https://" +
      window.top.location.hostname +
      port +
      "/docs/ref/microprofile/4" +
      version +
      "/#package=" +
      pack +
      "/package-frame.html&class=" +
      jd;
  }
});
