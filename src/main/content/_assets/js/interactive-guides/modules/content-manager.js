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
var contentManager = (function() {
    //when passed an instance of an object, has to know which object instance to update/replace.

    var __stepContents = [];
    var __instructions = {};

// ==== SET FUNCTIONS ====
    var setFileBrowser = function(stepName, fileBrowser, index) {
        __setModule(stepName, fileBrowser, 'fileBrowser', index);
    };
    var setEditor = function(stepName, editor, index) {
        __setModule(stepName, editor, 'fileEditor', index);
    };
    var setTabbedEditor = function(stepName, tabbedEditor, index) {
        __setModule(stepName, tabbedEditor, 'tabbedEditor', index);
    }
    var setCommandPrompt = function(stepName, cmdPrompt, index) {
        __setModule(stepName, cmdPrompt, 'commandPrompt', index);
    };
    var setWebBrowser = function(stepName, webBrowser, index) {
        __setModule(stepName, webBrowser, 'webBrowser', index);
    };
    var setPod = function(stepName, pod, index) {
        __setModule(stepName, pod, 'pod', index);
    };
    var setPlayground = function(stepName, playground, index){
        __setModule(stepName, playground, 'playground', index);
    };
    /** Generic method to add modules to their respective step
     * @param {String} stepName - stepName where module is located
     * @param {Module Object} module - the module object
     * @param {String} moduleType - 'webBrowser', 'fileBrowser', 'fileEditor',
     *                              'commandPrompt', 'pod', or 'tabbedEditor'
     * @param {Integer} index - Index in which the module should be stored to preserve order with async loading of modules
     */
    var __setModule = function(stepName, module, moduleType, index) {
        var stepContent = __stepContents[stepName];
        if (!stepContent) {
            __stepContents[stepName] = {};
            stepContent = __stepContents[stepName];
        }
        var moduleList = null;
        switch(moduleType) {
            case 'webBrowser':
                if(!stepContent.browsers){
                    stepContent.browsers = [];
                }
                moduleList = stepContent.browsers;
                break;
            case 'fileBrowser':
                if(!stepContent.fileBrowsers){
                    stepContent.fileBrowsers = [];
                }
                moduleList = stepContent.fileBrowsers;
                break;
            case 'fileEditor':
                if(!stepContent.editors){
                    stepContent.editors = [];
                }
                moduleList = stepContent.editors;
                break;
            case 'tabbedEditor':
                if (!stepContent.tabbedEditors) {
                    stepContent.tabbedEditors = [];
                }
                moduleList = stepContent.tabbedEditors;
                break;
            case 'commandPrompt':
                if(!stepContent.terminals){
                    stepContent.terminals = [];
                }
                moduleList = stepContent.terminals;
                break;
            case 'pod':
                if(!stepContent.pods){
                    stepContent.pods = [];
                }
                moduleList = stepContent.pods;
                break;
            case 'playground':
                if(!stepContent.playground){
                    stepContent.playground = [];
                }
                moduleList = stepContent.playground;
                break;
        }
        if (moduleList) {
            if(index !== undefined){
                moduleList.splice(index, 0, module); // Insert module at specificed index in the array, to maintain order due to asynchronous loading
            } else{
                moduleList.push(module);
            }
        }
    };

// ==== GET FUNCTIONS ====
    var __getFileBrowsers = function(stepName) {
        return __getModules(stepName, 'fileBrowser');
    };
    var __getFileEditors = function(stepName) {
        return __getModules(stepName, 'fileEditor');
    };
    var __getTabbedEditors = function(stepName) {
        return __getModules(stepName, 'tabbedEditor');
    };
    var __getWebBrowsers = function(stepName) {
        return __getModules(stepName, 'webBrowser');
    };
    var __getCommandPrompts = function(stepName) {
        return __getModules(stepName, 'commandPrompt');
    };
    var __getPods = function(stepName) {
        return __getModules(stepName, 'pod');
    };
    /** Generic method to get Array of a single module type in a given step
     * @param {String} stepName - step name to get modules from
     * @param {String} moduleType - 'webBrowser', 'fileBrowser', 'fileEditor', 'commandPrompt',
     *                              'pod', or 'tabbedEditor'
     */
    var __getModules = function(stepName, moduleType) {
        var moduleList = null;
        var stepContent = __stepContents[stepName];
        if (stepContent) {
            switch(moduleType) {
                case 'webBrowser':
                    moduleList = stepContent.browsers;
                    break;
                case 'fileBrowser':
                    moduleList = stepContent.fileBrowsers;
                    break;
                case 'fileEditor':
                    moduleList = stepContent.editors;
                    break;
                case 'tabbedEditor':
                    moduleList = stepContent.tabbedEditors;
                    break;
                case 'commandPrompt':
                    moduleList = stepContent.terminals;
                    break;
                case 'pod':
                    moduleList = stepContent.pods;
                    break;
                case 'playground':
                    moduleList = stepContent.playground;
                    break;
            }
        }
        return moduleList;
    };

     /** Returns a specific instance of requested type
     * @param {*} stepName
     * @param {*} instanceNumber
     *
     * @returns - <type> instance, or FALSY (null or undefined) if nothing found.
     */
    var __getFileBrowserInstance = function(stepName, instanceNumber) {
        return __getModuleInstance(stepName, 'fileBrowser', instanceNumber);
    };
    var __getEditorInstance = function(stepName, instanceNumber) {
        return __getModuleInstance(stepName, 'fileEditor', instanceNumber);
    };
    var __getTabbedEditorInstance = function(stepName, instanceNumber) {
        return __getModuleInstance(stepName, 'tabbedEditor', instanceNumber);
    };
    var __getWebBrowserInstance = function(stepName, instanceNumber) {
        return __getModuleInstance(stepName, 'webBrowser', instanceNumber);
    };
    var __getCommandPromptInstance = function(stepName, instanceNumber) {
        return __getModuleInstance(stepName, 'commandPrompt', instanceNumber);
    };
    var __getPodInstance = function(stepName, instanceNumber) {
        return __getModuleInstance(stepName, 'pod', instanceNumber);
    };
    var __getPlaygroundInstance = function(stepName, instanceNumber) {
        return __getModuleInstance(stepName, 'playground', instanceNumber);
    }
    /** Returns specific instance of given module type
     * @param {String} stepName - name of step to get module from
     * @param {String} moduleType - 'webBrowser', 'fileBrowser', 'fileEditor', 'commandPrompt',
     *                              'pod', or 'tabbedEditor'
     * @param {Integer} instanceNumber - instance of module type in given step
     *
     * @returns - instance of given module tpe, or FALSY (null or undefined) if nothing found.
     */
    var __getModuleInstance = function(stepName, moduleType, instanceNumber) {
        var moduleList = __getModules(stepName, moduleType);
        var module = null;
        if (moduleList) {
            module = moduleList[0];
            if (instanceNumber) {
                module = moduleList[instanceNumber];
            }
            //console.log("Found " + moduleType + " " + module);
        } else {
            //console.log("Not able to locate any " + moduleType + " in " + stepName);
        }
        return module;
    };

// ==== FileBrowser Functions ====
    /** Takes in an Editor object to add appropriate file to the FileBrowser
     * @param {Editor} editor - the Editor instance, which contains StepName and FileName
     * @param {Integer} browserInstanceNumber - (optional) zero-indexed instance number of FileBrowser
     *
     * TODO: may want to refactor this to be more generic, instead of taking in an Editor
     */
    var addFileToBrowserFromEditor = function(editor, browserInstanceNumber) {
        //TODO: check instance of editor or cmdPrompt, etc. to do different actions
        var stepName = editor.getStepName();
        var fileName = editor.getFileName();

        addFileToBrowser(stepName, fileName, browserInstanceNumber);
    };

    /** Adds a file to a specified FileBrowser instance
     * @param {String} stepName - name of step where FileBrowser is located
     * @param {String} fileName - name of file to add
     * @param {Integer} browserInstanceNumber - (optional) zero-indexed instance number of FileBrowser
     */
    var addFileToBrowser = function(stepName, fileName, browserInstanceNumber) {
        var fileBrowser = __getFileBrowserInstance(stepName, browserInstanceNumber);
        if (fileBrowser) {
            var parentDir = "";  //TODO: make this parentDir customizable
            fileBrowser.addFile(fileName, parentDir);
        }
    };

    /** Adds a folder to a specified FileBrowser instance
     * @param {String} stepName - name of step where FileBrowser is located
     * @param {String} folderName - Name of folder to create
     * @param {String} parentDir - Name of parent directory to put new folder in
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileBrowser
     */
    var addFolderToBrowser = function(stepName, folderName, parentDir, instanceNumber) {
        var fileBrowser = __getFileBrowserInstance(stepName, instanceNumber);
        if (fileBrowser) {
            fileBrowser.mkdir(folderName, parentDir);
        }
    };

// ==== WebBrowser Functions ====
    /** Returns the browser from a specified browser instance
     * @param {String} stepName - name of step where WebBrowser is located
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of Browser
     */
    var getBrowser = function(stepName, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            //console.log("Getting the Web Browser ", browser);
            return browser;
        }
    };

    /** Returns the URL from a specified Browser instance
     * @param {String} stepName - name of step where WebBrowser is located
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of Browser
     */
    var getBrowserURL = function(stepName, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            //console.log("Getting URL from Web Browser ", browser);
            return browser.getURL();
        }
    };

    /** Sets the URL of a specified Browser instance
     * @param {String} stepName - step name containing the target Browser
     * @param {String} URL - URL to set
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of Browser
     */
    var setBrowserURL = function(stepName, URL, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            //console.log("Setting URL for Web Browser ", browser);
            browser.setURL(URL);
        }
    };

    /** Loads content in a specified Browser instance
     * @param {String} stepName - step name containing the target Browser
     * @param {*} content - the content //TODO: in progress, fix once finished. HTML file for now
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of Browser
     */
    var setBrowserContent = function(stepName, content, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            browser.setBrowserContent(content);
        }
    };

    var setBrowserURLFocus = function(stepName, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            browser.setURLFocus();
        }
    };

    var refreshBrowser = function(stepName, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            //TODO: refactor this into a function in webBrowser.js
            browser.simulateBrowserRefresh();
        }
    };

    var hideBrowser = function(stepName, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            browser.contentRootElement.addClass("hidden");
        }
    };

    var showBrowser = function(stepName, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            browser.contentRootElement.removeClass("hidden");
        }
    }

    var addRightSlideClassToBrowser = function(stepName, instanceNumber) {
        var browser = __getWebBrowserInstance(stepName, instanceNumber);
        if (browser) {
            browser.contentRootElement.addClass("pod-animation-slide-from-right");
        }
    }

// ==== Pod Functions ====
    /**
     * Change the contents of the pod
     * @param {} stepName 
     * @param {*} content   - String of html or filename to get html from
     * @param {*} instanceNumber 
     * @param {*} podCallback - invoked AFTER the html was added to the dom
     * @param {*} append - true if you should append (add) the content to the 
     *                     end of the dom.  Otherwise, assumed false which means
     *                     the pod contents should be replaced with the new content.
     */
    var setPodContent = function(stepName, content, instanceNumber, podCallback, append) {
        var pod = __getPodInstance(stepName, instanceNumber);
        if (pod) {
            pod.setContent(content, podCallback, append);
        }
    };

    var setPodContentWithRightSlide = function(stepName, content, instanceNumber) {
        var pod = __getPodInstance(stepName, instanceNumber);
        if (pod) {
            var podContent = "<div class=\"pod-animation-slide-from-right\" tabindex=\"0\">" +
                content +
                "</div>";
            pod.setContent(podContent);
        }
    };

    var setPodContentWithSlideDown = function(stepName, content, instanceNumber) {
        var pod = __getPodInstance(stepName, instanceNumber);
        if (pod) {
            var podContent = "<div class=\"pod-animation-slidedown\" tabindex=\"0\">" +
                content +
                "</div>";
            pod.setContent(podContent);
        }
    };

    var setPodContentWithSlideUp = function(stepName, content, instanceNumber) {
        var pod = __getPodInstance(stepName, instanceNumber);
        if (pod) {
            var podContent = "<div class=\"pod-animation-slideup\" tabindex=\"0\">" +
                content +
                "</div>";
            pod.setContent(podContent);
        }
    };

// ==== File Editor Functions ====

    /** Returns the content from a specified FileEditor instance
     * @param {String} stepName - name of step where FileEditor is located
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var getEditorContents = function(stepName, instanceNumber) {
        var editor = __getEditorInstance(stepName, instanceNumber);
        if (editor) {
            return editor.getEditorContent();
        }
    };

    /** Set (replace) the content in a specified FileEditor instance
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String?} content - the content to put into the FileEditor
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var setEditorContents = function(stepName, content, instanceNumber) {
        var editor = __getEditorInstance(stepName, instanceNumber);
        if (editor) {
            editor.setEditorContent(content);
        }
    };

    /** Reset the content in a specified FileEditor instance
     * @param {String} stepName - name of step where FileEditor is located
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var resetEditorContents = function(stepName, instanceNumber) {
        var editor = __getEditorInstance(stepName, instanceNumber);
        if (editor) {
            editor.resetEditorContent();
        }
    };

    /** Insert content before a certain line in a specified FileEditor instance
     * @param {String} stepName - name of step where FileEditor is located
     * @param {Integer} lineNumber - line number to insert content above
     * @param {String?} content - the content to put into the FileEditor
     * @param {String} numberOfLines - (optional) number of lines in the new content; required only if inserting more than 1 line
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var insertEditorContents = function(stepName, lineNumber, content, numberOfLines, instanceNumber) {
        var editor = __getEditorInstance(stepName, instanceNumber);
        if (editor) {
            editor.insertContent(lineNumber, content, numberOfLines);
        }
    };

    /** Append content after a certain line in a specified FileEditor instance
     * @param {String} stepName - name of step where FileEditor is located
     * @param {Integer} lineNumber - line number to append content below
     * @param {String?} content - the content to put into the FileEditor
     * @param {String} numberOfLines - (optional) number of lines in the new content; required only if appending more than 1 line.
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var appendEditorContents = function(stepName, lineNumber, content, numberOfLines, instanceNumber) {
        var editor = __getEditorInstance(stepName, instanceNumber);
        if (editor) {
            editor.appendContent(lineNumber, content, numberOfLines);
        }
    };

    /** Replace content on specified line numbers in a specified FileEditor instance
     * @param {String} stepName - name of step where FileEditor is located
     * @param {Integer} fromLineNumber - starting line number to replace content
     * @param {Integer} toLineNumber - ending line number to replace content
     * @param {String?} content - the content to put into the FileEditor
     * @param {String} numberOfLines - (optional) number of lines in the new content; required only if different from number of lines replacing.
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var replaceEditorContents = function(stepName, fromLineNumber, toLineNumber, content, numberOfLines, instanceNumber) {
        var editor = __getEditorInstance(stepName, instanceNumber);
        if (editor) {
            editor.replaceContent(fromLineNumber, toLineNumber, content, numberOfLines);
        }
    };

    /** Simulate the save click in a specified FileEditor instance
     * @param {String} stepName - name of step where FileEditor is located
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var saveEditor = function(stepName, instanceNumber) {
        var editor = __getEditorInstance(stepName, instanceNumber);
        if (editor) {
            editor.saveEditor();
        }
    };

    /** Set readonly lines in a specified FileEditor instance
     * @param {String} stepName - name of step where FileEditor is located
     * @param {array} readOnlyLines - specify an array with from and to line numbers to be marked as,
     * readonly, example to mark lines 1 thru 4 and lines 8 thru 12 readonly:
     *      [ {from: 1, to: 4} {from: 8, to: 12} ]
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var markEditorReadOnlyLines = function(stepName, readOnlyLines, instanceNumber) {
        var editor = __getEditorInstance(stepName, instanceNumber);
        if (editor) {
            editor.markTextForReadOnly(readOnlyLines);
        }
    }


    // ==== Tabbed Editor Functions ====
    /** Add an editor to the tabbed editor in a new tab.
     *  @param {String} stepName
     *  @param {*} file editor creation object
     *      ex: {
     *            "displayType":"fileEditor",
     *            "fileName": "TestOut.java",
     *            "preload": [
     *                         "This is my Test editor.",
     *                         "Another line in the editor."
     *             ],
     *             "save": true
     *          }
     *  @param {Integer} instanceNumber (optional) zero-indexed instance number of TabbedEditor
     */
    var addEditorToTabs = function(stepName, editorObject, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            tabbedEditor.addEditor(editorObject);
        }
    };

    /**
     * Using the file name specified in the tab for the particular file editor,
     * focus the editor.
     * @param {String} stepName
     * @param {String} fileName as specified on the tab
     * @param {Integer} instanceNumber (optional) zero-indexed instance number of TabbedEditor
     */
    var focusTabbedEditorByName = function(stepName, fileName, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            tabbedEditor.focusTabByFileName(fileName);
        }
    };

    /**
     * Get the active Tab fileName in the Tabbed Editor.
     *
     * @returns {String} fileName of active Tab || undefined.
     */
    var getActiveTabFileName = function(stepName, instanceNumber) {
        var fileName = undefined;
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            fileName = tabbedEditor.getActiveTabFileName();
        }
        return fileName;
    };

    /**
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - name of editor within TabbedEditor
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     * @return editor instance
     */
    var getEditorInstanceFromTabbedEditor = function(stepName, fileName, instanceNumber) {
        var editor = null;
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            editor = tabbedEditor.getEditorByFileName(fileName);
        }
        return editor;
    };

    /** Returns the content from a specified FileEditor instance within a TabbedEditor
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - name of editor within TabbedEditor
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     * @return editor contents
     */
    var getTabbedEditorContents = function(stepName, fileName, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                return teditor.getEditorContent();
            }
        }
    };

    /** Set (replace) the content in a specified FileEditor instance within a
     *  TabbedEditor
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - file name of editor within TabbedEditor
     * @param {String?} content - the content to put into the FileEditor
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var setTabbedEditorContents = function(stepName, fileName, content, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                teditor.setEditorContent(content);
            }
        }
    };

    /** Reset the content in a specified FileEditor instance within a TabbedEditor
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - file name of editor within TabbedEditor
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var resetTabbedEditorContents = function(stepName, fileName, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                teditor.resetEditorContent();
            }
        }
    };

    /** Scroll the editor content into view with specified FileEditor instance within a TabbedEditor
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - file name of editor within TabbedEditor   
     * @param {Integer} lineNumber - the line number in the editor to scroll to view
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var scrollTabbedEditorToView = function(stepName, fileName, lineNumber, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                teditor.scrollToLine(lineNumber);
            }
        }
    };

    /** Insert content before a certain line in a specified FileEditor instance
     *  within a TabbedEditor.
     * @param {String} stepName - name of step where TabbedEditor is located
     * @param {String} fileName - file name of editor within TabbedEditor
     * @param {Integer} lineNumber - line number to insert content above
     * @param {String?} content - the content to put into the FileEditor
     * @param {String} numberOfLines - (optional) number of lines in the new content; required only if inserting more than 1 line
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var insertTabbedEditorContents = function(stepName, fileName, lineNumber, content, numberOfLines, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                teditor.insertContent(lineNumber, content, numberOfLines);
            }
        }
    };

    /** Append content after a certain line in a specified FileEditor instance
     *  within a TabbedEditor.
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - file name of editor within TabbedEditor
     * @param {Integer} lineNumber - line number to append content below
     * @param {String?} content - the content to put into the FileEditor
     * @param {String} numberOfLines - (optional) number of lines in the new content; required only if appending more than 1 line.
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var appendTabbedEditorContents = function(stepName, fileName, lineNumber, content, numberOfLines, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                teditor.appendContent(lineNumber, content, numberOfLines);
            }
        }
    };

    /** Replace content on specified line numbers in a specified FileEditor instance
     *  within a Tabbed Editor
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - file name of editor within TabbedEditor
     * @param {Integer} fromLineNumber - starting line number to replace content
     * @param {Integer} toLineNumber - ending line number to replace content
     * @param {String?} content - the content to put into the FileEditor
     * @param {String} numberOfLines - (optional) number of lines in the new content; required only if different from number of lines replacing.
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var replaceTabbedEditorContents = function(stepName, fileName, fromLineNumber, toLineNumber, content, numberOfLines, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                teditor.replaceContent(fromLineNumber, toLineNumber, content, numberOfLines);
            }
        }
    };

    /** Simulate the save click in a specified FileEditor instance within a TabbedEditor
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - file name of editor within TabbedEditor
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var saveTabbedEditor = function(stepName, fileName, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                // Put the correct Tab into focus prior to processing save.
                contentManager.focusTabbedEditorByName(stepName, fileName);

                teditor.saveEditor();
            }
        }
    };

    /** Set readonly lines in a specified FileEditor instance within a TabbedEditor
     * @param {String} stepName - name of step where FileEditor is located
     * @param {String} fileName - file name of editor within TabbedEditor
     * @param {array} readOnlyLines - specify an array with from and to line numbers to be marked as,
     * readonly, example to mark lines 1 thru 4 and lines 8 thru 12 readonly:
     *      [ {from: 1, to: 4} {from: 8, to: 12} ]
     * @param {Integer} instanceNumber - (optional) zero-indexed instance number of FileEditor
     */
    var markTabbedEditorReadOnlyLines = function(stepName, fileName, readOnlyLines, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            var teditor = tabbedEditor.getEditorByFileName(fileName);
            if (teditor) {
                teditor.markTextForReadOnly(readOnlyLines);
            }
        }
    }

    /** Resize the height of a TabbedEditor
     *  @param {String} stepName
     *  @param {Integer} instanceNumber (optional) zero-indexed instance number of TabbedEditor
     */
    var resizeTabbedEditor = function(stepName, instanceNumber) {
        var tabbedEditor = __getTabbedEditorInstance(stepName, instanceNumber);
        if (tabbedEditor) {
            tabbedEditor.resize();
        }
    };


// ==== Instruction Functions ====
    /** Store the instructions for the given step
     * @param {String} stepName
     * @param {*} instructions
     */
    var setInstructions = function(stepName, instructionsFromStep){
      if(!stepName){
        stepName = stepContent.getCurrentStepName();
      }
      // Check if instructions are already set
      if(__instructions[stepName]){
        return;
      }

      var stepInstruction = {}; // Instructions for this step
      stepInstruction.currentInstructionIndex = 0; // Index of the current instruction
      stepInstruction.instructions = [];

      if(instructionsFromStep){
        // Loop through the instructions and set them
        for(var i = 0; i < instructionsFromStep.length; i++){
          var instruction = {};
          instruction.name = instructionsFromStep[i];
          instruction.complete = false;
          stepInstruction.instructions.push(instruction);
        }
      }

      __instructions[stepName] = stepInstruction;
    };

    /*
      Internal method to get the stepInstruction structure for a given step
      that has the current instruction index and the list of instructions for that step
    */
    var __getStepInstruction = function(stepName){
      if(!stepName){
        stepName = stepContent.getCurrentStepName();
      }
      var stepInstruction = __instructions[stepName];
      return stepInstruction;
    };

    var checkIfInstructionsForStep = function(stepName){
        var stepInstruction = __getStepInstruction(stepName);
        return (stepInstruction && stepInstruction.instructions.length > 0);
    }

    /* Made changes to implement the new multipane design, but can't test until widgets are working*/
    var markCurrentInstructionComplete = function(stepName){
        var stepInstruction = __getStepInstruction(stepName);
        var currentInstructionIndex = stepInstruction.currentInstructionIndex;
        var instruction = stepInstruction.instructions[currentInstructionIndex];

        if(instruction){
            var instructionID = stepName + '-instruction-' + currentInstructionIndex;

            //scroll so the recently completed instruction is at the top of the browser window
            if (($("#"+instructionID).length > 0) && (window.innerWidth <= twoColumnBreakpoint)) {
              //subtract 40 to consider the TOC button height in single column view
              $("html, body").animate({ scrollTop: ($("#"+instructionID).offset().top - 40)}, 750);
            }

            if(instruction.complete === false){
                instruction.complete = true;
                $("#"+instructionID).addClass("completed");
                $("#"+instructionID).attr("aria-disabled", true);
                if(stepInstruction.currentInstructionIndex < stepInstruction.instructions.length-1){
                    stepInstruction.currentInstructionIndex++;
                    enableNextInstruction(stepName);
                }
                else{
                    stepInstruction.currentInstructionIndex = -1;
                }
                 
                // Mark the completed instruction's actions disabled
                var instructions = $("instruction.completed:visible");
                var actions = instructions.find('action');
                actions.prop('tabindex', '-1');
                actions.off('click');
                actions.off('keypress');
            }
        }
    };

    // May need to change for cases where you have to wait a set time before activating
    var enableNextInstruction = function(stepName){
      var stepInstruction = __getStepInstruction(stepName);
      var nextInstructionIndex = stepInstruction.currentInstructionIndex; //this is the instruction that needs to be activated
      var instruction = stepInstruction.instructions[nextInstructionIndex];

      if(instruction) {
        var instructionID = stepName + '-instruction-' + nextInstructionIndex;

        if(instruction.complete === false) {
          $("#"+instructionID).removeClass("unavailable");
          $("#"+instructionID).removeAttr("aria-disabled");
          $("#"+instructionID).attr('tabindex', '0');
          var actions = $("#"+instructionID).find('action');
          actions.prop('tabindex', '0');
        }
      }
    };

    var isInstructionComplete = function(stepName, index) {
      var complete = false;
      var stepInstruction = __getStepInstruction(stepName);
      try {
        var instruction = stepInstruction.instructions[index];
        complete = instruction.complete;
      } catch (e) {
        // console.log("isInstructionComplete: Instruction does not exist at index: " + index);
      }
      return complete;
    };

    var getCurrentInstruction = function(stepName) {
      var stepInstruction = __getStepInstruction(stepName);
      var currentInstructionIndex = stepInstruction.currentInstructionIndex;

      // Reached the end of the instructions
      if(currentInstructionIndex === -1){
        return "";
      }
      var currentInstruction = stepInstruction.instructions[currentInstructionIndex];
      var instruction = null;
      if(currentInstruction){
        instruction = currentInstruction.name;
      }
      return instruction;
    };

    var getCurrentInstructionIndex = function(stepName) {
      var stepInstruction = __getStepInstruction(stepName);
      return stepInstruction ? stepInstruction.currentInstructionIndex : -1;
    };

    var getInstructionAtIndex = function(index, stepName) {
      var instruction;
      var stepInstruction = __getStepInstruction(stepName);
      if(stepInstruction.instructions.length > 0){
        instruction = stepInstruction.instructions[index].name;
      }
      return instruction;
    };

    var getInstructionsLastIndex = function(stepName) {
      var stepInstruction = __getStepInstruction(stepName);
      return stepInstruction ? stepInstruction.instructions.length-1 : -1;
    };

    /*
        Check if all of the instructions for a given step are complete.
        Input: {step} Step object
    */
    var determineIfAllInstructionsComplete = function(step) {
        var stepName = step.name;
        var isComplete = true;
        var stepInstruction = __getStepInstruction(stepName);
        if(stepInstruction.instructions && stepInstruction.instructions.length > 0){
            var lastLoadedInstruction = getCurrentInstructionIndex(stepName);
            if(lastLoadedInstruction !== -1){
                isComplete = false;
            }
        }
        // Check if there are sections to this step and if they are complete
        if(isComplete && step.sections){
            for(var i = 0; i < step.sections.length; i++){
                stepInstruction = __getStepInstruction(step.sections[i].name);
                if(stepInstruction.instructions && stepInstruction.instructions.length > 0){
                    lastLoadedInstruction = getCurrentInstructionIndex(step.sections[i].name);
                    if(lastLoadedInstruction !== -1){
                        isComplete = false;
                    }
                }
            }
        }
        return isComplete;
    };

    var resetInstruction = function(stepName) {
        var stepInstruction = __getStepInstruction(stepName);
    };

    return {
        setFileBrowser: setFileBrowser,
        setEditor: setEditor,
        setTabbedEditor: setTabbedEditor,
        setWebBrowser: setWebBrowser,
        setBrowserContent: setBrowserContent,
        setCommandPrompt: setCommandPrompt,
        setPod: setPod,
        setPlayground: setPlayground,

        addFileToBrowserFromEditor: addFileToBrowserFromEditor,
        addFileToBrowser: addFileToBrowser,
        addFolderToBrowser: addFolderToBrowser,

        getBrowser: getBrowser,
        setBrowserURL: setBrowserURL,
        getBrowserURL: getBrowserURL,
        setBrowserURLFocus: setBrowserURLFocus,
        refreshBrowser: refreshBrowser,
        hideBrowser: hideBrowser,
        showBrowser: showBrowser,
        addRightSlideClassToBrowser: addRightSlideClassToBrowser,

        setPodContent: setPodContent,
        setPodContentWithRightSlide: setPodContentWithRightSlide,
        setPodContentWithSlideDown: setPodContentWithSlideDown,
        setPodContentWithSlideUp: setPodContentWithSlideUp,
        getPod: __getPodInstance,
        getPlayground: __getPlaygroundInstance,

        getEditorContents: getEditorContents,
        setEditorContents: setEditorContents,
        resetEditorContents: resetEditorContents,
        insertEditorContents: insertEditorContents,
        appendEditorContents: appendEditorContents,
        replaceEditorContents: replaceEditorContents,
        saveEditor: saveEditor,
        markEditorReadOnlyLines: markEditorReadOnlyLines,

        addEditorToTabs: addEditorToTabs,
        focusTabbedEditorByName: focusTabbedEditorByName,
        getActiveTabFileName: getActiveTabFileName,
        getEditorInstanceFromTabbedEditor: getEditorInstanceFromTabbedEditor,
        getTabbedEditorContents: getTabbedEditorContents,
        setTabbedEditorContents: setTabbedEditorContents,
        resetTabbedEditorContents: resetTabbedEditorContents,
        insertTabbedEditorContents: insertTabbedEditorContents,
        appendTabbedEditorContents: appendTabbedEditorContents,
        replaceTabbedEditorContents: replaceTabbedEditorContents,
        saveTabbedEditor: saveTabbedEditor,
        markTabbedEditorReadOnlyLines: markTabbedEditorReadOnlyLines,
        resizeTabbedEditor: resizeTabbedEditor,
        scrollTabbedEditorToView: scrollTabbedEditorToView,

        setInstructions: setInstructions,
        checkIfInstructionsForStep: checkIfInstructionsForStep,
        markCurrentInstructionComplete: markCurrentInstructionComplete,
        isInstructionComplete: isInstructionComplete,
        getCurrentInstruction: getCurrentInstruction,
        getCurrentInstructionIndex: getCurrentInstructionIndex,
        getInstructionAtIndex: getInstructionAtIndex,
        getInstructionsLastIndex: getInstructionsLastIndex,
        determineIfAllInstructionsComplete: determineIfAllInstructionsComplete
    };
})();
