$(window).on("load", function() {
  $.ready.then(function() {
    var error = false;
    var params = new URLSearchParams(window.location.search);
    var ref = params.get("ref");
    if (!ref.includes("noversion.html")) {
      var folder = "ROOT";
      var dir = "";

      //accomodations for draft and staging sites
      var useNext =
        window.location.href.includes("mybluemix.net") ||
        window.location.href.includes("localhost");

      //get info about doc that was attempted to be reached
      var attempted = ref;
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

      versions.sort(orderVersions);

      var calls = [];
      var matches = [];
      //make api calls for content of each version to see if doc exists
      //add case for reference docs
      //consider adding logic to order versions from newest to oldest
      versions.forEach(function(v, ind) {
        var ver = v;
        if (ind == 0 && useNext) {
          ver = "Next";
        }
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
              ver,
            type: "GET",
            success: function(response) {
              response.forEach(function(file) {
                if (
                  file.name.substring(0, file.name.indexOf(".adoc")) === doc
                ) {
                  matches.push(v);
                }
              });
            },
            statusCode: {
              403: function() {
                $(".doc .paragraph").text(
                  "The requested document does not exist in the " +
                    version +
                    " version of the documentation. Please refer to a different version of the documentation to see this page."
                );
                error = true;
              }
            }
          })
        );
      });

      $.when.apply(null, calls).then(function() {
        if (!error) {
          matches.sort(orderVersions);
          matches.forEach(function(m) {
            $(".doc .paragraph ul").append(
              "<li><a href=" +
                window.location.origin +
                "/docs/" +
                m +
                "/" +
                (folder === "reference" ? "reference/" : "") +
                (dir !== "" ? preceed1 + "/" : "") +
                doc +
                ".html>v" +
                m +
                "</a></li>"
            );
          });
        }
      });

      var version = $(".context .version").text();
      $(".doc .paragraph").text(
        "The requested document does not exist in the " +
          version +
          " version of the documentation, but it is available in the following versions."
      );
      if ($(".doc .paragraph ul").length) {
        $(".doc .paragraph ul").empty();
        $(".doc .paragraph ul").remove();
      }
      $(".doc .paragraph").append("<ul></ul>");

      //change around selectors to get accurate selection, test
      $(".components .versions .version a").on("click", function(e) {
        e.preventDefault();
        var selected = $(e.target)
          .text()
          .trim();
        if (matches.includes(selected)) {
          window.location.href =
            window.location.origin +
            "/docs/" +
            selected +
            "/" +
            (folder === "reference" ? "reference/" : "") +
            (dir !== "" ? preceed1 + "/" : "") +
            doc +
            ".html";
        } else {
          window.location.href = "/docs/" + selected + "/overview.html";
        }
        return;
      });
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
