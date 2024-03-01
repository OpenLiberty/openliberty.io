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
var bulkheadCallBack = (function() {

    var bankServiceFileName = "BankService.java";
    var htmlRootDir = "/guides/iguide-bulkhead/html/";
    var mapStepNameToScrollLine = { 'AsyncWithoutBulkhead': 23,
                                   'BulkheadAnnotation': 28,
                                   'AsyncBulkheadAnnotation': 34,
                                   'Fallback': 21 };

    /** AddLibertyMPFaultTolerance step  begin */
    var addMicroProfileFaultToleranceFeatureButton = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addMicroProfileFaultToleranceFeature();
        }
    };

    var __addMicroProfileFaultToleranceFeature = function() {
        var FTFeature = "      <feature>mpFaultTolerance-2.1</feature>";
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.focusTabbedEditorByName(stepName, serverFileName);
        contentManager.resetTabbedEditorContents(stepName, serverFileName);
        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);

        contentManager.insertTabbedEditorContents(stepName, serverFileName, 6, FTFeature);
        var readOnlyLines = [];
        // mark cdi and mpConcurrency feature line readonly
        readOnlyLines.push({
            from: 4,
            to: 5
        });
        contentManager.markTabbedEditorReadOnlyLines(stepName, serverFileName, readOnlyLines);
    };

    var __getMicroProfileFaultToleranceFeatureContent = function(content) {
        var editorContents = {};
        try {
            // match
            // <featureManager>
            //    <anything here>
            // </featureManager>
            // and capturing groups to get content before featureManager, the feature, and after
            // featureManager content.
            var featureManagerToMatch = "([\\s\\S]*)<featureManager>([\\s\\S]*)<\\/featureManager>([\\s\\S]*)";
            var regExpToMatch = new RegExp(featureManagerToMatch, "g");
            var groups = regExpToMatch.exec(content);
            editorContents.beforeFeature = groups[1];
            editorContents.features = groups[2];
            editorContents.afterFeature = groups[3];
        }
        catch (e) {
        }
        return editorContents;
    };

     var __isFaultToleranceInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>mpFaultTolerance-2.1</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __isCDIInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>cdi-2.0</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
	};

	var __isMPFaultToleranceInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>mpFaultTolerance-2.1</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __checkMicroProfileFaultToleranceFeatureContent = function(editor, content) {
        var isFTFeatureThere = true;
        var editorContentBreakdown = __getMicroProfileFaultToleranceFeatureContent(content);
        if (editorContentBreakdown.hasOwnProperty("features")) {
            isFTFeatureThere =  __isFaultToleranceInFeatures(editorContentBreakdown.features) &&
								__isCDIInFeatures(editorContentBreakdown.features) &&
								__isMPFaultToleranceInFeatures(editorContentBreakdown.features);
            if (isFTFeatureThere) {
                // check for whether other stuffs are there
                var features = editorContentBreakdown.features;
                features = features.replace('\n', '');
                features = features.replace(/\s/g, '');
                if (features.length !== "<feature>mpFaultTolerance-2.1</feature><feature>cdi-2.0</feature><feature>mpContextPropagation-1.0</feature>".length) {
                    isFTFeatureThere = false; // contains extra text
                } else {
                    // Syntax is good.  Save off this version of server.xml.
                    utils.saveFeatureInContent(editor, content, "mpFaultTolerance-2.1");
                }
            }
        } else {
            isFTFeatureThere = false;
        }
        utils.handleEditorSave(editor.stepName, editor, isFTFeatureThere, __correctEditorError);
    };

    var __saveServerXML = function(editor) {
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);
        __checkMicroProfileFaultToleranceFeatureContent(editor, content);
    };

    var __listenToEditorForFeatureInServerXML = function(editor) {
        var saveServerXML = function(editor) {
            __saveServerXML(editor);
        };
        editor.addSaveListener(saveServerXML);
    };

    var saveServerXMLButton = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.saveTabbedEditor(stepContent.getCurrentStepName(), "server.xml");
        }
    };
    /** AddLibertyMPFaultTolerance step  end */

    var __saveButtonEditor = function(stepName) {
        contentManager.saveTabbedEditor(stepName, bankServiceFileName);
    };

    var saveButtonEditorButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __saveButtonEditor(stepName);
        }
    };

    var __showPodWithRequestButtonAndBrowser = function(editor) {
        var stepName = editor.getStepName();
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);

        var htmlFile;
        if (stepName === "BulkheadAnnotation") {
            // Dashboard showing just 'In Progress'
            htmlFile = htmlRootDir + "virtual-financial-advisor-bulkhead.html";
        } else if (stepName === "AsyncBulkheadAnnotation") {
            // Dashboard showing 'In Progress' and 'Waiting'
            htmlFile = htmlRootDir + "virtual-financial-advisor-asyncbulkhead.html";
        }

        var editorContentInfo = __checkEditorContent(stepName, content);
        var validContent = editorContentInfo.codeMatched;
        if (validContent) {
            var index = contentManager.getCurrentInstructionIndex();
            if(index === 0){
                if (htmlFile) {
                    // Step will display a dashboard...
                    var stepWidgets = stepContent.getStepWidgets(stepName);
                    stepContent.resizeStepWidgets(stepWidgets, "pod", true);
                    // display the pod with dashboard in it
                    contentManager.setPodContent(stepName, htmlFile);
                }
            }
            // Save off the valid content in the editor object
            var readOnlyLinesArray = editorContentInfo.markText;
            var writableLinesArray = editorContentInfo.markTextWritable;
            editor.updateSavedContent(content, readOnlyLinesArray, writableLinesArray);
        }
        // Scroll the editor to the line following the bottom-most update in the code.
        // To determine this value, look at the writable text array stored in the editor and
        // get the last line marked for editing (the .to value).  Then, adjust it by adding
        // 1 since codeMirror starts line numbering at 0 rather than 1, and then add 1 more to
        // get to the line following.
        var scrollToLine = editor.markTextWritable[editor.markTextWritable.length - 1].to + 2;
        utils.handleEditorSave(stepName, editor, validContent, __correctEditorError, scrollToLine, bankServiceFileName);
    };

    /**
     * Invokes the appropriate validator method for the specified step. Returns an
     * object, formed within the validator method, indicating if the contentIsCorrect
     * (boolean) and regex groups which contain the editor contents, readOnly and
     * writable code.
     * @param String stepName - name of the step
     * @param String content - content of the editor on the step
     *
     * @return {*} -  object containing
     *      codeMatched - boolean indicating if the content passed step validation
     *      The following only exists in contentInfo if codeMatched == true.
     *               [{*}] markTextWritable - array with 1 object indicating 'from' and
     *                     'to' physical line numbers of the editable code segment
     *                     within content.
     *               [{*}] markText - array of 2 objects indicating
     *                     'from' and 'to' physical line numbers of the readonly
     *                     code within content, occurring before and after the
     *                     editable code segment.
     */
    var __checkEditorContent = function(stepName, content) {
        var contentInfo = {codeMatched: false};
        if (stepName === "AsyncWithoutBulkhead") {
            contentInfo = __validateEditorContentInJavaConcurrencyStep(content);
        } else if (stepName === "BulkheadAnnotation") {
            contentInfo = __validateEditorContent_BulkheadStep(content);
        } else if (stepName === "AsyncBulkheadAnnotation") {
            contentInfo = __validateEditorContent_AsyncBulkheadStep(content);
        } else if (stepName === "Fallback") {
            contentInfo= __validateEditorContent_FallbackStep(content);
        }
        return contentInfo;
    };

    var __correctEditorError = function(stepName) {
        if (stepName === "AsyncWithoutBulkhead") {
            __addJavaConcurrencyInEditor(stepName);
        } else if (stepName === "BulkheadAnnotation") {
            __addBulkheadInEditor(stepName);
        } else if (stepName === "AsyncBulkheadAnnotation") {
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            var hasRequestForVFAMethod = __checkRequestForVFAMethod(content);
            __addAsyncBulkheadInEditor(stepName);
            if (hasRequestForVFAMethod === false) {
                __updateAsyncBulkheadMethodInEditor(stepName, false);
            }
        } else if (stepName === "Fallback") {
            __addFallbackAsyncBulkheadInEditor(stepName);
        } else if (stepName === "AddLibertyMPFaultTolerance") {
            __addMicroProfileFaultToleranceFeature();
        }

    };

    var listenToEditorForJavaConcurrency = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var __addJavaConcurrencyInEditor = function(stepName) {
        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
		var newContent =
			"  @Produces @ApplicationScoped\n" +
			"  ManagedExecutor executor = ManagedExecutor.builder().propagated( ThreadContext.APPLICATION ).build();\n" +
			"\n" +
            "  public Future<Service> requestForVFA() {\n" +
            "    int counter = ++counterForVFA;\n" +
            "    Future<Service> serviceRequest = executor.runAsync(() -> {\n" +
            "      try {\n" +
            "        return bankService.serviceForVFA(counter);\n" +
            "      } catch (Exception ex) {\n" +
            "        handleException();\n" +
            "      }\n" +
            "      return null;\n" +
            "    });\n" +
            "    return serviceRequest;\n" +
            "  }";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 10, 13, newContent, 15);
        // line number to scroll to = insert line + the number of lines to be insert
        // for this example 10 + 13 = 23
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScrollLine[stepName]);
    };

    var __validateEditorContentInJavaConcurrencyStep = function(content) {
		var pattern = "([\\s\\S]*private int counterForVFA = 0;\\s*)" + // boundary which is readonly
				"(@Produces\\s+@ApplicationScoped\\s*" +
		        "ManagedExecutor\\s+executor\\s*=\\s*ManagedExecutor\\.builder\\(\\)\\.propagated\\(\\s*ThreadContext\\.APPLICATION\\s*\\)\\.build\\(\\);\\s*" +
		        "public\\s+Future\\s*<\\s*Service\\s*>\\s*requestForVFA\\s*\\(\\s*\\)\\s*{\\s*" +
                "int\\s*counter\\s*=\\s*\\+\\+counterForVFA\\s*;\\s*" +
                "Future\\s*<\\s*Service\\s*>\\s*serviceRequest\\s*=\\s*executor\\.runAsync\\(\\s*\\(\\s*\\)\\s*->\\s*{\\s*" +
                "try\\s*{\\s*" +
                "return\\s+bankService\\s*.\\s*serviceForVFA\\s*\\(\\s*counter\\s*\\)\\s*;\\s*" +
                "}\\s*catch\\s*\\(\\s*Exception\\s+ex\\s*\\)\\s*{\\s*" +
                "handleException\\s*\\(\\s*\\)\\s*;\\s*" +
                "}\\s*" +
                "return\\s+null\\s*;\\s*" +
                "}\\s*\\)\\s*;\\s*" +
                "return\\s+serviceRequest\\s*;\\s*" +
                "})" +
                "(\\s*public Service serviceForVFA[\\s\\S]*)";  // boundary which is readonly

        // Call utility to see if content matches the pattern above.
        // If so, get the editable and read-only line numbers of the content.
        var contentInfo = utils.getContentInfo(content, pattern);

        return contentInfo;
    };

    var __validateEditorContent_BulkheadStep = function(content) {
        var pattern = "([\\s\\S]*return serviceRequest;\\s*}\\s*)" +     // readonly boundary
                      "(@Bulkhead\\s*\\(\\s*50\\s*\\))" +
                      "(\\s*public Service serviceForVFA[\\s\\S]*)";     // readonly boundary

        // Call utility to see if content matches the pattern above.
        // If so, get the editable and read-only line numbers of the content.
        var contentInfo = utils.getContentInfo(content, pattern);

        return contentInfo;
    };

	var __checkRequestForVFAMethod = function(content) {
        var match = false;
        try {
			var pattern = "counterForVFA = 0;\\s*" + // readonly boundary
			        "@Produces\\s+@ApplicationScoped\\s*" +
			        "ManagedExecutor\\s+executor\\s*=\\s*ManagedExecutor\\.builder\\(\\)\\.propagated\\(\\s*ThreadContext\\.APPLICATION\\s*\\)\\.build\\(\\);\\s*" +
                    "public\\s+Future\\s*<\\s*Service\\s*>\\s*requestForVFA\\s*\\(\\s*\\)\\s*{\\s*" +
                    "int\\s*counter\\s*=\\s*\\+\\+counterForVFA\\s*;\\s*" +
                    "return\\s+bankService\\s*.\\s*serviceForVFA\\s*\\(\\s*counter\\s*\\)\\s*;\\s*" +
                    "}\\s*@";
            var regExp = new RegExp(pattern, "g");
            content.match(regExp)[0];
            match = true;
        } catch (ex) {

		}
        return match;
    };

    var __checkServiceForVFAMethod = function(content) {
        var match = false;
        try {
            var pattern = ";\\s*}\\s*" +
                "@Asynchronous\\s*@Bulkhead\\s*\\(\\s*value\\s*=\\s*50\\s*,\\s*" +
                "waitingTaskQueue\\s*=\\s*50\\s*\\)\\s*" +
                "public\\s+Future\\s*<\\s*Service\\s*>\\s*serviceForVFA\\s*\\(\\s*int\\s+counterForVFA\\s*\\)\\s*{\\s*" +
                "Service\\s+chatService\\s*=\\s*new\\s+ChatSession\\s*\\(\\s*counterForVFA\\s*\\);\\s*" +
                "return\\s+executor\\s*.\\s*completedFuture\\s*\\(\\s*chatService\\s*\\);\\s*" +
                "}\\s*}";
            var regExp = new RegExp(pattern, "g");
            content.match(regExp)[0];
            match = true;
        } catch (ex) {

		}
        return match;
    };

    var __validateEditorContent_AsyncBulkheadStep = function(content) {
        var contentInfo={codeMatched: false};
        try {
            var pattern = "([\\s\\S]ManagedExecutor\\s+executor\\s*=\\s*ManagedExecutor\\.builder\\(\\)\\.propagated\\(\\s*ThreadContext\\.APPLICATION\\s*\\)\\.build\\(\\);\\s*)" +      // readonly boundary
            "(public\\s+Future\\s*<\\s*Service\\s*>\\s*requestForVFA\\s*\\(\\s*\\)\\s*{\\s*" +
            "int\\s*counter\\s*=\\s*\\+\\+counterForVFA\\s*;\\s*" +
            "return\\s+bankService\\s*.\\s*serviceForVFA\\s*\\(\\s*counter\\s*\\)\\s*;\\s*" +
            "})" +
            "(\\s*)" +
            "(@Asynchronous\\s*@Bulkhead\\s*\\(\\s*value\\s*=\\s*50\\s*,\\s*" +
            "waitingTaskQueue\\s*=\\s*50\\s*\\)\\s*" +
            "public\\s+Future\\s*<\\s*Service\\s*>\\s*serviceForVFA\\s*\\(\\s*int\\s+counterForVFA\\s*\\)\\s*{\\s*" +
            "Service\\s+chatService\\s*=\\s*new\\s+ChatSession\\s*\\(\\s*counterForVFA\\s*\\);\\s*" +
            "return\\s+executor\\s*.\\s*completedFuture\\s*\\(\\s*chatService\\s*\\);\\s*" +
            "})" +
            "(\\s*}[\\s\\S]*)";
            var regExp = new RegExp(pattern, "g");
            var groups = regExp.exec(content);
            if (groups !== null) {
                contentInfo.codeMatched = true;

                contentInfo.groups = groups;
                var start = groups[1];
                var startLines = utils.countLinesOfContent(start);
                var method = groups[2];   // Group containing just the requestForVFA method
                var methodLines = utils.countLinesOfContent(method) + 1;
                var middle = groups[3];
                var middleLines = utils.countLinesOfContent(middle) - 1;
                var annotation = groups[4];  // Group containing annotations and associated method
                var annotationLines = utils.countLinesOfContent(annotation) +1;
                var end = groups[5];
                var endLines = utils.countLinesOfContent(end);

                var markText = [{from: 1, to: startLines},
                                {from: startLines + methodLines + 1, to: startLines + methodLines + middleLines},
                                {from: startLines + methodLines + middleLines + annotationLines + 1, to: startLines + methodLines + middleLines + annotationLines + endLines}];
                var markTextWritable = [{from: startLines + 1, to: startLines + methodLines},
                                        {from: startLines + methodLines + middleLines + 1, to: startLines + methodLines + middleLines + annotationLines}];

                contentInfo.markText = markText;
                contentInfo.markTextWritable = markTextWritable;
            }
        } catch (ex) {

        }
        return contentInfo;
    };

    var __validateEditorContent_FallbackStep = function(content) {
        var pattern = "([\\s\\S]*return bankService.serviceForVFA\\(counter\\);\\s*" +   // readonly boundary
                      "}\\s*)" +
                      "(@Fallback\\s*\\(\\s*ServiceFallbackHandler\\s*\\.\\s*class\\s*\\))" +
                      "(\\s*@Asynchronous[\\s\\S]*)";   // readonly boundary

        // Call utility to see if content matches the pattern above.
        // If so, get the editable and read-only line numbers of the content.
        var contentInfo = utils.getContentInfo(content, pattern);

        return contentInfo;
    };

    var __addBulkheadInEditor = function(stepName) {
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "  @Bulkhead(50)";

        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 25, 25, newContent, 1);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScrollLine[stepName]);
    };

    var addJavaConcurrencyButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addJavaConcurrencyInEditor(stepName);
        }
    };

    var addBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            __addBulkheadInEditor(stepName);
        }
    };

    var clickChat = function(event, stepName, requestNum) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            handleNewChatRequestInBrowser(stepName, requestNum);
        }
    };

    var addAsyncBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addAsyncBulkheadInEditor(stepName);
        }
    };

    var __addAsyncBulkheadInEditor = function(stepName) {
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var hasRequestForVFAMethod = __checkRequestForVFAMethod(content);

        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);

        var params = [];
        var constructAnnotation = function(params) {
            var bulkheadAnnotation = "  @Asynchronous\n" +
                                     "  @Bulkhead(";
            if ($.isArray(params) && params.length > 0) {
                bulkheadAnnotation += params.join(",\n            ");
            }
            bulkheadAnnotation += ")\n" +
                                    "  public Future<Service> serviceForVFA(int counterForVFA) {\n" +
                                    "    Service chatService = new ChatSession(counterForVFA);\n" +
                                    "    return executor.completedFuture(chatService);\n" +
                                    "  }";
            return bulkheadAnnotation;
        };

        params[0] = "value=50";
        params[1] = "waitingTaskQueue=50";

        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 28, 32, constructAnnotation(params), 7);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScrollLine[stepName]);

        if (hasRequestForVFAMethod === true) {
			__updateAsyncBulkheadMethodInEditor(stepName, false);
        }
    };

    var listenToEditorForAsyncBulkhead = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var addFallbackAsyncBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addFallbackAsyncBulkheadInEditor(stepName);
        }
    };

    var __addFallbackAsyncBulkheadInEditor = function(stepName) {
        // Since the tabbed editor has 2 files for the fallback step, make sure the corrrect tab is in focus before
        // adding the new content.
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent =
            "  @Fallback(ServiceFallbackHandler.class)"; +
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 20, 20, newContent, 1);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScrollLine[stepName]);
    };

    var listenToEditorForAsyncBulkheadFallback = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var updateAsyncBulkheadMethodButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __updateAsyncBulkheadMethodInEditor(stepName);
        }
    };

	var __updateAsyncBulkheadMethodInEditor = function(stepName, performReset) {
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var hasServiceForVFAMethod = __checkServiceForVFAMethod(content);

        var newContent = "  public Future<Service> requestForVFA() {\n" +
                         "    int counter = ++counterForVFA;\n" +
                         "    return bankService.serviceForVFA(counter);\n" +
                         "  }\n";

        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        if (performReset === undefined || performReset === true) {
            contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        }

		contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 15, 27, newContent, 4);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScrollLine[stepName] - 17);

        if (hasServiceForVFAMethod === true && (performReset === undefined || performReset === true)) {
           __addAsyncBulkheadInEditor(stepName);
        }
    };

    var __browserVirtualAdvisorBaseURL = "https://global-ebank.openliberty.io/virtualFinancialAdvisor/";
    var handleNewChatRequestInBrowser = function(stepName, requestNum) {
        var browserChatHTML = htmlRootDir + "virtual-financial-advisor-chat.html";
        var browserContentHTML = htmlRootDir + "virtual-financial-advisor-connecting.html";
        var browserUrl = __browserVirtualAdvisorBaseURL + "Advisor" + requestNum;
        var browserErrorUrl = __browserVirtualAdvisorBaseURL + "error";
        var requestLimits = 1;
        var browser = contentManager.getBrowser(stepName);

        // only mark current instruction as complete and delay showing the next instruction until processing is done
        contentManager.markCurrentInstructionComplete(stepName);
        if (stepName === "AsyncWithoutBulkhead") {
            requestLimits = 3;
            if (requestNum === 2) {
                browserChatHTML = htmlRootDir + "virtual-financial-advisor-chat-2.html";
            } else if (requestNum >= requestLimits) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-error-503.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "ExampleScenario") {
            requestLimits = 2;
            if (requestNum >= requestLimits) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-no-available.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "BulkheadAnnotation") {
            requestLimits = 2;
            if (requestNum === requestLimits) {
                browser.setBrowserContent(htmlRootDir + "virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", browserErrorUrl,
                                 htmlRootDir + "virtual-financial-advisor-bulkhead-error.html");
                return;
            } else if (requestNum > requestLimits) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-bulkhead-error.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "AsyncBulkheadAnnotation") {
            requestLimits = 2;
            if (requestNum === 2) {
                browser.setBrowserContent(htmlRootDir + "virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", __browserVirtualAdvisorBaseURL + "waitingqueue",
                                 htmlRootDir + "virtual-financial-advisor-waitingqueue.html", true);
                return;
            } else if (requestNum === 3) {
                browser.getIframeDOM().find(".errorTextBox").hide();
                __incrementCounts(stepName, 2, 51, ".waitCount", browserErrorUrl,
                                 htmlRootDir + "virtual-financial-advisor-bulkhead-error.html");
                return;
            } else if (requestNum > 3) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-bulkhead-error.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "Fallback") {
            requestLimits = 2;
            if (requestNum === 2) {
                browser.setBrowserContent(htmlRootDir + "virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", __browserVirtualAdvisorBaseURL + "waitingqueue",
                                 htmlRootDir + "virtual-financial-advisor-waitingqueue.html", true);
                return;
            } else if (requestNum === 3) {
                browser.getIframeDOM().find(".errorTextBox").hide();
                __incrementCounts(stepName, 2, 51, ".waitCount", __browserVirtualAdvisorBaseURL + "scheduleAppointment",
                                 htmlRootDir + "virtual-financial-advisor-fallback.html");
                return;
            } else if (requestNum > 3) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-fallback.html";
                browserUrl = __browserVirtualAdvisorBaseURL + "scheduleAppointment";
            }
        }

        contentManager.setBrowserURL(stepName, browserUrl, 0);
        browser.setBrowserContent(browserContentHTML);
        if (requestNum < requestLimits) {
            var pod = contentManager.getPod(stepName);
            setTimeout(function () {
                browser.setBrowserContent(browserChatHTML);

                // If there is a pod showing a dashboard, update its contents to show 1 chat
                if (pod !== null) {
                    // use a interval timer to make sure the browser content is rendered before updating the pod elements
                    var waitingForBrowserContentTimeInterval = setInterval(function () {
                        if (browser.getIframeDOM().find(".advisorName").length === 1) {
                            clearInterval(waitingForBrowserContentTimeInterval);
                            var $stepPod = pod.contentRootElement;
                            if (requestNum === 1) {
                                $stepPod.find(".busyCount").text(1);
                                $stepPod.find(".busyChatCount").attr("aria-label", bulkhead_messages.ONE_CHAT_INPROGRESS);
                                $stepPod.find(".busyChatCount").attr("data-externalizedarialabel", bulkhead_messages.ONE_CHAT_INPROGRESS);
                            }
                        }
                    }, 10);
                }
            }, 1000);
        }
    };

    var __incrementCounts = function(stepName, startingCount, endingCount, elementToBeCounted, urlForAfterCount, htmlForAfterCount, startingWaitingQueue) {
        var timeInterval = setInterval(function () {
            var pod = contentManager.getPod(stepName);
            var browser = contentManager.getBrowser(stepName);
            if (pod && browser) {
                var chatSummary = pod.contentRootElement.find('.chatSummary');
                chatSummary.find(elementToBeCounted).text(startingCount);
                startingCount++;
                if (startingCount === endingCount) {
                    clearInterval(timeInterval);
                    contentManager.setBrowserURL(stepName, urlForAfterCount, 0);
                    browser.setBrowserContent(htmlForAfterCount);
                    if (startingWaitingQueue) {
                        chatSummary.find(".waitCount").addClass('chatSummaryTransition');
                        chatSummary.find(".waitCount").text(1);
                        chatSummary.find(".waitChatCount").attr("aria-label", bulkhead_messages.ONE_CHAT_WAITING);
                        chatSummary.find(".busyChatCount").attr("aria-label", bulkhead_messages.FIFTY_CHATS_INPROGRESS);
                        chatSummary.find(".waitChatCount").attr("data-externalizedarialabel", bulkhead_messages.ONE_CHAT_WAITING);
                        chatSummary.find(".busyChatCount").attr("data-externalizedarialabel", bulkhead_messages.FIFTY_CHATS_INPROGRESS);

                    } else {
                        if (elementToBeCounted === ".busyCount") {
                            chatSummary.find(".busyChatCount").attr("aria-label", bulkhead_messages.FIFTY_CHATS_INPROGRESS);
                            chatSummary.find(".busyChatCount").attr("data-externalizedarialabel", bulkhead_messages.FIFTY_CHATS_INPROGRESS);
                        } else {
                            chatSummary.find(".waitChatCount").attr("aria-label", bulkhead_messages.FIFTY_CHATS_WAITING);
                            chatSummary.find(".waitChatCount").attr("data-externalizedarialabel", bulkhead_messages.FIFTY_CHATS_WAITING);
                        }
                    }
                }
            }
        }, 20);
    };

    var __listenToPlaygroundEditorAnnotationChanges = function(editor){
        var __listenToContentChanges = function(editorInstance, changes) {
            // Get pod from contentManager
            var bulkhead = contentManager.getPlayground(editor.getStepName());
            // Get the parameters from the editor and send to the bulkhead
            var content = editor.getEditorContent();
            try{
                var matchPattern = "@Asynchronous\\s*@Bulkhead\\s*(\\(([^\\(\\)])*?\\))?\\s*public Future<Service> serviceForVFA";
                var regexToMatch = new RegExp(matchPattern, "g");
                var groups = regexToMatch.exec(content);
                var annotation = groups[1];
                var value;
                var waitingTaskQueue;
                var errorPosted = false;

                if (annotation) {
                    // Parameters were specified in the annotation
                    var params = annotation.replace(/[{\s()}]/g, ''); // Remove whitespace and parenthesis
                    params = params.split(',');

                    // Parse their annotation for values
                    params.forEach(function(param, index){
                        var validParameters = false;
                        if (param.indexOf('value=') > -1){
                            value = parseInt(param.substring(param.indexOf('value=') + 6));
                            if (!isNaN(value)) validParameters = true;
                        }
                        if (param.indexOf('waitingTaskQueue=') > -1){
                            waitingTaskQueue = parseInt(param.substring(param.indexOf('waitingTaskQueue=') + 17));
                            if (!isNaN(waitingTaskQueue)) validParameters = true;
                        }
                        if (!validParameters && param !== "") {
                            editor.createCustomErrorMessage(bulkhead_messages.INVALID_PARMS);
                            errorPosted = true;
                        }
                    });
                }

                if (!errorPosted) {
                    // Parameter value(s) syntax is good....check the values entered.
                    if (value != undefined) {
                        if (!utils.isInteger(value) || value < 1) {
                            editor.createCustomErrorMessage(utils.formatString(bulkhead_messages.PARMS_GT_ZERO, ["value"]));
                            errorPosted = true;
                        } else if (value > 10) {
                            editor.createCustomErrorMessage(utils.formatString(bulkhead_messages.PARMS_MAX_VALUE,["value"]));
                            errorPosted = true;
                        }
                    } else {
                        value = 10; // Set to default value
                    }

                    if (waitingTaskQueue != undefined) {
                        if(!utils.isInteger(waitingTaskQueue) || waitingTaskQueue < 1) {
                            editor.createCustomErrorMessage(utils.formatString(bulkhead_messages.PARMS_GT_ZERO, ["waitingTaskQueue"]));
                            errorPosted = true;
                        } else if (waitingTaskQueue > 10) {
                            editor.createCustomErrorMessage(utils.formatString(bulkhead_messages.PARMS_MAX_VALUE,["waitingTaskQueue"]));
                            errorPosted = true;
                        }
                    } else {
                        waitingTaskQueue = 10;  // Set to default value
                    }
                }

                if (!errorPosted) {
                    // All looks good so far...update the playground.
                    if (waitingTaskQueue < value) {
                        editor.createCustomAlertMessage(bulkhead_messages.WAIT_BEST_PRACTICE);
                        // Do not return here.  Post warning and allow user to continue with their simulation.
                    } else {
                        // Clear out any previous error boxes displayed.
                        editor.closeEditorErrorBox();
                    }
                    editorInstance.addCodeUpdated();
                    // Apply the annotation values to the bulkhead.
                    // If not specified, the bulkhead will use its default value.
                    bulkhead.updateParameters.apply(bulkhead, [value, waitingTaskQueue]);
                    // Enable the playground buttons.
                    bulkhead.enableActions(true);
                } else {
                    // Error message was posted which must be fixed.  Don't allow processing
                    // of the playground until it is resolved.
                    bulkhead.enableActions(false);
                }
            }
            catch(e){
                editor.createCustomErrorMessage(bulkhead_messages.INVALID_PARMS);
                bulkhead.enableActions(false);
            }
        };
        editor.addSaveListener(__listenToContentChanges);
    };

    var __createAsyncBulkhead = function(root, stepName) {
        // If root is not a jQuery element, get the jQuery element from the root object passed in
        if(!root.selector){
            root = root.contentRootElement;
        }

        var ab = asyncBulkhead.create(root, stepName, 5, 5);
        root.asyncBulkhead = ab;

        root.find(".bulkheadThreadRequestButton").on("click", function() {
            ab.sendStartChatRequest();
        });
        root.find(".bulkheadThreadReleaseButton").on("click", function() {
            ab.sendEndChatRequest();
        });
        root.find(".bulkheadResetButton").on("click", function() {
            ab.resetQueues();
        });
        contentManager.setPlayground(stepName, ab, 0);
    };

    return {
        listenToEditorForFeatureInServerXML: __listenToEditorForFeatureInServerXML,
        addMicroProfileFaultToleranceFeatureButton: addMicroProfileFaultToleranceFeatureButton,
        saveServerXMLButton: saveServerXMLButton,
        addJavaConcurrencyButton: addJavaConcurrencyButton,
        addBulkheadButton: addBulkheadButton,
        saveButtonEditorButton: saveButtonEditorButton,
        listenToEditorForJavaConcurrency: listenToEditorForJavaConcurrency,
        clickChat: clickChat,
        listenToEditorForAsyncBulkhead: listenToEditorForAsyncBulkhead,
        addFallbackAsyncBulkheadButton: addFallbackAsyncBulkheadButton,
        listenToEditorForAsyncBulkheadFallback: listenToEditorForAsyncBulkheadFallback,
        handleNewChatRequestInBrowser: handleNewChatRequestInBrowser,
        addAsyncBulkheadButton: addAsyncBulkheadButton,
        updateAsyncBulkheadMethodButton: updateAsyncBulkheadMethodButton,
        listenToPlaygroundEditorAnnotationChanges: __listenToPlaygroundEditorAnnotationChanges,
        createAsyncBulkhead: __createAsyncBulkhead
    };

})();
