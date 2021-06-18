/*******************************************************************************
 * Copyright (c) 2019 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
var navScroll = (function() {
  $(document).ready(function() {
    var scrollAllowed = true;
    var prevScrollTop = 0;
    $(window).scroll(function() {
      if (!scrollAllowed) {
        return;
      }
      var currScrollTop = $(this).scrollTop();
      // if scrolled past nav bar, determine whether to hide or show nav bar
      if ($(".nav-panel-explore").hasClass("is-active")) {
        showNav();
      } else if (currScrollTop > $("#nav_bar").outerHeight()) {
        // make docs toolbar position sticky once you scroll past nav bar
        $(".toolbar").css("position", "sticky");

        // if scrolling down, hide nav bar
        if (currScrollTop > prevScrollTop) {
          hideNav();
        }
        // if scrolling up, show nav bar
        else {
          showNav();
        }
      } else {
        $("#code_column").css({ position: "absolute", top: "" });
        $(".toolbar").css({ position: "static", top: "" });
        $(".nav").css("top", "");
      }

      // When page scrolled back to top: Make nav bar no longer fixed, reset body margin-top
      if (currScrollTop == 0) {
        $("#nav_bar").removeClass("fixed_top");
        $("body").css("margin-top", "0px");
        $("#toc_column").css({ position: "", top: "" });
      }

      // make toc scroll off of screen at Nice Work section in guides
      if (typeof isBackgroundBottomVisible === "function") {
        if (isBackgroundBottomVisible()) {
          handleTOCScrolling();
        }
      }

      prevScrollTop = currScrollTop;
    });

    $(window).on("resize", function() {
      if (
        $(".toolbar").css("position") == "sticky" &&
        $("#nav_bar").hasClass("fixed_top")
      ) {
        $(".toolbar").css("top", $("#nav_bar").outerHeight() + "px");
      }
    });
  });

  // slide nav bar into view, move down elements that are fixed to top of screen
  function showNav() {
    var nav_height = $("#nav_bar").outerHeight();

    // fix nav bar to top of screen
    $("#nav_bar").addClass("fixed_top");
    $("#nav_bar").css("top", "0px");

    // push toc column, toc indicator and code column down below nav bar
    $("#toc_column").css("top", nav_height + "px");
    if (window.outerWidth > 1440) {
      $("#toc_inner").css("margin-top", nav_height + "px");
    }
    $("#toc_indicator").css("margin-top", nav_height + "px");
    $("#code_column").css({ position: "fixed", top: nav_height + "px" });

    // add margin-top to body so page doesn't jump when nav slides into view
    $("body").css("margin-top", nav_height + "px");

    // in guides, if mobile toc accodion is fixed to top of screen, move toc accordion below fixed nav bar
    if ($("#mobile_toc_accordion_container").hasClass("fixed_toc_accordion")) {
      $("#mobile_toc_accordion_container").css("top", nav_height + "px");
    }

    // on /guides, if tablet toc accordion is fixed to top of screen, move toc accordion below fixed nav bar
    if ($("#tablet_toc_accordion_container").css("position") === "fixed") {
      $("#tablet_toc_accordion_container").css("top", nav_height + "px");
    }

    // adjust docs toolbar and nav position
    $(".toolbar").css("top", nav_height + "px");
    if (window.outerWidth < 1024) {
      $(".nav-container").css(
        "top",
        nav_height + $(".toolbar").outerHeight() + "px"
      );
      $(".nav").css("top", "");
    } else {
      $(".nav").css("top", nav_height + "px");
    }

    // move config breadcrumb down when nav bar in view
    $(".contentStickyBreadcrumbHeader").css(
      "top",
      nav_height + $(".toolbar").outerHeight() + "px"
    );
  }

  // slide nav bar back out of view, reset elements that were pushed down
  function hideNav() {
    // reset nav bar and move off screen
    $("#nav_bar").removeClass("fixed_top");
    $("#nav_bar").css({ top: "-60px" });

    // reset toc column, toc indicator and code column position
    $("#toc_column").css("top", "0px");
    if (window.outerWidth > 1440) {
      $("#toc_inner").css("margin-top", "0px");
    }
    $("#toc_indicator").css("margin-top", "0px");
    $("#code_column").css({ position: "fixed", top: "0px" });

    // reset body margin-top
    $("body").css("margin-top", "0px");

    // fix mobile and tablet toc accordion to top of screen again
    $("#mobile_toc_accordion_container").css("top", "0px");
    $("#tablet_toc_accordion_container").css("top", "0px");

    // adjust docs toolbar and nav position
    $(".toolbar").css("top", "0px");
    if (window.outerWidth < 1024) {
      $(".nav-container").css("top", $(".toolbar").outerHeight() + "px");
      $(".nav").css("top", "");
    } else {
      $(".nav-container").css("top", "");
      $(".nav").css("top", "");
    }

    // move config breadcrumb back up when nav bar slides out of view
    $(".contentStickyBreadcrumbHeader").css(
      "top",
      $(".toolbar").outerHeight() + "px"
    );
  }

  function preventScrolling() {
    scrollAllowed = false;
  }

  function allowScrolling() {
    scrollAllowed = true;
  }

  return {
    showNav: showNav,
    hideNav: hideNav,
    preventScrolling: preventScrolling,
    allowScrolling: allowScrolling
  };
})();
