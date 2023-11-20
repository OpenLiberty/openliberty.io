
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
var utils = (function() {

    /**
     * 
     * @param {String} value - String with value {0} to replace
     * @param {Array} args - an array containing strings to replace {i}
     */
    var __formatString = function(value, args) {     
        for (var i = 0; i < args.length; i++) {
            var regexp = new RegExp('\\{'+i+'\\}', 'gi');
            value = value.replace(regexp, args[i]);
        }
        return value;
    };

    var __parseString = function(strDesc) {
        var resultStr;
        if (strDesc.indexOf("`") != -1) {
          var firstIndex = strDesc.indexOf("\`") + 1;
          //console.log("1st index of ` ", firstIndex);
          var lastIndex = strDesc.lastIndexOf("\`");
          //console.log("last index of ` ", lastIndex);
          resultStr = strDesc.slice(firstIndex, lastIndex);
        } 
        //console.log("resultStr ", resultStr);
        return resultStr;  
    };

    var __replaceString = function(str, char1) {
        var resultStr = str;
        if (str.indexOf(char1) != -1) {
          resultStr = str.replace(char1, "_");
        }
        return resultStr;
    };

    var __getQuote = function(str) {
        var quote;
        str = str.replace(/^\s+/,"");    // Trim spaces on the left
        quote = str.substring(0, 1);
        //console.log("quote ", quote);
        return quote;
    };

    var __getAttributeAction = function(strAction, attr) {
        var str, resultStr;
        if (strAction.indexOf(attr) !== -1) {
            var index = strAction.indexOf(attr) + attr.length;
         
            str = strAction.substring(index);
            var quote = __getQuote(str);
            if (quote === "\"" || quote === "'") {            
                // exclude the first quote
                var openQuoteIndex = str.indexOf(quote);
                str = str.substring(openQuoteIndex + 1);
                var closeQuoteIndex = str.indexOf(quote);
                if (closeQuoteIndex !== -1) {
                    str = quote + str.substring(0, closeQuoteIndex + 1);
                } else {
                    console.error("syntax error: " + str + " in <action> tag missing closing quote");
                }
            } else {
                console.error("syntax error: " + str + " in <action> tag missing open quote");
            }
        }
     
        if (str) {
            var attrStr = attr + str;
            // remove the attr from action
            strAction = strAction.replace(attrStr, "");
        } 
        resultStr = {attr: str, action: strAction}; 
        
        return resultStr;   
    };

    var __getTitleAction = function(strAction) {
        var title = __getAttributeAction(strAction, "title=");
        //console.log("title=", title.attr);   
        return title;
    };
    
    var __getOnClickAction = function(strAction) {
        var str = __getAttributeAction(strAction, "onclick=");
        //console.log("onclick=", str.attr);
        return str; 
    };

    var __getOnKeyPressAction = function(strAction) {
        var str = __getAttributeAction(strAction, "onkeypress=");
        //console.log("onkeypress=", str.attr);
        return str;
    };

    var __getAriaLabelAction = function(strAction) {
        var str = __getAttributeAction(strAction, "aria-label=");
        //console.log("aria-label=", str.attr);
        return str;
    };
    
    var __getButtonName = function(strName) {
        var buttonName;
        //get string from last index of <action forward
        var tmpStr = strName.substring(7);
        if (tmpStr.indexOf(">") !== -1) {
            var firstIndex = tmpStr.indexOf(">") + 1;
            var lastIndex = tmpStr.indexOf("</action>");
            buttonName = tmpStr.substring(firstIndex, lastIndex);
        }
        //console.log("buttonName=", buttonName);
        return buttonName;
    };

    var __parseActionTag = function(str) {
        var resultStr = str;                    
        var actionArray = str.match(/<action\b[^>]*>((\s|\S)*?)<\/action>/gm);
        for (var a in actionArray) {
            var origActionStr = actionArray[a];
            var tmpActionStr = origActionStr;
            //console.log("action[" + a + "]", origActionStr);
            var titleObj =  __getTitleAction(tmpActionStr); 
            var title = titleObj.attr; 
            if (title) {                
                tmpActionStr = titleObj.action;               
                var onclickMethodObj = __getOnClickAction(tmpActionStr);
                var onclickMethod = onclickMethodObj.attr;
                tmpActionStr = onclickMethodObj.action;
        
                var onkeypressMethodObj = __getOnKeyPressAction(tmpActionStr);
                var onkeypressMethod = onkeypressMethodObj.attr;
                tmpActionStr = onkeypressMethodObj.action;
              
                if (onclickMethod) {
                    if (!onkeypressMethod) {
                        onkeypressMethod = onclickMethod;
                    }
                } else if (onkeypressMethod) {
                    if (!onclickMethod) {
                        onclickMethod = onkeypressMethod;
                    }
                }

                var ariaLabelObj = __getAriaLabelAction(tmpActionStr);
                var ariaLabel = ariaLabelObj.attr;
                if (!ariaLabel) {
                    ariaLabel = title;
                }
                tmpActionStr = ariaLabelObj.action;
            
                var buttonName = __getButtonName(tmpActionStr);
                
                // construct new action
                var newActionStr = "<action role='button' tabindex='0' title=" + title + " aria-label=" + ariaLabel + " onkeypress=" + onkeypressMethod + " onclick=" + onclickMethod + " >" + buttonName + "</action>";
                resultStr = resultStr.replace(origActionStr, newActionStr);
            }
        }
        //console.log("resultStr ", resultStr);
        return resultStr;  
    };

    var isElementActivated = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            return true;
        } else {
            return false;
        }
    };

    var isInteger = function(value) {
        var testRE = /^[0-9]+$/;
        return (testRE.test(value));
    };

    var handleEditorSave = function(stepName, editor, isUpdateSuccess, correctErrorBlock, lineNumToScroll, fileName) {
        editor.closeEditorErrorBox();
        if (isUpdateSuccess) {
            if (contentManager.getCurrentInstructionIndex(stepName) === 0) {
                contentManager.markCurrentInstructionComplete(stepName);
                editor.addCodeUpdated();          
                // Put the browser into focus if it is enabled
                var stepBrowser = contentManager.getBrowser(stepName);
                if (stepBrowser) {
                    var stepWidgetContainer = $('.stepWidgetContainer[data-step="' + stepName + '"]');
                    if (stepWidgetContainer.length > 0) {
                        var browserContainer = stepWidgetContainer.find('#' + stepName + '-webBrowser-0');
                        if (browserContainer.length > 0) {
                            if (!browserContainer.hasClass('disableContainer')) {
                                stepBrowser.contentRootElement.trigger("click");
                            }
                        }
                    }
                }
                if (lineNumToScroll) {
                    contentManager.scrollTabbedEditorToView(stepName, fileName, lineNumToScroll);
                }
            }
        } else {
            if (contentManager.getCurrentInstructionIndex(stepName) === 0) {
                // display error
                editor.createErrorLinkForCallBack(true, correctErrorBlock);
            } else {
                editor.resetEditorContent();
                editor.createResetScenarioMessage();
            }
        }
    };

    var validateContentAndSave = function(stepName, editor, content, validateContentBlock, correctErrorBlock) {
        var updateSuccess = false;
        if (validateContentBlock(content)) {
            updateSuccess = true;
        }
        utils.handleEditorSave(stepName, editor, updateSuccess, correctErrorBlock);

        return updateSuccess;
    };

    /**
     * Count the physical number of lines that the content passed takes up in the editor.
     * @param String content String of the line(s) of code from the editor. This utility
     *                       will count the number of physical lines in the string by 
     *                       counting lineFeeds.
     * 
     * @return int  Number of lines in the content.
     */
    var countLinesOfContent = function(content) {
        var lines = content.match(/\r*\n/g);
        return lines !== null ? lines.length : 0;
    };

    /**
     * Save the feature added to the Server.xml file as currently shown in the 
     * editor content.  This includes marking the correct lines for writable and
     * read-only.
     * 
     * @param {*} editor - editor object
     * @param String content - tabbed editor contents associated with this editor
     * @param String featureString - Simple string of the feature that was added
     */
     var saveFeatureInContent = function(editor, content, featureString) {
        // Escape any periods (.) within the featureString
        featureString = featureString.replace(/\./g, '\\.');

        var editableContent = "<feature>\\s*" + featureString + "\\s*<\\/feature>";
        saveContentInEditor(editor, content, editableContent);
    };

    /**
     * Save the contents in the Editor object.  This includes saving the editable
     * (writable) text line numbers so they can be marked with the appropriate
     * marker and marking the rest of the lines read-only.
     * 
     * LIMITATION: This only looks for one set of editable content.
     * 
     * @param {*} editor - editor object
     * @param String content - tabbed editor contents associated with this editor
     * @param Regex String editableContent - regex to encapsuate the editable
     *                              line(s) within the content. For example, the
     *                              annotation, method, feature line, etc.
     */
    var saveContentInEditor = function(editor, content, editableContent) {
        var codeToMatch = "([\\s\\S]*)" +
                          "(" + editableContent + ")" +
                          "([\\s\\S]*)";

        // Determine if the editable content is within the content.  
        // If there, determine the physical line numbers of content that should
        // be marked editable and which should be read-only (before and after 
        // the editable content).                          
        var contentInfo = getContentInfo(content, codeToMatch);
        if (contentInfo.codeMatched) {
            // editableContent was found within content
            // Save the new content to the editor.
            editor.updateSavedContent(content, contentInfo.markText, contentInfo.markTextWritable);
        }
    };

    /**
     * Determines if the editor content matches the Regular Expression defining
     * an editable code segment (one) within the editor.  Returns a contentInfo
     * object indicating if the content matches the layout specified by
     * codeToMatch (boolean), the physical line numbers of the editable block of
     * code within content, and the physical line numbers before and after the
     * editable content (read-only lines).
     * 
     * LIMITATION: This only marks one set of editable content.
     * 
     * @param String content - contents of the editor
     * @param String codeToMatch - Regular Expression defining an editable block
     *                     of code within content.  The regex should use capture
     *                     groups to define the content before the editable 
     *                     code segment, the editable code segment, and the 
     *                     content following the editable code segment.
     * 
     * @return {*} contentInfo - object containing:
     *      codeMatched - boolean indicating if the content matches the regExp
     *               defined by codeToMatch.
     *      The following only exists in contentInfo if codeMatched == true.
     *               [{*}] markText - array with 1 object indicating 'from' and
     *                     'to' physical line numbers of the editable code segment 
     *                     within content.
     *               [{*}] markTextWritable - array of 2 objects indicating 
     *                     'from' and 'to' physical line numbers of the readonly 
     *                     code within content, occurring before and after the 
     *                     editable code segment.
     */
    var getContentInfo = function(content, codeToMatch){
        var contentInfo = {codeMatched: false};
        try {
            // Use capture groups to get content before the editable lines,
            // the editable content, and content after the editable lines. 
            // Then, count the lines of code in each group and determine the 
            // physical line numbers of each group within content.
            //
            // Result:
            //   groups[0] - same as content
            //   groups[1] - content before the editable part
            //   groups[2] - the editable lines within content
            //   groups[3] - content after the editable part
            var regExpToMatch = new RegExp(codeToMatch, "g");
            var groups = regExpToMatch.exec(content);

            if (groups !== null) {
                contentInfo.codeMatched = true;

                // Determine the line numbers of the code before and after the 
                // editable content and the line numbers of the editable content.
                var start = groups[1];      // Lines before editable content
                var startLines = utils.countLinesOfContent(start);
                var editable = groups[2];   // Group containing editable content
                var editableLines = utils.countLinesOfContent(editable) + 1;
                var end = groups[3];        // Lines following codeToMatch
                var endLines = utils.countLinesOfContent(end);

                contentInfo.markText = [{from: 1, to: startLines}, 
                                               {from: startLines + editableLines + 1, to: startLines + editableLines + endLines}];
                contentInfo.markTextWritable  = [{from: startLines + 1, to: startLines + editableLines}];
            }    
        } catch (e) {

        }
        return contentInfo;
    };


    return {
        formatString: __formatString,
        parseString: __parseString,
        replaceString: __replaceString,
        parseActionTag: __parseActionTag,
        isElementActivated: isElementActivated,
        isInteger: isInteger,
        handleEditorSave: handleEditorSave,
        validateContentAndSave: validateContentAndSave,
        countLinesOfContent: countLinesOfContent,
        saveFeatureInContent: saveFeatureInContent,
        saveContentInEditor: saveContentInEditor,
        getContentInfo: getContentInfo
    };

})();