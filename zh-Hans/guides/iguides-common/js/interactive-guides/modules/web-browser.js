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
var webBrowser = (function(){

  var webBrowserType = function(container, stepName, content) {
    var deferred = new $.Deferred();
    this.stepName = stepName;
    this.contentRootElement = null;
    this.updatedURLCallback = null;    // User-defined callback function
                                       // invoked when the URL is updated

    if (content.url) {
      this.webURL = content.url;
    } else {
      this.webURL = "";
    }

    if (content.browserContent) {
      this.webContent = content.browserContent;
    } else {
      this.webContent = "";
    }

    if (content.statusBarText) {
      this.webStatusBar = content.statusBarText;
    } else {
      this.webStatusBar = "";
    }

    __loadAndCreate(this, container, stepName, content).done(function(result){
      deferred.resolve(result);
    });
    return deferred;
  };

  webBrowserType.prototype = {
    noContentFiller: "<div> NO CONTENT </div>",

    setURL:  function(URLvalue) {
      if (!URLvalue) {
        URLvalue = "";
      }
      this.contentRootElement.find('.wbNavURL').val(URLvalue);
    },
    getURL:  function() {
      return this.contentRootElement.find('.wbNavURL').val();
    },

    setBrowserContent: function(content) {
      var $webContentElement = this.contentRootElement.find('.wbContent');
      var $iframe = $webContentElement.find('iframe');

      if (!content) {
        $iframe.attr('src', "about:blank");
        return;
      }

      var extension = content.substring(content.length - 4).toLowerCase();
      var file =  extension === 'html' || extension === 'htm' ? true: false;
      if (file) {
        var fileLocation = content;
        $iframe.attr('src', fileLocation);

        /* Do we need to try to see if the file is available?
           We should know 'content' is available as an author of the guide.
           This basically fetches the same data twice....a waste?
        $(function(){
          $.ajax({
            type: "HEAD",
            async: true,
            url: fileLocation
          })
          .success(function() {
            $iframe.attr('src', fileLocation);
          })
          .error(function() {
            // Handle error ... show 404 or 500 message?
          })
        });  */
      } else {
        $iframe.attr('src', "about:blank");
      }
    },
    getIframeDOM: function() {
      var $iframe = this.contentRootElement.find('.wbContent').find('iframe');
      var iFrameDOM = $iframe.contents();
      return iFrameDOM;
    },

    setBrowserStatusBar:  function(statusBarText) {
      if (statusBarText) {
        this.contentRootElement.find('.wbStatusBar').removeClass('invisible');
        this.contentRootElement.find('.wbStatusBar').empty();
        this.contentRootElement.find('.wbStatusBar').append(statusBarText);
        this.contentRootElement.find('.wbStatusBar').attr('title', statusBarText);
      }
    },

    enableBrowserOverlay: function(overlayText) {
      this.contentRootElement.addClass("wbOverlay");
      if (overlayText !== undefined) {
        this.contentRootElement.find(".wbOverlayText").append(overlayText);
      }
    },

    disableBrowserOverlay: function() {
      this.contentRootElement.removeClass('wbOverlay');
      this.contentRootElement.find(".wbOverlayText").empty();
    },

    enableStatusBar: function(enable) {
      __enableStatusBar(this, enable);
    },

    simulateBrowserRefresh: function() {
      if (this.updatedURLCallback) {
        this.updatedURLCallback(this.getURL());
      } else {   // This webBrowser does not support URL changes.  Redisplay current HTML.
        this.setURL(this.webURL);
        this.setBrowserContent(this.webContent);
        this.setBrowserStatusBar(this.webStatusBar);
      }
    },

    getStepName: function() {
      return this.stepName;
    },

    // Registers a callback method with this webBrowser
    // instance.  It will be invoked when the URL is updated
    // or the Refresh button is selected and will receive the
    // navbar URL value as a parameter.  The function can
    // then identify the browser contents associated with the
    // URL value.
    addUpdatedURLListener: function(callback) {
       this.updatedURLCallback = callback;
    },

    setURLFocus: function() {
      this.contentRootElement.find('.wbNavURL').trigger('focus');
    },

    enableRefreshButton: function(enable) {
      if (enable === true) {
        this.contentRootElement.find('.wbRefreshButton').removeClass('wbNavButtonDisabled');
        this.contentRootElement.find('.wbRefreshButton').addClass('wbNavButtonActive');
      } else {
        this.contentRootElement.find('.wbRefreshButton').removeClass('wbNavButtonActive');
        this.contentRootElement.find('.wbRefreshButton').addClass('wbNavButtonDisabled');
      }
    },

    enableURLField: function(enable) {
      if (enable === true) {
          this.contentRootElement.find('.wbNavURL').prop('disabled', false);
      } else {
          this.contentRootElement.find('.wbNavURL').prop('disabled', true);
      }
    }
  };


  var __loadAndCreate = function(thisWebBrowser, container, stepName, content) {
      var deferred = new $.Deferred();
      $.ajax({
        context: thisWebBrowser,
        url: "/guides/iguides-common/html/interactive-guides/web-browser.html",
        async: true,
        cache: true,
        success: function(result) {
          container.append($(result));
          thisWebBrowser.contentRootElement = container.find('.wb');
          var $wbNavURL = thisWebBrowser.contentRootElement.find('.wbNavURL');
          var $wbContent = thisWebBrowser.contentRootElement.find('.wbContent');
          var $wbStatusBar = thisWebBrowser.contentRootElement.find('.wbStatusBar');

          // set aria labels
          thisWebBrowser.contentRootElement.attr('aria-label', messages.browserSample);
          $wbNavURL.attr('aria-label', messages.browserAddressBar);
          $wbContent.attr('aria-label', messages.browserContentIdentifier);
          $wbStatusBar.attr('aria-label', messages.browserStatusBar);
          thisWebBrowser.contentRootElement.find('.wbRefreshButton').attr('aria-label', messages.browserRefreshButton);
          thisWebBrowser.contentRootElement.find('.wbRefreshButton').attr('title', messages.browserRefreshButton);

          // set browser height
          if (content.height !== undefined) {
            container.find('.wb').css({
              "height": content.height
            });
          }

          // Select URL text when in focus
          $wbNavURL.on('focus', function() {
              $(this).select();
          });

          if (content.callback) {
            var callback = eval(content.callback);
            // Identify this webBrowser with the updatedURLCallback
            // function specified by the user.
            callback(thisWebBrowser);
          }

          __addBrowserListeners(thisWebBrowser);

          if (content.enableRefreshButton != undefined) {
            // The Refresh button is automatically enabled.  However at creation
            // you can select to disable the button for this web browser instance.
            thisWebBrowser.enableRefreshButton(content.enableRefreshButton);
          }

          if (content.enableStatusBar !== undefined) {
            __enableStatusBar(thisWebBrowser, content.enableStatusBar);
          }

          // make the refresh and url field have the same enable-disable
          // value as the web browser (undefined assumed to be true)
          if ((content.enable !== undefined) && (content.enable === false)) {
            thisWebBrowser.enableURLField(false);
            thisWebBrowser.enableRefreshButton(false);
          } 

          // fill in contents
          thisWebBrowser.setURL(thisWebBrowser.webURL);
          thisWebBrowser.setBrowserContent(thisWebBrowser.webContent);
          thisWebBrowser.setBrowserStatusBar(thisWebBrowser.webStatusBar);
          deferred.resolve(thisWebBrowser);
        },
        error: function(result) {
          console.error("Could not load web-browser.html");
          deferred.resolve(thisWebBrowser);
        }
      });
      return deferred;
  };

  var __addBrowserListeners = function(thisWebBrowser) {
    var urlField = thisWebBrowser.contentRootElement.find('.wbNavURL');
    urlField.on("keydown", function(event) {
      if (event.which === 13) {  // Enter key
        if (thisWebBrowser.updatedURLCallback) {
          thisWebBrowser.updatedURLCallback(thisWebBrowser.getURL());
        }  else {
          // else, reset to original.  This webBrowser instance does
          // not support URL changes.
          thisWebBrowser.setURL(thisWebBrowser.webURL);
          thisWebBrowser.setBrowserContent(thisWebBrowser.webContent);
          thisWebBrowser.setBrowserStatusBar(thisWebBrowser.webStatusBar);
        }
      }
    });

    var refreshButton = thisWebBrowser.contentRootElement.find('.wbRefreshButton');
    if (thisWebBrowser.updatedURLCallback) {
      refreshButton.on("click", function(event) {
        event.stopPropagation();
        thisWebBrowser.updatedURLCallback(thisWebBrowser.getURL());
      });
    } else {   // This webBrowser does not support URL changes.  Redisplay current HTML.
      //console.log(thisWebBrowser.webURL);
      //console.log(thisWebBrowser.webContent);
      refreshButton.on("click", function(event) {
        thisWebBrowser.setURL(thisWebBrowser.webURL);
        thisWebBrowser.setBrowserContent(thisWebBrowser.webContent);
        thisWebBrowser.setBrowserStatusBar(thisWebBrowser.webStatusBar);
      });
    }
  };

  var __enableStatusBar = function(thisWebBrowser, enable) {
    if (enable === true || enable === "true") {
      thisWebBrowser.contentRootElement.find('.wbStatusBar').show();
    } else {
      // treat any other values to indicate a false value
      thisWebBrowser.contentRootElement.find('.wbStatusBar').hide();
    }
  };

  var __create = function(container, stepName, content) {
    return new webBrowserType(container, stepName, content);
  };

  return {
    create: __create
  };
})();
