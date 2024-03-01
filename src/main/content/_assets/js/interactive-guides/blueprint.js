/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
var blueprint = (function(){
  var create = function(blueprintName) {
    __load().done(function(){
          __setupLocalSession();
          var steps = jsonGuide.getSteps(blueprintName);
          var defaultWidgets = jsonGuide.getStepsDefaultWidgets(blueprintName);
          var configWidgets = jsonGuide.getStepsConfigWidgets(blueprintName);
          stepContent.setSteps(steps, defaultWidgets, configWidgets);
          tableofcontents.create(steps);          
          stepContent.createGuideContents();
          iguideMultipane.initView();
      
          // Monitor for hash changes to show the requested page.
          // Hash changes occur when the URL is updated with a new hash
          // value (as in someone bookmarked one of the pages) or when a new
          // page is selected from the table of contents.
          // HashChange event processing also occurs in content\common-multipane.js.
          window.addEventListener("hashchange", function(){
            event.preventDefault();

            var hash = location.hash.substring(1);
            stepContent.setCurrentStepName(stepContent.getStepNameFromHash(hash));
          });

          if (window.location.hash !== "") {   
            handleFloatingTableOfContent();
            
            // The URL fragment indentifier (first hash (#) after the URL) indicates
            // the user requested a specific page within the guide.  Go to it.
            var hash = location.hash;
            accessContentsFromHash(hash);
            // Match the widgets on the right to id
            stepContent.showStepWidgets(hash.substring(1));
            stepContent.setCurrentStepName(stepContent.getStepNameFromHash(hash.substring(1)));
          } else {
            // no hash -> at the top of the guide
            accessContentsFromHash(location.hash);
            // Show the widgets on the right for Intro step
            stepContent.showStepWidgets(location.hash);
          }

          $(window).on('scroll', function(event) {
            // Check if a scroll animation from another piece of code is taking
            // place and prevent normal behavior.
            // NOTE: 'scrolling' flag is set in common-multipane.js accessContentsFromHash()
            //       to indicate when scrolling to a selected section is in progress.
            if($("body").data('scrolling') === true) {
                return;
            }
            handleSectionChanging(event);
          });
          setInitialTOCLineHeight();
          setupClipboardCopy();
    });    
  };
 
  var __load = function() {
    var deferred = new $.Deferred();
    $.ajax({
      url: "/guides/iguides-common/html/interactive-guides/blueprint.html",
      async: true,
      success: function (result) {
        $("#guide_content").append($(result));
        deferred.resolve();
      },
      error: function (result) {
        console.error("Could not load blueprint.html");
        deferred.resolve();
      }
    });
    return deferred;
  };

  var __setupLocalSession = function () {
    if (typeof (Storage) !== "undefined") {
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if (options.cache) {
          var success = originalOptions.success || $.noop,
            url = originalOptions.url;

          options.cache = false; //remove jQuery cache as we have our own localStorage
          options.beforeSend = function () {
            if (window.sessionStorage.getItem(url)) {
              success(window.sessionStorage.getItem(url));
              return false;
            }
            return true;
          };
          options.success = function (data, textStatus) {
            window.sessionStorage.setItem(url, data);
            if ($.isFunction(success)) {
              success(data); //call back to original ajax call
            }
          };
        }
      });
    }
  };

  var handleSectionChanging = function(event) {
    // Get the id of the section most in view
    var id = getScrolledVisibleSectionID();

    if (id !== null) {
      var windowHash = window.location.hash;
      var scrolledToHash = id === "" ? id : '#' + id;
      if (windowHash !== scrolledToHash) {
        // Update the URL hash with new section we scrolled into....
        var currentPath = window.location.pathname;
        var newPath = currentPath.substring(currentPath.lastIndexOf('/')+1) + scrolledToHash;
        // Not setting window.location.hash here because that causes an
        // onHashChange event to fire which will scroll to the top of the
        // section.  pushState updates the URL without causing an
        // onHashChange event.
        history.pushState(null, null, newPath);

        // Update the selected TOC entry
        updateTOCHighlighting(id);  // In toc-multipane.js in openliberty.io
      }
      stepContent.setCurrentStepName(stepContent.getStepNameFromHash(id));
    }
    
    if(window.innerWidth > twoColumnBreakpoint) {
      // Multipane view
      // Match the widgets on the right to the new id
      stepContent.showStepWidgets(id);
    }
  };

  var setupClipboardCopy = function() {

    $('#guide_column codeblock').each(function (){
      $(this).wrap('<div class="code_block_wrapper" title="Code block"></div>');  
    })
    $('.code_block_wrapper').each(function (){
        $(this).prepend('<div class="copied_confirmation">Copied to clipboard</div><input type="image" class="copy_to_clipboard" src="/img/guides_copy_button.svg" alt="Copy code block" title="Copy code block"/>');
    });

    $(document).on('click', '#copy_to_clipboard', function (event) {
        event.stopPropagation();
        target = $(this).siblings('#guide_column codeblock');
        openliberty.copy_element_to_clipboard(target, function () {});
        $(this).prev().fadeIn().delay(500).fadeOut()
    });
  }

  return {
    create: create
  };
})();