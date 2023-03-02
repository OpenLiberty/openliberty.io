var nextRequest = true;
$('.doc .paragraph').append('<div class="loader"></div>');
var contentText = addContentText();
$(".doc .paragraph p").addClass("noversion-paragraph");
$(".doc .paragraph p").text(contentText);

$(window).on("load", function() {
  $.ready.then(function() {
    var params = new URLSearchParams(window.location.search);
    var ref = params.get("ref");
    if (!ref.includes("noversion.html")) {
      var folder = "ROOT";
      var dir = "";

      //accomodations for draft and staging sites
      /*var useNext =
        window.location.href.includes("mybluemix.net") ||
        window.location.href.includes("localhost");*/

      //get info about doc that was attempted to be reached
      var attempted = ref;
      var doc = attempted.substring(attempted.lastIndexOf("/") + 1);

      var preceed1 = attempted.substring(0, attempted.lastIndexOf("/"));
      preceed1 = preceed1.substring(preceed1.lastIndexOf("/") + 1);
      if (preceed1 === "reference") {
        folder = "reference";
      } else {
        if (
          preceed1 === "feature" ||
          preceed1 === "javadoc" ||
          preceed1 === "api" ||
          preceed1 === "spi" ||
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

      var matches = [];
      //make api calls for content of each version to see if doc exists
      //add case for reference docs
      //consider adding logic to order versions from newest to oldest
      versions.forEach(function(v, ind) {
        var ver = v;
        var matchingVersion = doesFileExist(window.location.origin+"/docs/"+ver+"/"+(folder === "reference" ? "reference/" : "") +(dir !== "" ? preceed1 + "/" : "")+doc,ver)
        if(matchingVersion) {
          matches.push(matchingVersion);
        }
      });

      $(".loader").remove();
      $(".doc .paragraph p").removeClass("noversion-paragraph");
      $(".doc .paragraph p").remove();
      $(".doc .paragraph").text(contentText);

      if ($(".doc .paragraph ul").length) {
        $(".doc .paragraph ul").empty();
        $(".doc .paragraph ul").remove();
      }
      $(".doc .paragraph").append("<ul></ul>");

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
            ">v" +
            m +
            "</a></li>"
        );
      });

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
            doc;
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

function doesFileExist(urlToFile,version) {
  if(nextRequest){ // if requested doc file not found, stop sending request for older versions
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send();
    // return attempted doc file available in which versions
    // with the intro of latest symbolic version, sees the requested doc file exists in latest version
    if (((xhr.status >=200)&&(xhr.status < 300)&&(xhr.responseURL === urlToFile)) || 
       ((xhr.status >=200)&&(xhr.status < 300)&&(xhr.responseURL.indexOf("latest") > -1))) { // Successful responses
        nextRequest = true;
        return version;
    } else {
      nextRequest = false;
    } 
  }
}

function addContentText() {
  var version = $(".context .version").text();
  var displayText = "The requested document does not exist in the " +
  version +
  " version of the documentation, but it is available in the following versions."
  return displayText;
}