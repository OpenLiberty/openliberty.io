/*******************************************************************************
 * Copyright (c) 2020 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

// Setup and listen to version clicks if there is more than one version of a feature on the version picker.
function addVersionClick() {
  if ($(".feature_version").length === 1) {
    // If there's just one version, then disable the hover/click behavior for the version.
    $(".feature_version").css("cursor", "default");
    return;
  }
  var onclick = function(event) {
    var resource = $(event.currentTarget);
    var href = resource.attr("href");
    var url = window.location.href;
    var newUrl = url.substring(0, url.lastIndexOf("/")) + "/" + href;
    window.location.href = newUrl;
  };
  $(".feature_version").on("click", onclick);
}

function acivateNavMenu() {
  // Add active class to the nav-menu
  $(".nav-panel-menu").addClass("is-active");
}

function highlightSelectedVersion() {
  var url = window.location.href;
  var version = url.substring(url.lastIndexOf("/") + 1);
  var versionHref = $('.feature_version[href="' + version + '"]');
  if (versionHref.length === 1) {
    versionHref.addClass("feature_version_selected");
    var ariaLabel = versionHref.attr("aria-label");
    versionHref.attr("aria-label", ariaLabel + " selected");
  }
}

// Versioned features have a non-versioned page to support linking to the latest version of a feature without having to supply the version. E.g. link:docs/ref/feature/appSecurity.adoc will create appSecurity.html which redirects to the highest version of that feature (at the time), appSecurity-3.0.html. If there are versions for the current page but the current href doesn't match any of them, then we're on a versionless page that should be versioned, so we should redirect to the highest version of this feature.
function checkForNonVersionedPage() {
  if ($(".feature_version").length > 0) {
    var url = window.location.href;
    var urlWithoutHash = url;
    if (url.indexOf("#") > -1) {
      urlWithoutHash = url.substring(0, url.indexOf("#"));
    }
    var href = urlWithoutHash.substring(
      urlWithoutHash.indexOf("/reference/feature/") + 19
    );
    if ($('.feature_version[href="' + href + '"]').length === 0) {
      // Redirect to the highest version
      var href = $(".feature_version")
        .first()
        .attr("href");
      var newUrl = url.substring(0, url.lastIndexOf("/")) + "/" + href;
      window.location.href = newUrl;
    }
  }
}

// When loading the page, if the page from the url isn't selected in the TOC we need to look for its version in the TOC and highlight it since the multiple feature versions only have one TOC entry.
function selectTOC() {
  var first_version = $(".feature_version").first();
  var href = first_version.attr("href");
  if (!href) {
    // If the feature is a single version it won't have a version switcher at the top. Get the href from the url.
    href = window.location.href;
    href = href.substring(href.lastIndexOf("/") + 1);
  }
  // Look for toc under the features dropdown
  var featureDropdown = $("li > span").filter(function() {
    return this.innerText == "Features";
  });
  if (featureDropdown.length === 0) {
    featureDropdown = $("li > a.nav-link").filter(function() {
      return this.innerText == "Features";
    });
  }
  featureDropdown = featureDropdown.parent();
  var featureToc = featureDropdown.find("a.nav-link").filter(function() {
    var tocHref = $(this).attr("href");
    tocHref = tocHref.substring(tocHref.lastIndexOf("/") + 1);
    return href === tocHref;
  });
  if (featureToc.length > 0) {
    var li = featureToc.parent()[0];
    var anchor = li.querySelector(".nav-link");
    navigation.activateCurrentPath(li);
    navigation.scrollItemToMidpoint(anchor);
  }
}

$(document).ready(function() {
  checkForNonVersionedPage();
  addVersionClick();
  acivateNavMenu();
  highlightSelectedVersion();
  selectTOC();
});
