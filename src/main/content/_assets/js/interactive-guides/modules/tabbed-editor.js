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
var tabbedEditor = (function() {

    var tabbedEditorType = function(container, stepName, content) {
        /**
         * This widget forms a tabbed editor. 
         * The tabbed editor may have the following flag:
         *   - "enable"  - true or false indicating if the tabbedEditor widget is enabled.
         *       If false, all editors within the tabbedEditor will be disabled, which means
         *       all buttons will be deactivated and the text cannot be updated.  This 
         *       differs from READ-ONLY because with READ-ONLY the copy button is still
         *       active and a banner indicating that the editor is Read-only is at the top of
         *       the editor.
         * 
         * The tabbed editor contains an array of fileEditor widgets as the "editorList" 
         * element of its content.  Content may also contain
         *  - "activeTab"- the fileName of the editor that you want to be active,
         *                 or have focus.  If "activeTab" is not specified,
         *                 then we default to the first tab as the active tab.
         *  - "callback" - callback method invoked during tabbedEditor creation to
         *                 register method for the following event
         *                      - addActiveTabChangeListener - invoked when the active tab changes.
         *
         * To Create Example JSON:
         *         {
         *             "name": "MyStep",
         *             "title": Test Step",
         *             "description": [
         *                 "Trying out tabbed editor."
         *             ],
         *             "content": [
         *                 {
         *                     "displayType": "tabbedEditor",
         *                     "editorList": [
         *                         {
         *                             "displayType": "fileEditor",
         *                             "fileName": "server.xml",
         *                             "preload": [
         *                               "<?xml version=\"1.0\"?>",
         *                               "<server description=\"Sample Liberty server\">",
         *                               "   <featureManager>",
         *                               "      <feature>cdi-1.2</feature>",
         *                               "   </featureManager>",
         *                               "</server>"
         *                             ]
         *                         },
         *                         {
         *                             "displayType":"fileEditor",
         *                             "fileName": "BankService.txt",
         *                             "preload": [
         *                                 "Just some junk on the Bank Service."
         *                             ],
         *                             "save": true
         *                         }
         *                     ],
         *                     "activeTab": "BankService.txt",
         *                     "callback": "(function test(tabbedEditor) {guideXXXCallBack.listenToTabEditorChange(tabbedEditor); })"
         *                 }
         *             ]
         *         }
         */
        var deferred = new $.Deferred();

        this.stepName = stepName;
        this.editorList = {};                 // Tracks editor widget objects by tab id
        this.activeTabChangeCallback = null;  // User-defined callback function
                                              // invoked when the #active tab changes.
        
        this.enabled = true;  // Default the tabbedEdditor to be enabled, unless content
                              // indicates "enable": false.
        if (content.enable !== undefined && (content.enable === false || content.enable === "false")) {
            // A disabled tabbed editor contains all disabled editors where no action can occur
            // with the file or editor buttons.
            this.enabled = false;
        }

        __loadAndCreate(this, container, stepName, content).done(function(result){
            deferred.resolve(result);
        });
        return deferred;
    };

    tabbedEditorType.prototype = {

        /**
         * Adds a new editor to the END of the TabbedEditor.
         *
         * @param {} editorInfo - object to create a FileEditor widget.
         */
        addEditor: function(editorInfo) {
            // New tabs will be added to the end of the existing tabs
            var numTabs = this.$teTabList.find('a').length;

            // A fileName must be specified for each editor.
            // Editor preload, readonly, save, and callback fields are optional.
            // See editor.js for more information.
            if (!editorInfo.fileName) {
                editorInfo.fileName = "Tab-" + numTabs;
            }

            // Create the dom elements for the new editor

            // Unique editor ID
            var editorName = 'teTab-' + this.stepName + '-editor' + this.displayTypeNum + '-tab' + numTabs;

            // Tab....
            var $tabItem = $("<li role='presentation' style='" + this.cssWidthValue + ": " + this.tabSize + ";'><a role='tab' href='#" + editorName + "' aria-label='" + editorInfo.fileName + "' title='" + editorInfo.fileName + "' >" + editorInfo.fileName + "</a></li>");
            var thisTabbedEditor = this;
            $tabItem.on('click', 'a', function(e){
                // Prevent the anchor's default click action
                e.preventDefault();

                var originalActiveFileName;
                var newActiveFileName = this.innerHTML;
                var activeTabChanged = false;

                if (thisTabbedEditor.$active) {
                    currentActiveFileName = thisTabbedEditor.$active[0].innerHTML;
                    if (currentActiveFileName !== newActiveFileName) {
                        // Tab and contents are changing....
                        activeTabChanged = true;
                        // Make the old tab inactive.
                        thisTabbedEditor.$active.removeClass('active');   // <a> element
                        thisTabbedEditor.$active.parent().css(thisTabbedEditor.cssWidthValue, thisTabbedEditor.tabSize );  // <li> element
                    } else {
                        // User clicked currently active tab.  No need to switch anything.
                        return;
                    }
                }

                // Hide the old tab contents.
                if (thisTabbedEditor.$content) {
                    thisTabbedEditor.$content.hide();
                }

                // Update the variables with the new link and content
                thisTabbedEditor.$active = $(this);   // <a> element
                thisTabbedEditor.$content = $(this.hash);

                // Make the new tab active.
                thisTabbedEditor.$active.addClass('active');     // <a> element
                thisTabbedEditor.$active.parent().css(thisTabbedEditor.cssWidthValue, thisTabbedEditor.activeTabSize);  // <li> element
                thisTabbedEditor.$content.show();

                if (activeTabChanged) {
                    // call the editor to adjust the content height if alert is shown
                    var editor = thisTabbedEditor.getEditorByFileName(newActiveFileName);
                    editor.resizeContent();
                }

                if (activeTabChanged && thisTabbedEditor.activeTabChangeCallback) {
                    thisTabbedEditor.activeTabChangeCallback(newActiveFileName);
                }
            });
            this.$teTabList.append($tabItem);

            // Content.....create hidden
            var $tabContent = $("<div id='" + editorName + "' class='teTabContent'  role='tabpanel' aria-label='" + editorInfo.fileName + " editor.'></div>");
            this.$teTabContents.append($tabContent);
            // Add the editor to the div
            editor.create($tabContent, this.stepName, editorInfo).done(function(newEditor) {
                // Remove the editor's file name that appears above a single editor
                $tabContent.find('.editorFileName').parent().remove();
                thisTabbedEditor.editorList[editorName] = newEditor;
                newEditor.setTabbedEditor(thisTabbedEditor);
            });
        },

        /**
         * Tabs are created as part of a list such as...
         *          <ul>
         *              <li><a>File.name</a></li>
         *              <li><a>File2.name</a></li>
         *          </ul>
         *
         * This method returns the JQuery object representing the <a> tag
         * associated with the tab for the provided fileName.
         *
         * @param {String} fileName of an editor within the TabbedEditor
         * @returns {} JQuery object representing the <a> tag of the tab
         */
        findEditorTabByFileName: function(fileName) {
            var tabList = this.$teTabList.find('li');
            var tab = undefined;
            for(var i=0; i<tabList.length; i++) {
                if (tabList[i].textContent === fileName) {
                    tab = $(tabList[i]).find('a');
                    break;
                }
            }
            return tab;   // JQuery object of the 'a' element of the tab || undefined
        },

        /**
         * Tabs are created as part of a list such as...
         *          <ul>
         *              <li><a href='#tab1'>File.name</a></li>
         *              <li><a href='#tab2'>File2.name</a></li>
         *          </ul>
         *
         * The href associated with each <a> tag has a corresponding
         * <div> tag with the same id as the href.
         *          <div id='tab'> Tab Editor Contents </div>
         *
         * This method returns this id value.
         *
         * NOTE: Each tabbed-editor object has a editorList object whose
         * members are these id values and their values are a pointer
         * to the FileEditor widget object.
         *
         * @param {String} fileName of an editor within the TabbedEditor
         * @returns {String} id value of the tab associated with the
         *          provided filename or undefined.
         */
        getEditorTabIdByFileName: function(fileName) {
            var tab = this.findEditorTabByFileName(fileName);
            if (tab) {      // Tab is the JQuery object of the 'a' element of the tab
                return (tab[0].hash.substring(1));  // Remove '#' char in front to just return the ID
            }
            return undefined;
        },

        /**
         * Returns the FileEditor widget object for the specified
         * file name within this tabbed editor.
         *
         * @param {String} fileName
         * @returns {} FileEditor object associated with provided fileName
         */
        getEditorByFileName: function(fileName) {
            var id = this.getEditorTabIdByFileName(fileName);
            if (id) {
                return this.editorList[id];
            }
            return undefined;
        },

        /**
         * Issues a click event for the tab associated with the specified
         * fileName to bring it into focus.
         *
         * @param {String} fileName of an editor within the TabbedEditor
         * @returns {} JQuery object representing the <a> tag of the tab ||
         *             undefined if it was not found.
         */
        focusTabByFileName: function(fileName) {
            var tab = this.findEditorTabByFileName(fileName);
            if (tab) {
                tab.trigger('click');
            }
            return tab;
        },

        /**
         * Returns the fileName of the currently active tab.
         *
         * @returns {String} fileName
         */
        getActiveTabFileName: function() {
            if (this.$active) {
                return this.$active[0].innerHTML;
            } else {
                return undefined;
            }
        },

        getStepName: function() {
            return this.stepName;
        },

        // Registers a callback method with this tabbedEditor
        // instance.  It will be invoked when the active tab
        // is changed.
        addActiveTabChangeListener: function(callback) {
           this.activeTabChangeCallback = callback;
        },

        resize: function() {
            var widget = $('.subContainerDiv:visible').get(1);
            if(widget){
                // Get height of widget next to the tabbed editor
                var widgetHeight = $(widget).height();
                if ($(widget).find(".podContainer").length === 1) {
                    widgetHeight = widgetHeight - 30;  // minus the podContainer padding bottom
                }               

                // Adjust the height of the editorContent to match the pod/browser
                var editorContainer = this.tabsRootElement.find('.editorContainer:visible');

                // Store original height if not set yet.
                if(!editorContainer.prop('data-originalHeight')){
                    editorContainer.prop('data-originalHeight', editorContainer.height());
                }                   

                // editor's height = pod/browser height - height of the tabbed editor's tabs - height of the editor buttons
                var editorButtonsHeight = this.tabsRootElement.find('.editorButtonFrame:visible').height();
                var editorTabsHeight = this.tabsRootElement.find('.teTabs:visible').height();
                var newHeight = widgetHeight - editorButtonsHeight - editorTabsHeight; 

                // If the original height is taller than the new calculated height, keep the original height
                if(newHeight > 0 && newHeight > editorContainer.height()){
                    editorContainer.css('height', newHeight);  
                }                
            } 
        },
 
        markEditorTabWithErrorByFileName: function(fileName) {
            var tab = this.findEditorTabByFileName(fileName);
            tab.addClass('errorInTab');
            tab.attr("aria-label", 'Error in ' + fileName);
        },

        resetEditorTabWithNoErrorByFileName: function(fileName) {
            var tab = this.findEditorTabByFileName(fileName);
            tab.removeClass('errorInTab');
            tab.attr("aria-label", fileName);
        }
    };

    var __loadAndCreate = function(thisTabbedEditor, container, stepName, content) {
        var deferred = new $.Deferred();
        $.ajax({
          context: thisTabbedEditor,
          url: "/guides/iguides-common/html/interactive-guides/tabbed-editor.html",
          async: true,
          cache: true,
          success: function(result) {
            container.append($(result));

            thisTabbedEditor.tabsRootElement = container.find('.teContainer');
            thisTabbedEditor.tabsRootElement.attr('aria-label', messages.tabbedEditorContainer);
            thisTabbedEditor.$teTabList = thisTabbedEditor.tabsRootElement.find('.teTabs');
            thisTabbedEditor.$teTabContents = thisTabbedEditor.tabsRootElement.find('.teContents');

            var containerID = container[0].id;
            thisTabbedEditor.displayTypeNum = containerID.substring(containerID.lastIndexOf('-')+1);

            // set the tabbed editor height for the right column
            if (content.height !== undefined) {
                container.find('.teContainer').css({
                    "height": content.height
                });
            }

            // Fill in the editors for this Tabbed Editor in different tabs
            var editors = content.editorList || [];

            // Determine the width of the tabs based on the number of tabs
            var numNonActiveEditors = editors.length - 1;
            if (numNonActiveEditors <= 0 ) {
                // Only one file in tabbed editor
                numNonActiveEditors = 1; // To avoid division by zero, and to give future tabs added a size.
                thisTabbedEditor.activeTabSize = '100%';
                thisTabbedEditor.cssWidthValue = "max-width";   // Display full name of active editor
                                                                // when we have the room!
            } else {
                // Let active tab expand to 50% width of tabbed editor so we
                // can hopefully see the whole name of the active tab.
                thisTabbedEditor.activeTabSize = '50%';
                thisTabbedEditor.cssWidthValue = "max-width";
            }
            thisTabbedEditor.tabSize = (50/numNonActiveEditors) + '%';

            if (editors.length > 0) {
                for (var i=0; i<editors.length; i++) {
                    var tEditor = editors[i];
                    if (!thisTabbedEditor.enabled) {
                        // If the tabbedEditor is not enabled, then each editor within
                        // must also be marked not enabled to disable its buttons and 
                        // updates to its content.
                        tEditor.enable = false;
                    }
                    thisTabbedEditor.addEditor(tEditor);
                }

                if (content.activeTab) {
                    // Content specifies exactly which tab should be active after creation
                    var tab = thisTabbedEditor.focusTabByFileName(content.activeTab);
                    if (!tab) {     // fileName specified was not found in tabbed editor
                        // Set the first tab initially active
                        thisTabbedEditor.$teTabList.find('a').first().trigger('click');
                    }
                } else {
                    // Set the first tab initially active
                    thisTabbedEditor.$teTabList.find('a').first().trigger('click');
                }

            }       

            if (content.callback) {
                var callback = eval(content.callback);
                // Identify this tabbedEditor with the activeTabChangeListener
                // function specified by the user.
                callback(thisTabbedEditor);
            }

            deferred.resolve(thisTabbedEditor);
          },
          error: function(result) {
            console.error("Could not load tabbed-editor.html");
            deferred.resolve(thisTabbedEditor);
          }
        });
        return deferred;
    };

    var __create = function(container, stepName, content) {
        return new tabbedEditorType(container, stepName, content);
    };

    return {
        create: __create
      };
})();
