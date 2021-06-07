$(window).on("load", function() {
  $.ready.then(function() {
    var attempted = document.referrer;
    var doc = attempted.substring(attempted.lastIndexOf("/") + 1);
    doc = doc.substring(0, doc.indexOf(".html"));
    console.log(doc);
    var versions = [];
    $(".components .versions .version")
      .find("a")
      .map(() => {
        versions.push($(this).text());
      });
    console.log(versions);
    var version = $(".context .version").text();
    $(".doc .paragraph").text(
      "The requested document does not exist in the " +
        version +
        " version of the documentation."
    );
  });
});
