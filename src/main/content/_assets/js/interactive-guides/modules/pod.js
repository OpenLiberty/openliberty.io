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
var pod = (function(){

  var podType = function(container, stepName, content) {
    var deferred = new $.Deferred();
    this.stepName = stepName;
    this.contentRootElement = null;
    this.updateCallback = null;

    __loadAndCreate(this, container, stepName, content).done(function(result){
      deferred.resolve(result);
    });
    return deferred;
  };

  podType.prototype = {

    setContent: function(content, callback, append) {
       if (!content) {
         content = "";
         this.contentRootElement.html(content);
         return;
       }
       var extension = content.substring(content.length - 4).toLowerCase();
       var file =  extension === 'html' || extension === 'htm' ? true: false;
       if (file) {
         var thisPod = this;
         $.ajax({
           context: this.contentRootElement,
           url: content,
           async: true,
           cache: true,
           success: function(result) {

            if (append) {
              $(thisPod.contentRootElement).append($(result));
            } else {
              $(thisPod.contentRootElement).html($(result));
            }

            if(callback){
              callback = eval(callback);
              // Identify this pod instance with the updateCallback
              // function specified by the user.
              callback(thisPod);
            }            
           },
           error: function(result) {
             console.error("Could not load content for file " + file);
             $(thisPod.contentRootElement).html("");
           }
         });
       } else {
         this.contentRootElement.html(content);
       }

    },

    accessPodContent: function() {
      return this.contentRootElement;
    },

    getStepName: function() {
      return this.stepName;
    },

    // Registers a callback method with this pod instance.
    addUpdateListener: function(callback) {
       this.updateCallback = callback;
    }

  };


  var __loadAndCreate = function(thisPod, container, stepName, content) {
      var deferred = new $.Deferred();
      $.ajax({
        context: thisPod,
        url: "/guides/iguides-common/html/interactive-guides/pod.html",
        async: true,
        cache: true,
        success: function(result) {
          container.append($(result));
          thisPod.contentRootElement = container.find('.podContainer').first();          

          // fill in contents
          thisPod.setContent(content.content, content.callback);
          deferred.resolve(thisPod);
        },
        error: function(result) {
          console.error("Could not load pod.html");
          deferred.resolve(thisPod);
        }
      });
      return deferred;
  };

  var __create = function(container, stepName, content) {
    return new podType(container, stepName, content);
  };

  return {
    create: __create
  };
})();
