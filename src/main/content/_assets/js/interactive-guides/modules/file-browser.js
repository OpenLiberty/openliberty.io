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
var fileBrowser = (function() {


  var fileBrowserType = function(container, content, stepName) {
    var deferred = new $.Deferred();
    // Map of the step name to the contents for that step
    this.__fileBrowsers = {};

    this.__fileStructure = []; // JSON of the file browser structure
    var fileTree = content.fileBrowser;

    $.ajax({
      context: this,
      url: "/guides/iguides-common/html/interactive-guides/file-browser.html",
      async: true,
      cache: true,
      success: function(result) {
        container.append($(result));
        var fileBrowser = container.find('.fileBrowserContainer');

        this.__fileBrowserRoot = fileBrowser.find('.fileBrowser');
        fileBrowser.append(this.__fileBrowserRoot);

        fileBrowser.show();
        __parseTree(this, fileTree, null);

        this.__stepName = stepName;
        deferred.resolve(this);
      },
      error: function(result) {
        console.error("Could not load the file-browser.html");
        deferred.resolve(this);
      }
    });
    return deferred;
  };

  var __parseTree = function(thisObj, fileTree, parent) {
    if (!fileTree) {
      return;
    }
    for (var i = 0; i < fileTree.length; i++) {
      var elem = fileTree[i];
      var isDirectory = elem.type === 'directory';
      var showImmediately = elem.showImmediately ? elem.showImmediately : false;
      thisObj.addFileElement(elem.name, parent ? parent.name : null, isDirectory, showImmediately);
      if (isDirectory && elem.files) {
        __parseTree(thisObj, elem.files, elem);
      }
    }
  };


  fileBrowserType.prototype = {

    getStepName: function(){
      return this.__stepName;
    },

    /*
      Find the specified name within the file browser JSON.
      Inputs: {String} name: Name of the file/directory to find.
              {Object} dir: Directory
    */
    __findElement: function(name, dir) {
      var found = null;
      for (var i = 0; i < dir.length; i++) {
        var elem = dir[i];
        if (elem.name === name) {
          return elem;
        } else {
          if (elem.type === 'directory' && elem.files) {
            // Check the files/directories under the directory
            found = this.__findElement(name, elem.files);
            if (found) {
              return found;
            }
          }
        }
      }

      // If no elements are found in the directory return null
      return found;
    },

    /*
      Gets the jQuery DOM element using the data-name attribute.
    */
    __getDomElement: function(name) {
      return this.__fileBrowserRoot.find($("[data-name='" + name + "']"));
    },

    /*
      Insert the file or directory alphabetically into the container array
    */
    __insertSorted: function($elem, container) {
      var index = 0;
      var val = $elem.text();
      var siblings = container.children();

      // Empty container
      if (siblings.length === 0) {
        container.append($elem);
      } else {
        while (index < siblings.length && val.localeCompare($(siblings.get(index)).find('.fileBrowseSpan').text()) === 1) {
          index++;
        }
        // If reached the end of the siblings then append at the end
        if (index === siblings.length) {
          container.append($elem);
        }
        // Otherwise, append the $elem before the first sibling with a greater value
        else{
          var $sibling = $(siblings.get(index));
          $sibling.before($elem);
        }
      }
      // Initially close the added directory
      if ($elem.hasClass('fileBrowserDirectory')) {
        this.__closeDirectory($elem);
      }
    },


    /**
     * Creates a file
     * @param name - name of file
     * @param parent - (optional) Where to create file. If not provided, it will be created in the root directory.
     */
    addFile: function(name, parent) {
      this.addFileElement(name, parent, false, true);
    },

    /*
        Creates a directory
        Inputs: {String} name: name of directory to create
                {String} parent (optional): Where to create the directory. If not provided, it will create it in the root directory.
     */
    mkdir: function(name, parent) {
      this.addFileElement(name, parent, true);
    },

    /*
      Move a file from src to dest
      Inputs: {String} name: name of file to move
              {String} src: name of source directory
              {String} dest: name of destination directory. If not provided, it will move it to the root directory.
    */
    mv: function(name, src, dest) {
      // Move file structure
      var destElem;
      if (dest) {
        destElem = this.__findElement(dest, this.__fileStructure);
        if (!destElem) {
          //console.log("Destination directory does not exist: " + dest);
          return;
        }
      } else {
        destElem = this.__fileStructure;
      }

      var parent;
      if (src) {
        parent = this.__findElement(src, this.__fileStructure);
        if (!parent || !parent.files) {
          //console.log("Source directory does not exist: " + src);
          return;
        }
      } else {
        parent = this.__fileStructure;
      }

      // Find the index of the elem in the parent, remove it, and add it to the destination
      var index = parent.files.findIndex(function(file) {
        return (file.name === name);
      });
      if (index === -1) {
        //console.log("File or directory: " + name + " to move does not exist in the source directory");
        return;
      }
      var elem = parent.files.splice(index, 1)[0]; // Returns the element and removes it from the parent
      if (destElem.files) {
        destElem.files.push(elem);
      } else {
        // Root directory
        destElem.push(elem);
      }

      // Move the dom element from the source to destination
      $elem = this.__getDomElement(name);
      $destElem = dest ? this.__getDomElement(dest) : this.__fileBrowserRoot;
      this.__insertSorted($elem.detach(), $destElem);
      if (!$destElem.is(":visible")) {
        $elem.hide();
      } else {
        $elem.show();
      }
    },

    /*
      Creates a file or directory and adds it to the file browser.
      Inputs:
              {String} name: Name of the new file/directory to be created.
              {String} parent: Name of the parent DOM element.
              {Boolean} isDirectory: true if the element will be a directory / false if it is just a file,
              {Boolean} showImmediately (optional): true if the file and its parents should be shown immediately
    */
    addFileElement: function(name, parent, isDirectory, showImmediately) {
      // If file already exists return
      if(this.__getDomElement(name).length > 0){
        return;
      }

      var $domElem = $("<div></div");
      $domElem.attr('aria-label', name);
      $domElem.attr('tabindex', '0');
      $domElem.attr('data-name', name);
      $domElem.addClass('fileBrowserElement');

      var img = $("<span class='fileBrowseIcon'/>");
      if (isDirectory) {
        img.addClass('glyphicon glyphicon-folder-close');
      } else {
        img.addClass('glyphicon glyphicon-file');
      }
      $domElem.append(img);

      var span = $("<span class='fileBrowseSpan'></span>");
      span.text(name);
      $domElem.append(span);

      var elemStructure = {};
      elemStructure.name = name;
      if (isDirectory) {
        elemStructure.type = 'directory';
        elemStructure.files = [];
        $domElem.addClass('fileBrowserDirectory');
      } else {
        elemStructure.type = 'file';
        $domElem.addClass('fileBrowserFile');
      }

      this.__addOnClickListener($domElem);

      // If no parent is specified then create the element under the root level
      if (!parent) {
        $domElem.attr('data-treeLevel', 0);
        this.__fileStructure.push(elemStructure);
        this.__insertSorted($domElem, this.__fileBrowserRoot);
      } else {
        // Find the parent element in the fileBrowser object
        var parentDir = this.__findElement(parent, this.__fileStructure);
        var $parentDomElem = this.__getDomElement(parent);
        var treeLevel = $parentDomElem.attr('data-treeLevel');
        $domElem.attr('data-treeLevel', treeLevel + 1);
        this.__insertSorted($domElem, $parentDomElem);

        // Hide the element to start if it is not top-level
        if(showImmediately){
          // Open all of the parent directories if they are not open
          var me = this;
          var parents = $domElem.parents('.fileBrowserDirectory');
          $.each(parents, function(i, parent){
              var $parent = $(parent);
              if($parent.hasClass('directory_collapsed')){
                me.__openDirectory($parent);
              }
          });
        }
        else {
          $domElem.hide();
        }

        // Only if the parent is a directory, add the file under it. If the parent is not a directory,
        // then we can't add the new file to it so add it to the root level directory.
        if (parentDir.type === 'directory') {
          parentDir.files.push(elemStructure);
        } else {
          this.__fileStructure.push(elemStructure);
        }
      }
    },

    __addOnClickListener: function($elem) {
      var me = this;
      $elem.on("keydown", function(event) {
        event.stopPropagation();
        if (event.which === 13 || event.which === 32) { // Enter key, Space key
          me.__handleClick($elem);
          $elem.focus();
        }
      });
      $elem.on("click", function(event) {
        event.stopPropagation();
        me.__handleClick($elem);
      });
    },

    __openDirectory: function($elem) {
      $elem.removeClass('directory_collapsed');
      $elem.addClass('directory_expanded');
      $elem.children('.fileBrowserElement').attr('tabindex', '0'); // Using filter selector to only affect the first generation of children
      $elem.children('div').show();

      // Change the directory image to open
      $elem.find('.fileBrowseIcon').first().removeClass('glyphicon-folder-close').addClass('glyphicon-folder-open');
    },

    __closeDirectory: function($elem) {
      // Collapse directory and its children
      $elem.removeClass('directory_expanded');
      $elem.addClass('directory_collapsed');
      $elem.children('.fileBrowserElement').attr('tabindex', '-1'); // Using filter selector to only affect the first generation of children
      $elem.children('div').hide();

      // Change the directory image to closed
      $elem.find('.fileBrowseIcon').first().removeClass('glyphicon-folder-open').addClass('glyphicon-folder-close');
    },

    __handleClick: function($elem) {
      if ($elem.hasClass('fileBrowserDirectory')) {
        if ($elem.hasClass('directory_collapsed')) {
          this.__openDirectory($elem);
        } else {
          this.__closeDirectory($elem);
        }
      } else {
        // TODO: Figure out what to do when the user clicks on a file.
      }
    }
  };

  var __create = function(container, content, stepName) {
    var newFileBrowser = new fileBrowserType(container, content, stepName);
    return newFileBrowser;
  };


  return {
    create: __create
  };
})();
