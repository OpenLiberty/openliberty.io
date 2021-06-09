$(window).on("load", function() {
  $.ready.then(function() {
    if (!document.referrer.includes("noversion.html")) {
      var folder = "ROOT";
      var dir = "";
      //get info about doc that was attempted to be reached
      var attempted = document.referrer;
      var doc = attempted.substring(attempted.lastIndexOf("/") + 1);
      doc = doc.substring(0, doc.indexOf(".html"));

      var preceed1 = attempted.substring(0, attempted.lastIndexOf("/"));
      preceed1 = preceed1.substring(preceed1.lastIndexOf("/") + 1);
      if (preceed1 === "reference") {
        folder = "reference";
      } else {
        if (
          preceed1 === "feature" ||
          preceed1 === "javadoc" ||
          preceed1 === "config" ||
          preceed1 === "command"
        ) {
          folder = "reference";
          dir = "/" + preceed1;
        }
      }

      //get all current versions of docs
      var versions = [];
      $(".components .versions .version")
        .find("a")
        .map(function() {
          versions.push($(this).text());
        });

      var calls = [];
      var matches = [];
      //make api calls for content of each version to see if doc exists
      //add case for reference docs
      //consider adding logic to order versions from newest to oldest
      versions.forEach(function(v) {
        calls.push(
          $.ajax({
            headers: {
              Accept: "application/vnd.github.v3.raw"
            },
            url:
              "https://api.github.com/repos/OpenLiberty/docs/contents/modules/" +
              folder +
              "/pages" +
              dir +
              "?ref=v" +
              v,
            type: "GET",
            success: function(response) {
              response.forEach(function(file) {
                if (
                  file.name.substring(0, file.name.indexOf(".adoc")) === doc
                ) {
                  matches.push(v);
                }
              });
            }
          })
        );
      });

      $.when.apply(null, calls).then(function() {
        matches.sort(orderVersions);
        matches.forEach(function(m) {
          $(".doc .paragraph ul").append(
            "<li><a href=" +
              window.location.origin +
              "/docs/" +
              m +
              "/" +
              (folder === "reference" ? "reference/" : "") +
              (dir !== "" ? dir + "/" : "") +
              doc +
              ".html>v" +
              m +
              "</a></li>"
          );
        });
      });

      var version = $(".context .version").text();
      $(".doc .paragraph").text(
        "The requested document does not exist in the " +
          version +
          " version of the documentation."
      );
      if ($(".doc .paragraph ul").length) {
        $(".doc .paragraph ul").empty();
        $(".doc .paragraph ul").remove();
      }
      $(".doc .paragraph").append(
        "<div><p>Below are links to the requested document in other versions of the documentation.</p></div><ul></ul>"
      );

      $(document).ready(function() {
        $(".components .versions .version").click(function(e) {
          var selected = $(e.target)
            .find("a")
            .text()
            .trim();
          if (matches.includes(selected)) {
            window.location.href =
              window.location.origin +
              "/docs/" +
              selected +
              "/" +
              (folder === "reference" ? "reference/" : "") +
              (dir !== "" ? dir + "/" : "") +
              doc +
              ".html";
          } else {
            window.location.href =
              window.location.origin + "/docs/" + selected + "/overview.html";
          }
        });
      });
    } else {
      $(".doc .paragraph div p").remove();
    }
  });
});

function orderVersions(a, b) {
  var arrA = a.split(".");
  var arrB = b.split(".");
  for (var i = 0; i < arrA.length; i++) {
    if (parseInt(arrA[i]) > parseInt(arrB[i])) {
      return -1;
    } else if (parseInt(arrA[i]) < parseInt(arrB[i])) {
      return 1;
    }
  }
  return 0;
}
