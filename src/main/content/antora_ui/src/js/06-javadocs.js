/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

var PACKAGE_FRAME = ".leftBottom iframe";
var CLASS_FRAME = "iframe.rightIframe";
var DEFAULT_PACKAGE_HTML = "allclasses-frame.html";
var DEFAULT_CLASS_HTML = "overview-summary.html";
var PACKAGE_HASH = "package=";
var CLASS_HASH = "class=";

var defaultHtmlRootPath = "";
var defaultPackageHtml = "";
var defaultClassHtml = "";

// Make sure the footer and header of the documentation page is always in the
// browser viewport.
function resizeJavaDocWindow() {
  var topSection = $("#background_container").outerHeight();
  var bottomSection = $("#footer_container").height();

  var middleSectionHeight = $(window).height() - (topSection + bottomSection);
  $("#javadoc_container").height(middleSectionHeight);
}

/* Handles any elements which are not accessible by a screen reader and fixes DAP violations. */
function addAccessibility() {
  var javadoc_container = $("#javadoc_container").contents();
  var classFrame = javadoc_container.find("iframe[name='classFrame']");

  // Add accessibility labels to the search input and search reset button, and fix duplicate navigation roles.
  classFrame
    .contents()
    .find("#search")
    .attr("aria-label", "Search");
  classFrame
    .contents()
    .find("#reset")
    .attr("aria-label", "Reset the search field");
  classFrame
    .contents()
    .find("header > nav")
    .removeAttr("role")
    .attr("aria-label", "Header navigation");
  classFrame
    .contents()
    .find("footer > nav")
    .removeAttr("role")
    .attr("aria-label", "Footer navigation");
}

function addExpandAndCollapseToggleButtons() {
  var javadoc_container = $("#javadoc_container").contents();
  var iframes = javadoc_container.find("iframe");

  var leftTop = javadoc_container.find(".leftTop");
  var leftBottom = javadoc_container.find(".leftBottom");

  $(iframes).each(function() {
    // Look for the two left side iframes
    var isTopLeftPackageIFrame = $(this).attr("name") === "packageListFrame";
    var isBottomLeftPackageIFrame = $(this).attr("name") === "packageFrame";
    var isClassFrame = $(this).attr("name") === "classFrame";

    if (
      isTopLeftPackageIFrame &&
      $(this)
        .contents()
        .find(".toggle").length === 0
    ) {
      var list = $(this)
        .contents()
        .find('ul[title="Packages"]');
      var header = $(this)
        .contents()
        .find("h2[title='Packages']");

      // A empty whitespace only <p> element needs to be hidden
      var emptyParagraphElement = $(this)
        .contents()
        .find("body > p");
      emptyParagraphElement.hide();

      var headerHeight = header.outerHeight(true); // true to include margins too
      var toggleButton = $(
        '<div class="toggle" collapsed="false" tabindex=0><img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse" /></div>'
      );
      toggleButton.on("click", function() {
        var collapsed = $(this).attr("collapsed");
        if (collapsed === "true") {
          // Expand the list
          list.show();
          leftTop.css("height", "45%");
          leftBottom.css("height", "55%");
          $(this)
            .empty()
            .append(
              $(
                '<img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse"/>'
              )
            );
          $(this).attr("collapsed", false);
        } else {
          // Collapse the list
          list.hide();
          leftTop.css("height", headerHeight);
          leftTop.css("overflow", "hidden");
          leftBottom.css("height", "86%");
          $(this)
            .empty()
            .append(
              $(
                '<img src="/img/all_guides_plus.svg" alt="Expand" aria-label="Expand"/>'
              )
            );
          $(this).attr("collapsed", true);
        }
      });
      toggleButton.on("keypress", function(event) {
        event.stopPropagation();
        // Enter key
        if (event.which === 13 || event.keyCode === 13) {
          toggleButton.click();
        }
      });
      header.append(toggleButton);
    }
    if (
      isBottomLeftPackageIFrame &&
      $(this)
        .contents()
        .find(".toggle").length === 0
    ) {
      addExpandAndCollapseToggleButtonForPackageFrame(
        $(this).contents(),
        leftBottom
      );
    }
  });
}

function addExpandAndCollapseToggleButtonForPackageFrame(contents, leftBottom) {
  var list2 = contents.find("main.indexContainer > ul");
  var frame2 = contents.find("div.leftBottom");

  // Add region to the package div
  var packageHeader = contents.find("h1.bar");
  var packageHeaderText = packageHeader
    .text()
    .replace("/s/g", " ")
    .trim();
  // Move the header text only if it is showing "All Classes" content
  if (packageHeaderText === "All Classes") {
    contents.find("main.indexContainer").prepend(packageHeader.remove());
  }
  // packageHeader.attr('role', 'region');

  // I did not know how to select for text that contained whitespace.
  // example: "All Classes"
  var header2 = contents.find("h1:contains('Classes')");
  var headerHeight2 = header2.outerHeight(true); // true to include margins too

  // .text() returns encoded spaces, convert back to normal spaces
  // for string comparison.
  var header2_text = header2
    .text()
    .replace("/s/g", " ")
    .trim();
  if (header2_text === "All Classes") {
    var toggleButton2 = $(
      '<div class="toggle" collapsed="false" tabindex=0><img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse" /></div>'
    );
    toggleButton2.on("click", function() {
      var collapsed = $(this).attr("collapsed");
      if (collapsed === "true") {
        // Expand the list
        list2.show();
        leftBottom.css("height", "55%");
        $(this)
          .empty()
          .append(
            $(
              '<img src="/img/all_guides_minus.svg" alt="Collapse" aria-label="Collapse"/>'
            )
          );
        $(this).attr("collapsed", false);
      } else {
        // Collapse the list
        list2.hide();
        leftBottom.css("height", headerHeight2);
        $(this)
          .empty()
          .append(
            $(
              '<img src="/img/all_guides_plus.svg" alt="Expand" aria-label="Expand"/>'
            )
          );
        $(this).attr("collapsed", true);
      }
    });
    toggleButton2.on("keypress", function(event) {
      event.stopPropagation();
      // Enter key
      if (event.which === 13 || event.keyCode === 13) {
        toggleButton2.click();
      }
    });
    header2.append(toggleButton2);
  }
}
function addiPadScrolling() {
  if (navigator.platform.match(/iPad/)) {
    $("#javadoc_container")
      .contents()
      .find(".leftTop, .leftBottom, .rightContainer")
      .css("-webkit-overflow-scrolling", "touch");
    $("#javadoc_container")
      .contents()
      .find(".leftTop, .leftBottom, .rightContainer")
      .css("overflow-y", "scroll");
  }
}

/*
    Add a listener to scrolling in the main frame.
*/
function addScrollListener() {
  var javadoc_container = $("#javadoc_container").contents();
  var rightFrame = javadoc_container.find(CLASS_FRAME);
  rightFrame
    .contents()
    .off("scroll")
    .on("scroll", function(event) {
      hideFooter($(this));
    });
}

/* Scroll listener to the left frame */
function addLeftFrameScrollListener(frameToListen, frameElementToListen) {
  var frame = $("#javadoc_container")
    .contents()
    .find(frameToListen);
  var frameHeader = frame.contents().find(frameElementToListen);
  var packagesList = frame
    .contents()
    .find("h2[title='Packages']")
    .next();
  var classesList = frame
    .contents()
    .find("h1.bar")
    .next();
  var offsetTop = frameHeader.offset().top;
  var origPaddingTop = parseInt(
    frameHeader.css("padding-top").replace("px", "")
  );
  var headerHeight = frameHeader.height();
  // For FireFox, cannot just use border-top, has to use border-top-color, border-top-style, border-top-width
  var origBorderTopWidth = frameHeader.css("border-top-width");
  var origBorderTopStyle = frameHeader.css("border-top-style");
  var origBorderTopColor = frameHeader.css("border-top-color");
  var stickyBeforeCss =
    '<style data-class="sticky">.sticky:before {top:' +
    origPaddingTop +
    "px; " +
    "border-top-width: " +
    origBorderTopWidth +
    "; border-top-style: " +
    origBorderTopStyle +
    "; border-top-color: " +
    origBorderTopColor +
    ";}</style>";
  frame
    .contents()
    .off("scroll")
    .on("scroll", function(event) {
      var topPos = $(this).scrollTop();
      if (topPos >= offsetTop - 20) {
        if (!frameHeader.hasClass("sticky")) {
          // sticky css will set margin-top to 0, otherwise the rolling content will appear in the margin-top area.
          // To maintain the spacing and look with margin-top removed, replace padding-top and border-top
          // with temporarily values and adjust sticky header with calculated padding-top and border-top.
          frameHeader.css("padding-top", offsetTop + origPaddingTop);
          packagesList.css(
            "padding-top",
            offsetTop + origPaddingTop + headerHeight
          );
          classesList.css(
            "padding-top",
            offsetTop + origPaddingTop + headerHeight
          );
          frameHeader.css("border-top-width", "0px");
          frameHeader.css("border-top-style", "solid");
          frameHeader.css("border-top-color", "transparent");

          if ($(this).find('head style[data-class="sticky"]').length) {
            $(this)
              .find('head style[data-class="sticky"]')
              .replaceWith(stickyBeforeCss);
          } else {
            $(this)
              .find("head")
              .append(stickyBeforeCss);
          }
          frameHeader.addClass("sticky");
        }
      } else {
        if (frameHeader.hasClass("sticky")) {
          frameHeader.removeClass("sticky");
          /* restore the original padding-top and border-top css */
          frameHeader.css("padding-top", origPaddingTop);
          frameHeader.css("border-top-width", origBorderTopWidth);
          frameHeader.css("border-top-style", origBorderTopStyle);
          frameHeader.css("border-top-color", origBorderTopColor);
        }
      }
    });
}

/*
    Check if the right iframe has been scrolled down at least 85% to show the footer.
*/
function hideFooter(element) {
  var scrollTop = element.scrollTop(); // Add the viewport to the top of the scrollTop to see if we've reached end of page.
  var javadoc_container = $("#javadoc_container").contents();
  var rightFrame = javadoc_container.find(CLASS_FRAME);
  var rightFrameViewportHeight = rightFrame.contents()[0].documentElement
    .clientHeight;
  var height = element.height();
  var footer = $("footer");

  // Show footer if the scrollTop plus the viewport height of the right iFrame is at least 85% past the bottom of the right iFrame.
  if (scrollTop + rightFrameViewportHeight > height * 0.85) {
    if (!footer.data("visible") || footer.data("visible") === "false") {
      footer.data("visible", true);
      footer.css("display", "block");
    }
  } else {
    if (footer.data("visible")) {
      footer.data("visible", "false");
      footer.css("display", "none");
    }
  }
}

function addNavHoverListener() {
  var javadoc_container = $("#javadoc_container").contents();
  var rightFrame = javadoc_container.find(CLASS_FRAME);
  var tabs = rightFrame.contents().find("ul.navList li:has(a)");
  tabs.off("mouseover").on("mouseover", function() {
    $(this).addClass("clickableNavListTab");
  });
  tabs.off("mouseleave").on("mouseleave", function() {
    $(this).removeClass("clickableNavListTab");
  });
}

// Returns a json object with the package and class from the url
function parseQueryParams() {
  var targetPage = {};
  var hashPage = parent.window.location.hash;
  if (hashPage != "" && hashPage != undefined) {
    hashPage = hashPage.substring(1); // take out the #
    var splitHashPage = hashPage.split("&");
    for (i = 0; i < splitHashPage.length; i++) {
      var hashString = splitHashPage[i].trim();
      if (hashString.indexOf(PACKAGE_HASH) === 0) {
        targetPage.package = hashString.substring(8);
      } else {
        var tmpClassPage = hashString;
        if (hashString.indexOf(CLASS_HASH) === 0) {
          tmpClassPage = hashString.substring(6);
        } else if (hashString.indexOf("=") !== -1) {
          tmpClassPage = "";
        }
        if (tmpClassPage !== "") {
          targetPage.class = tmpClassPage;
        }
      }
    }
  }
  return targetPage;
}

function setDynamicIframeContent() {
  // setup the default html path
  if (defaultPackageHtml === "") {
    var alocation = $("#javadoc_container")
      .contents()
      .find(".leftTop iframe")
      .contents()
      .attr("location");
    defaultHtmlRootPath = getJavaDocHtmlPath(alocation.href, true);
    defaultPackageHtml = defaultHtmlRootPath + DEFAULT_PACKAGE_HTML;
    defaultClassHtml = defaultHtmlRootPath + DEFAULT_CLASS_HTML;
  }

  var targetPage = parseQueryParams();
  if (targetPage.package) {
    setIFrameContent(PACKAGE_FRAME, defaultHtmlRootPath + targetPage.package);
  }
  if (targetPage.class) {
    setIFrameContent(CLASS_FRAME, defaultHtmlRootPath + targetPage.class);
  }
  updateTitle(targetPage.package);
}

// Update title in browser tab to show current page
function updateTitle(currentPage) {
  if (currentPage !== undefined && currentPage !== "allclasses-frame.html") {
    var currentPage = currentPage
      .substring(0, currentPage.lastIndexOf("/"))
      .replace(/\//g, ".");
    if (window.top.location.pathname.includes("microprofile")) {
      $("title").text(currentPage + " - MicroProfile API - Open Liberty");
    } else {
      $("title").text(currentPage + " - Java EE API - Open Liberty");
    }
  }
}

function addClickListeners() {
  var iframes = $("#javadoc_container")
    .contents()
    .find("iframe");

  $(iframes).each(function() {
    addClickListener($(this).contents());
  });
}

function addClickListener(contents) {
  contents.on("click", function(e) {
    var handlingClick = true;
    var iframeName = CLASS_FRAME;
    var hashKey = CLASS_HASH;
    var href = e.target.href;
    if (e.target.target === undefined) {
      // handling
      // <a href ...>
      //   <span> ... </span>
      // </a>
      // or
      // <a href ...>
      //   <code> ... </code>
      // </a>
      if (e.target.parentNode.localName === "a") {
        href = e.target.parentNode.href;
        if (e.target.parentNode.target === "packageFrame") {
          iframeName = PACKAGE_FRAME;
          hashKey = PACKAGE_HASH;
        }
      } else {
        handlingClick = false;
      }
    } else if (e.target.target === "packageFrame") {
      iframeName = PACKAGE_FRAME;
      hashKey = PACKAGE_HASH;
    } else if (e.target.href && e.target.href.indexOf("javascript:") === 0) {
      // let javadoc handles the click for "All/Instance/Abstract" methods in
      // the Method Summary section
      handlingClick = false;
    }
    if (handlingClick) {
      // handling onclick here, not by the provided javadoc implementation
      e.preventDefault();
      e.stopPropagation();

      var hashParams = setHashParams(href, hashKey);
      setIFrameContent(iframeName, href);
      setPackageContainerHeight();

      // provide state data to be used by the popstate event to render the frame contents
      var state = {};
      state[iframeName] = href;
      var otherHashContent = getRemainingHashParam(hashParams, hashKey);
      $.each(otherHashContent, function(key, value) {
        var otherStateKey = CLASS_FRAME;
        if (key === PACKAGE_HASH) {
          otherStateKey = PACKAGE_FRAME;
        }
        state[otherStateKey] = defaultHtmlRootPath + value;
      });
      window.history.pushState(state, null, hashParams);

      var package = hashParams
        .substring(1)
        .split("&")
        .sort()[1]
        .replace("package=", "");
      updateTitle(package);

      // Remove all selected li in this list and add active class to parent li
      $(e.target.parentNode)
        .parents(".indexContainer")
        .find("li.selected")
        .removeClass("selected");
      $(e.target)
        .parents("li")
        .first()
        .addClass("selected");
    }
  });
}

function setPackageContainerHeight() {
  var packageContainer = $("#javadoc_container")
    .contents()
    .find(".leftBottom");
  if (packageContainer.css("height") !== "55%") {
    // restore the height in case it is collapsed
    packageContainer.css("height", "55%");
  }
}

function setIFrameContent(iframeName, href) {
  var iframeContent = $("#javadoc_container")
    .contents()
    .find(iframeName)
    .contents();
  var errorhref = "/docs/ref/javadocs/doc-404.html";
  // get current version to create path to all classes frame
  var path = window.top.location.pathname;
  if (path.includes("microprofile")) {
    var currentVersion = path.slice(-4, -1);
    var allClassesHref =
      "/javadocs/microprofile-" +
      currentVersion +
      "-javadoc/allclasses-frame.html";
  } else {
    var currentVersion = path.slice(-2, -1);
    var allClassesHref =
      "/javadocs/liberty-javaee" +
      currentVersion +
      "-javadoc/allclasses-frame.html";
  }

  // check if href results in 404 and redirect to doc-404.html if it does
  var http = new XMLHttpRequest();
  http.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // replace the content only if the current content is from a different href
      if (iframeContent.attr("location").href !== href) {
        iframeContent.attr("location").replace(href);
      }
    } else if (this.status === 404) {
      if (iframeName === "iframe.rightIframe") {
        iframeContent.attr("location").replace(errorhref);
      } else if (iframeName === ".leftBottom iframe") {
        iframeContent.attr("location").replace(allClassesHref);
      }
    }
  };

  http.open("HEAD", href);
  http.send();
}

// If package is provided as hashName, then return the class hash. Otherwise return the package hash.
function getRemainingHashParam(hash, hashName) {
  var lookForHash = PACKAGE_HASH;
  var returnHash = {};
  if (hashName === PACKAGE_HASH) {
    lookForHash = CLASS_HASH;
  }
  if (hash.indexOf(lookForHash) !== -1) {
    try {
      var searchHashToMatch = ".*" + lookForHash + "(.*?.html).*";
      var regExpToMatch = new RegExp(searchHashToMatch, "g");
      var groups = regExpToMatch.exec(hash);
      returnHash[lookForHash] = groups[1];
    } catch (ex) {}
  }
  return returnHash;
}

// To mark the javadoc bookmarkable, a hash is used to contain two pieces of information.
//   package=xxx.html
//   class=xxx.html
// eg. #package=javax/enterprise/util/package-frame.html&class=javax/interceptor/InterceptorBinding.html
//
// The package hash is used to render the content in the left bottom iframe. The class hash
// is used to render the content in the right iframe.
function setHashParams(url, hashName) {
  var hash = window.location.hash;
  if (url !== undefined && url != "") {
    var htmlPath = getJavaDocHtmlPath(url);
    var hashString = hashName + htmlPath;
    if (window.location.hash.indexOf(hashString) === -1) {
      if (window.location.hash.indexOf(hashName) !== -1) {
        try {
          // take out existing hash string with same name first
          var hashNameToMatch = "(.*)" + hashName + ".*?.html(.*)";
          var regExpToMatch = new RegExp(hashNameToMatch, "g");
          var groups = regExpToMatch.exec(window.location.hash);
          if (groups) {
            hash = groups[1] + hashString + groups[2];
          } else {
            hash = "#" + hashString;
          }
        } catch (ex) {}
      } else {
        if (window.location.hash.indexOf("#") === -1) {
          hashString = "#" + hashString; // no hash yet
        } else {
          hashString = "&" + hashString; // already has existing hash
        }
        hash = window.location.hash + hashString;
      }
    }
  }
  // The hash approach is to always include both package and class hash. If default content is
  // displayed for package/class frame content, provide the hash to point to the default html too.
  if (hash.indexOf(PACKAGE_HASH) === -1) {
    // add default package to hash
    hash += "&" + PACKAGE_HASH + getJavaDocHtmlPath(defaultPackageHtml);
  }
  if (hash.indexOf(CLASS_HASH) === -1) {
    // add default class to hash
    hash += "&" + CLASS_HASH + getJavaDocHtmlPath(defaultClassHtml);
  }
  return hash;
}

// Eg of href is http://localhost:4000/docs/modules/reference/microprofile-1.3-javadoc/javax/enterprise/context/package-frame.html
// if returnBase is true, return http://localhost:4000/docs/modules/reference/microprofile-1.3-javadoc/
// otherwise return javax/enterprise/context/package-frame.html

function getJavaDocHtmlPath(href, returnBase) {
  var javaDocPath = "";
  try {
    var stringToMatch = "(.*/docs/modules/reference/.*-javadoc/)(.*)";
    var regExpToMatch = new RegExp(stringToMatch, "g");
    var groups = regExpToMatch.exec(href);
    if (returnBase) {
      javaDocPath = groups[1];
    } else {
      javaDocPath = groups[2];
    }
  } catch (e) {}
  return javaDocPath;
}

// add current hash to url when version button clicked
function versionClick(event) {
  event.target.href += window.location.hash;
}

// Highlight the iframe's TOC according to the query param in the URL
function highlightTOC(iframeName) {
  var toc, href;
  var targetPage = parseQueryParams();
  var iframeContent = $("#javadoc_container")
    .contents()
    .find(iframeName)
    .contents();
  if (iframeName == ".leftTop iframe") {
    href = targetPage.package;
    toc = iframeContent.find('li a[href="' + href + '"]');
  } else if (iframeName == PACKAGE_FRAME) {
    href = targetPage.class;
    href = href.substring(href.lastIndexOf("/") + 1);
    toc = iframeContent.find('li a[href="' + href + '"]');
  }
  if (toc) {
    toc
      .parents("li")
      .first()
      .addClass("selected");
  }
}

function modifyClassLinks() {
  //fix class frame links in overview panel
  var jdSrc = $("#javadoc_container").attr("src");
  if (jdSrc.includes("microprofile")) {
    var iframeContent = $("#javadoc_container")
      .contents()
      .find(CLASS_FRAME)
      .contents();
    var version = jdSrc.substring(
      jdSrc.indexOf("microprofile") + 13,
      jdSrc.indexOf("microprofile") + 16
    );
    iframeContent.find(".overviewSummary tbody tr th a").each(function() {
      var port = window.location.port !== "" ? ":" + window.location.port : "";
      var package = $(this).attr("href");

      if (!package.includes(window.location.hostname)) {
        $(this).attr(
          "href",
          "https://" +
            window.location.hostname +
            port +
            "/docs/ref/microprofile/" +
            version +
            "/#package=allclasses-frame.html&class=" +
            package
        );
        //fix history links
        $(this).on("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          setIFrameContent(CLASS_FRAME, defaultHtmlRootPath + package);
          window.history.pushState(
            {
              iframeName: CLASS_FRAME,
              otherStateKey: defaultHtmlRootPath + package
            },
            "",
            "https://" +
              window.location.hostname +
              port +
              "/docs/ref/microprofile/" +
              version +
              "/#class=overview-summary.html&package=" +
              package +
              "/package-frame.html"
          );
        });
      }
    });

    //fix links for class frame in package panel
    iframeContent.find(".contentContainer .blockList ul a").each(function() {
      var port = window.location.port !== "" ? ":" + window.location.port : "";
      var package = $(this).attr("href");
      if (package.includes("../")) {
        package = package.substring(package.lastIndexOf("../") + 3);
      }

      if (!package.includes(window.location.hostname)) {
        $(this).attr(
          "href",
          "https://" +
            window.location.hostname +
            port +
            "/docs/ref/microprofile/" +
            version +
            "/#package=allclasses-frame.html&class=" +
            package
        );

        $(this).on("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          setIFrameContent(CLASS_FRAME, defaultHtmlRootPath + package);
          window.history.pushState(
            {
              iframeName: CLASS_FRAME,
              otherStateKey: defaultHtmlRootPath + package
            },
            "",
            $(this).attr("href")
          );
        });
      }
    });

    //fix links for class frame nav buttons
    iframeContent.find(".topNav .navList li a").each(function() {
      var port = window.location.port !== "" ? ":" + window.location.port : "";
      var package = $(this).attr("href");
      if (package.includes("../")) {
        package = package.substring(package.lastIndexOf("../") + 3);
      }
      if (!package.includes(window.location.hostname)) {
        $(this).attr(
          "href",
          "https://" +
            window.location.hostname +
            port +
            "/docs/ref/microprofile/" +
            version +
            "/#package=allclasses-frame.html&class=" +
            package
        );

        $(this).on("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          setIFrameContent(CLASS_FRAME, defaultHtmlRootPath + package);
          window.history.pushState(
            {
              iframeName: CLASS_FRAME,
              otherStateKey: defaultHtmlRootPath + package
            },
            "",
            $(this).attr("href")
          );
        });
      }
    });
  }
}

function modifyPackageTopLinks() {
  var jdSrc = $("#javadoc_container").attr("src");
  if (jdSrc.includes("microprofile")) {
    var iframeContent = $("#javadoc_container")
      .contents()
      .find(".leftTop iframe")
      .contents();
    var version = jdSrc.substring(
      jdSrc.indexOf("microprofile") + 13,
      jdSrc.indexOf("microprofile") + 16
    );
    iframeContent.find('ul[title="Packages"] li a').each(function() {
      var port = window.location.port !== "" ? ":" + window.location.port : "";
      var package = $(this).attr("href");
      if (package.includes("../")) {
        package = package.substring(package.lastIndexOf("../") + 3);
      }

      //look into implementing existing methods and ajax waiting
      if (!package.includes(window.location.hostname)) {
        $(this).attr(
          "href",
          "https://" +
            window.location.hostname +
            port +
            "/docs/ref/microprofile/" +
            version +
            "/#class=overview-summary.html&package=" +
            package
        );
        //find out how to load specific package to iframe
        $(this).on("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          setIFrameContent(PACKAGE_FRAME, defaultHtmlRootPath + package);
          window.history.pushState(
            {
              iframeName: ".leftTop iframe",
              otherStateKey: defaultHtmlRootPath + package
            },
            "",
            $(this).attr("href")
          );
        });
      }
    });
  }
}

function modifyPackageBottomLinks() {
  var jdSrc = $("#javadoc_container").attr("src");
  if (jdSrc.includes("microprofile")) {
    var iframeContent = $("#javadoc_container")
      .contents()
      .find(PACKAGE_FRAME)
      .contents();
    var version = jdSrc.substring(
      jdSrc.indexOf("microprofile") + 13,
      jdSrc.indexOf("microprofile") + 16
    );
    iframeContent.find(".indexContainer ul li a").each(function() {
      var port = window.location.port !== "" ? ":" + window.location.port : "";
      var c = $(this).attr("href");
      if (c.includes("../")) {
        c = c.substring(c.lastIndexOf("../") + 3);
      }

      if (!c.includes(window.location.hostname)) {
        if (
          iframeContent
            .find(".bar")
            .text()
            .trim()
            .replace(String.fromCharCode(160), " ") === "All Classes"
        ) {
          $(this).attr(
            "href",
            "https://" +
              window.location.hostname +
              port +
              "/docs/ref/microprofile/" +
              version +
              "/#package=allclasses-frame.html&class=" +
              c
          );
          //find out how to load specific package to iframe
          $(this).on("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            setIFrameContent(CLASS_FRAME, defaultHtmlRootPath + c);
            window.history.pushState(
              {
                iframeName: PACKAGE_FRAME,
                otherStateKey: defaultHtmlRootPath + c
              },
              "",
              $(this).attr("href")
            );
          });
        } else {
          var package = iframeContent.find(".bar").text();
          if (package.includes("../")) {
            package = package.substring(package.lastIndexOf("../") + 3);
          }
          package = package.replace(/\./g, "/");
          $(this).attr(
            "href",
            "https://" +
              window.location.hostname +
              port +
              "/docs/ref/microprofile/" +
              version +
              "/#package=" +
              package +
              "/package-frame.html&class=" +
              package +
              "/" +
              c
          );
          $(this).on("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            setIFrameContent(
              CLASS_FRAME,
              defaultHtmlRootPath + package + "/" + c
            );
            window.history.pushState(
              {
                iframeName: PACKAGE_FRAME,
                otherStateKey: defaultHtmlRootPath + c
              },
              "",
              "https://" +
                window.location.hostname +
                port +
                "/docs/ref/microprofile/" +
                version +
                "/#package=" +
                package +
                "/package-frame.html&class=" +
                package
            );
          });
        }
      }
    });
  }
}

if (window.self === window.top) {
  var params = new URLSearchParams(window.top.location.search);
  var dest = params.get("p");
  console.log(dest);
  if (dest && dest !== "" && dest !== "index.html") {
    console.log("entered");
    var port =
      window.top.location.port !== "" ? ":" + window.top.location.port : "";
    var pack = dest.substring(0, dest.lastIndexOf("/"));
    window.top.location.replace(
      "https://" +
        window.location.hostname +
        port +
        "/docs/ref/microprofile/3.3/#package=" +
        pack +
        "/package-frame.html&class=" +
        dest
    );
    return;
  }
}

$(document).ready(function() {
  $(window).on("resize", function() {
    resizeJavaDocWindow();
  });

  $("#javadoc_container").on("load", function() {
    resizeJavaDocWindow();
    addAccessibility();
    addExpandAndCollapseToggleButtons();
    addNavHoverListener();
    addLeftFrameScrollListener(".leftTop iframe", 'h2[title="Packages"]');
    addLeftFrameScrollListener(PACKAGE_FRAME, ".bar");
    addScrollListener();
    addClickListeners();
    addiPadScrolling();
    highlightTOC(".leftTop iframe");

    $("#javadoc_container")
      .contents()
      .find(PACKAGE_FRAME)
      .on("load", function() {
        modifyPackageBottomLinks();
        addClickListener($(this).contents());
        // add back the toggle expand/collapse button
        addExpandAndCollapseToggleButtonForPackageFrame(
          $(this).contents(),
          $("#javadoc_container")
            .contents()
            .find(".leftBottom")
        );
        addLeftFrameScrollListener(PACKAGE_FRAME, ".bar");
        highlightTOC(PACKAGE_FRAME);
      });

    $("#javadoc_container")
      .contents()
      .find(CLASS_FRAME)
      .on("load", function() {
        modifyClassLinks();
        addAccessibility();
        addNavHoverListener();
        addScrollListener();
        addClickListener($(this).contents());
      });

    $("#javadoc_container")
      .contents()
      .find(".leftTop iframe")
      .on("load", function() {
        modifyPackageTopLinks();
      });

    $("#javadoc_container")
      .contents()
      .find(CLASS_FRAME)
      .ready(function() {
        modifyClassLinks();
      });

    $("#javadoc_container")
      .contents()
      .find(".leftTop iframe")
      .ready(function() {
        modifyPackageTopLinks();
      });

    $("#javadoc_container")
      .contents()
      .find(PACKAGE_FRAME)
      .ready(function() {
        modifyPackageBottomLinks();
      });
    setDynamicIframeContent();

    window.onpopstate = function(event) {
      if (event.state) {
        $.each(event.state, function(key, value) {
          setIFrameContent(key, value);
        });
        // restore the height in case it is collapsed
        setPackageContainerHeight();
      } else {
        // This path is exercised with the initial page
        setIFrameContent(PACKAGE_FRAME, defaultPackageHtml);
        setIFrameContent(CLASS_FRAME, defaultClassHtml);
      }
    };
  });
});
