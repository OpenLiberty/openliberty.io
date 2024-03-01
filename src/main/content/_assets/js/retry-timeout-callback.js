/*******************************************************************************
* Copyright (c) 2017, 2021 IBM Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
*     IBM Corporation - initial API and implementation
*******************************************************************************/
var retryTimeoutCallback = (function() {

    var serverFileName = "server.xml";
    var bankServiceFileName = "BankService.java";
    var htmlRootDir = "/guides/iguide-retry-timeout/html/";
    var __welcomePageURL = "https://global-ebank.openliberty.io/welcome";
    var __browserTransactionBaseURL = "https://global-ebank.openliberty.io/transactions";
    var mapStepNameToScollLine = { 'TimeoutAnnotation': 8,
                                   'AddRetryOnRetry': 13,
                                   'AddLimitsRetry': 17,
                                   'AddDelayRetry': 18,
                                   'AddJitterRetry': 20,
                                   'AddAbortOnRetry': 22};

    var listenToEditorForFeatureInServerXML = function(editor) {
        var saveServerXML = function(editor) {
            __saveServerXML(editor);
        };
        editor.addSaveListener(saveServerXML);
    };

    var addMicroProfileFaultToleranceFeatureButton = function(event) {
        if (utils.isElementActivated(event)) {
            // Put the server.xml editor into focus.
            var stepName = stepContent.getCurrentStepName();
            contentManager.focusTabbedEditorByName(stepName, serverFileName);

            // Click or 'Enter' or 'Space' key event...
            __addMicroProfileFaultToleranceFeature();
        }
    };

    var __addMicroProfileFaultToleranceFeature = function() {
        var FTFeature = "      <feature>mpFaultTolerance-3.0</feature>";
        var stepName = stepContent.getCurrentStepName();

        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, serverFileName);
        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);

        contentManager.insertTabbedEditorContents(stepName, serverFileName, 7, FTFeature);
        var readOnlyLines = [];
        // mark cdi feature line readonly
        readOnlyLines.push({
            from: 6,
            to: 6
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
                if (feature.indexOf("<feature>mpFaultTolerance-3.0</feature>") !== -1) {
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

    var __checkMicroProfileFaultToleranceFeatureContent = function(editor, content) {
        var isFTFeatureThere = true;
        var editorContentBreakdown = __getMicroProfileFaultToleranceFeatureContent(content);
        if (editorContentBreakdown.hasOwnProperty("features")) {
            isFTFeatureThere =  __isFaultToleranceInFeatures(editorContentBreakdown.features) &&
                                __isCDIInFeatures(editorContentBreakdown.features);
            if (isFTFeatureThere) {
                // check for whether other stuffs are there
                var features = editorContentBreakdown.features;
                features = features.replace('\n', '');
                features = features.replace(/\s/g, '');
                if (features.length !== "<feature>mpFaultTolerance-3.0</feature><feature>servlet-4.0</feature><feature>cdi-2.0</feature><feature>jaxrs-2.1</feature>".length) {
                    isFTFeatureThere = false; // contains extra text
                } else {
                    // Syntax is good.  Save off this version of server.xml.
                    utils.saveFeatureInContent(editor, content, "mpFaultTolerance-3.0");
                }
            }
        } else {
            isFTFeatureThere = false;
        }
        utils.handleEditorSave(editor.stepName, editor, isFTFeatureThere, __correctEditorError);
    };

    var __correctEditorError = function(stepName) {
        // correct annotation/method
        switch(stepName) {
            case "AddLibertyMPFaultTolerance":
                __addMicroProfileFaultToleranceFeature();
                break;
            case "TimeoutAnnotation":
                __addTimeoutInEditor(stepName);
                break;
            case "AddRetryOnRetry":
                __addRetryOnRetryInEditor(stepName);
                break;
            case "AddLimitsRetry":
                __addLimitsRetryInEditor(stepName);
                break;
            case "AddDelayRetry":
                __addDelayRetryInEditor(stepName);
                break;
            case "AddJitterRetry":
                __addJitterRetryInEditor(stepName);
                break;
            case "AddAbortOnRetry":
                __addAbortOnRetryInEditor(stepName);
                break;
        }
    };

    var __saveServerXML = function(editor) {
        var stepName = stepContent.getCurrentStepName();
        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);
        __checkMicroProfileFaultToleranceFeatureContent(editor, content);
    };

    var saveServerXMLButton = function(event) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.saveTabbedEditor(stepContent.getCurrentStepName(), serverFileName);
        }
    };

    var __saveButtonEditor = function(stepName) {
        contentManager.saveTabbedEditor(stepName, bankServiceFileName);
    };

    var saveButtonEditor = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            __saveButtonEditor(stepName);
        }
    };

    var listenToEditorForTimeoutAnnotation = function(editor) {
        editor.addSaveListener(__checkEditorContent)
    };

    var listenToEditorForInitialRetryAnnotation = function(editor) {
        editor.addSaveListener(__checkEditorContent);
    };

    var listenToPlayground = function(editor) {
        editor.addSaveListener(__updatePlayground);
    };

    var __checkEditorContent = function(editor) {
        var stepName = editor.getStepName();
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);

        var contentIsCorrect = true;
        if (stepName === "TimeoutAnnotation") {
            contentIsCorrect = __validateEditorTimeoutAnnotationStep(content);
            if (contentIsCorrect) {
                __saveTimeoutAnnotationInContent(editor, content);
            }
        } else if (stepName === "AddRetryOnRetry") {
            contentIsCorrect = __validateEditorRetryOnRetryStep(content);
            if (contentIsCorrect) {
                __saveRetryAnnotationInContent(editor, content);
            }
        } else if (stepName === "AddAbortOnRetry") {
            // Check that the 'retryOn' parameter was expanded to 2 classes
            //          retryOn = {TimeoutException, IOException}
            if (content.includes("retryOn")) {
                contentIsCorrect = __checkMultiRetryOnAnnotationInContent(content);
                if (contentIsCorrect) {
                    // Check for the rest of the parameters
                    var otherContent = content.substring(0, content.indexOf('retryOn')) +
                                       content.substring(content.indexOf('}') + 2);
                    var paramsToCheck = [
                                        "maxRetries=4",
                                        "maxDuration=10",
                                        "durationUnit=ChronoUnit.SECONDS",
                                        "delay=200",
                                        "delayUnit=ChronoUnit.MILLIS",
                                        "jitter=100",
                                        "jitterDelayUnit=ChronoUnit.MILLIS",
                                        "abortOn=FileNotFoundException.class"
                                       ];
                    contentIsCorrect = __checkRetryAnnotationInContent(otherContent, paramsToCheck);
                    if (contentIsCorrect) {
                        __saveRetryAnnotationInContent(editor, content);
                    }
                }
            } else {
                contentIsCorrect = false;
            }
        }
        utils.handleEditorSave(stepName, editor, contentIsCorrect, __correctEditorError, mapStepNameToScollLine[stepName], bankServiceFileName);
    };

    var __validateEditorTimeoutAnnotationStep = function(content) {
        var match = false;
        try {
            var pattern = "public class BankService {\\s*" + // readonly boundary
            "@\\s*Timeout\\s*\\(\\s*2000\\s*\\)\\s*" +
            "public Service showTransactions()"; // readonly boundary
            var regExpToMatch = new RegExp(pattern, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __validateEditorRetryOnRetryStep = function(content) {
        var match = false;
        try {
            var pattern = "public class BankService {\\s*" + // readonly boundary
            "@Retry\\s*\\(\\s*retryOn\\s*=\\s*TimeoutException\\.class\\s*\\)\\s*" +
            "@Timeout\\(2000\\)"; // readonly boundary
            var regExpToMatch = new RegExp(pattern, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch(ex) {

        }
        return match;
    };

    var __addTimeoutInEditor = function(stepName) {
        // Put the BankService.java editor into focus.
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);

        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Timeout(2000)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 7, 7, newContent, 1);
    };

    var addTimeoutButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            __addTimeoutInEditor(stepName);
        }
    };

    var clickTransaction = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            // Focus the webBrowser for the step
            var webBrowser = contentManager.getBrowser(stepName);
            webBrowser.contentRootElement.trigger("click");
            // Set the browser content
            contentManager.setBrowserURL(stepName, __browserTransactionBaseURL);
            contentManager.refreshBrowser(stepName);
        }
    };

    var handleTransactionRequestInBrowser = function(browser, stepName, numOfRequest) {
        var browserContentHTML= "/guides/iguides-common/html/interactive-guides/bankApp-welcome.html"

        var checkURL = browser.getURL().trim();
        if (checkURL === __browserTransactionBaseURL) {
            if (numOfRequest !== -1) {
                contentManager.markCurrentInstructionComplete(stepName);
            }
            if (stepName === "BankScenario") {
                if (numOfRequest === 0) {
                    browserContentHTML = htmlRootDir + "transaction-history.html";
                } else if (numOfRequest === 1) {
                    browserContentHTML = htmlRootDir + "transaction-history-loading.html";
                }
            } else if (stepName === "TimeoutAnnotation" || stepName === "AddAbortOnRetry") {
                browserContentHTML = htmlRootDir + "transaction-history-timeout-error.html";
            } else /** if (stepName === "AddRetryOnRetry" || stepName === "AddLimitsRetry", etc....)**/ {
                browserContentHTML = htmlRootDir + "transaction-history-loading.html";
            }

            browser.setBrowserContent(browserContentHTML);

            switch(stepName) {
                case "BankScenario":
                    showBrowserOverlay(browser, numOfRequest, stepName);
                    break;
                case "AddRetryOnRetry":
                    showTransactionHistory(stepName, browser);
                    break;
                case "AddLimitsRetry":
                    var playground = contentManager.getPlayground(stepName);
                    playground.startTimeline();
                    break;
                case "AddDelayRetry":
                    var playground = contentManager.getPlayground(stepName);
                    playground.startTimeline();
                    break;
                case "AddJitterRetry":
                    var playground = contentManager.getPlayground(stepName);
                    playground.startTimeline();
                    break;
            }
        } else {
            if (checkURL === __welcomePageURL){
                browser.setBrowserContent(browserContentHTML);
            } else if (checkURL !== "") {
                browser.setBrowserContent("/guides/iguide-retry-timeout/html/page-not-found.html");
            } else {
                browser.setBrowserContent("");
            }
        }
    };

    var showBrowserOverlay = function(browser, numOfRequest, stepName) {
        if (numOfRequest === 1) {
            setTimeout(function () {
                var overlayText = retryTimeout_messages["OVERLAY_TEXT"];
                browser.enableBrowserOverlay(overlayText);
            }, 5000);
        }
    };

    var showTransactionHistory = function(stepName, browser) {
        var loadingTimeInterval = setInterval(function() {
            clearInterval(loadingTimeInterval);
//        contentManager.setBrowserURL(stepName, browserURL);
            browser.setURL(__browserTransactionBaseURL);
            browser.setBrowserContent(htmlRootDir + "transaction-history.html");
        }, 3000);  // Timeout is set to 3000 milliseconds = 2000ms timeout + some processing time
    };

    var __populateURL = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...

            // Put the browser into focus if here from clicking an action button.
            var webBrowser = contentManager.getBrowser(stepName);
            webBrowser.contentRootElement.trigger("click");

            contentManager.setBrowserURL(stepName, __browserTransactionBaseURL);
        }
    };

    var __listenToBrowserForTransactionHistory = function(webBrowser) {
        var setBrowserContent = function(currentURL) {
            var stepName = webBrowser.getStepName();
            var currentInstructionIndex = contentManager.getCurrentInstructionIndex(stepName);
            handleTransactionRequestInBrowser(webBrowser, stepName, currentInstructionIndex);
        }
        webBrowser.addUpdatedURLListener(setBrowserContent);
    };

    var addRetryAnnotationButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Put the BankService.java editor into focus.
            contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);

            switch (stepName) {
                case 'AddRetryOnRetry':
                    __addRetryOnRetryInEditor(stepName);
                    break;
                case 'AddLimitsRetry':
                    __addLimitsRetryInEditor(stepName);
                    break;
                case 'AddDelayRetry':
                    __addDelayRetryInEditor(stepName);
                    break;
                case 'AddJitterRetry':
                    __addJitterRetryInEditor(stepName);
                    break;
                case 'AddAbortOnRetry':
                    __addAbortOnRetryInEditor(stepName);
                    break;
            }
        }
    };

    var __addRetryOnRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 12, 12, newContent, 1);
    };

    var __addLimitsRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries = 4,\n           maxDuration = 10,\n           durationUnit = ChronoUnit.SECONDS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 13, newContent, 4);
        // line number to scroll to = insert line + the number of lines to be insert
        // for this example 13 + 4 = 17
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
    };

    var __addDelayRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries = 4,\n           maxDuration = 10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay = 200, delayUnit = ChronoUnit.MILLIS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 16, newContent, 5);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
    };

    var __addJitterRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries = 4,\n           maxDuration = 10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay = 200, delayUnit = ChronoUnit.MILLIS,\n           jitter = 100,\n           jitterDelayUnit = ChronoUnit.MILLIS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 17, newContent, 7);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
    };

    var __addAbortOnRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = {TimeoutException.class, IOException.class},\n           maxRetries = 4,\n           maxDuration = 10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay = 200, delayUnit = ChronoUnit.MILLIS,\n           jitter = 100,\n           jitterDelayUnit = ChronoUnit.MILLIS,\n           abortOn = FileNotFoundException.class)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 14, 20, newContent, 8);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
    };

    var __checkRetryAnnotationInContent = function(content, parmsToCheck) {
        var annotationIsCorrect = true;
        var editorContentParts = __getEditorParts(content);
        if (editorContentParts.hasOwnProperty("retryParms")) {
            var parmsInAnnotation = __isParmInRetryAnnotation(editorContentParts.retryParms, parmsToCheck);
            if (parmsInAnnotation !== 1) {
                annotationIsCorrect = false;
            }
        } else {
            annotationIsCorrect = false;  // None specified
        }
        return annotationIsCorrect;
    };

    /**
     * Match the parameters in the annotation to those expected and their
     * expected value.
     *
     * @param  annotationParms - inputted parms array to validate
     *                           Each entry is a string of form
     *                              name = value
     * @param  parmsToCheck - array of expected parameters and their
     *                           expected values.
     *
     * @returns 0 if the expected parms are not present
     *          1 if there is a match for each expected parm & its value
     *          2 if there are more parms specified than expected
     */
    var __isParmInRetryAnnotation = function(annotationParms, parmsToCheck) {
        var parms = [];     // Array of parm objects { parm, value }
        var allMatch = 1;   // Assume all match

        // For each parameter, pull apart parameter name and its value
        $(annotationParms).each(function(index, element) {
            if (element.indexOf("=") !== -1) {
                parms[index] = {};
                parms[index].name = element.trim().substring(0, element.indexOf('='));
                parms[index].value = element.trim().substring(element.indexOf('=') + 1);
            }
        });

        // Now check that each expected parm (parmsToCheck array) and its
        // value exists in inputted parms.
        $(parmsToCheck).each(function(index, element) {
            var elementMatch = false;
            if (element.indexOf("=") !== -1) {
                // For each expected parameter, pull apart parameter name and its value
                var expectedParm = element.trim().substring(0, element.indexOf('='));
                var expectedValue = element.trim().substring(element.indexOf('=') + 1);

                // Loop through inputted parms to see if expected parm exists
                $(parms).each(function(parmsIndex, parmsElement) {
                    if (parmsElement.name === expectedParm &&
                        parmsElement.value === expectedValue) {
                            elementMatch = true;
                            return false;   // break out of loop
                    }
                });
            }

            if (elementMatch === false) {
                allMatch = 0;
                return false;   // break out of loop
            }
        });

        if (allMatch === 1 && annotationParms.length > parmsToCheck.length) {
            allMatch = 2 // extra Parameters
        }

        return allMatch;
    };

    /**
     * Parse the content of the editor to pull out the @Retry annotation
     * and its paramters.
     *
     * @param  content - content of the editor
     *
     * @returns editorContents - object containing
     *              retryParms - array of strings.  Each string is of form
     *                                 retryparms=value
     *                           as specified in the content
     *              afterAnnotationContent - copy of content appearing after the
     *                           @Retry annotation
     */
    var __getEditorParts = function(content) {
        var editorContents = {};
        try {
            // match:
            //
            // public class BankService {
            //  < space or newline >
            //     @Retry(...)
            //     @Timeout(2000)
            //     public Service showTransactions()....
            //
            // and capture groups to get content before the annotation,
            // the @Retry annotation, the @Retry annotation params, and
            // content after the annotation.
            //
            // Syntax:
            //  \s to match all whitespace characters
            //  \S to match non whitespace characters
            //  \d to match digits
            //  () capturing group
            //  (?:) noncapturing group
            //
            // Result:
            //   groups[0] - same as content
            //   groups[1] - content before the @Retry annotation
            //   groups[2] - the whole @Retry annotation
            //   groups[3] - the @Retry parameters
            //   groups[4] - content after the @Retry annotation
            var codeToMatch = "([\\s\\S]*public class BankService {\\s*)" +     // Before the @Retry
                              "(@Retry" + "\\s*" + "\\(" + "\\s*" +
                              "((?:\\s*(?:retryOn|maxRetries|maxDuration|durationUnit|delay|delayUnit|jitter|jitterDelayUnit|abortOn)\\s*=\\s*[\\d\.,a-zA-Z]*)*)" +
                              "\\s*" + "\\))" +
                              "(\\s*@Timeout\\(2000\\)[\\s\\S]*)";              // After the @Retry
            var regExpToMatch = new RegExp(codeToMatch, "g");
            var groups = regExpToMatch.exec(content);

            var parms = groups[3];   // String of just the @Retry paramters
            parms = parms.replace('\n','');
            parms = parms.replace(/\s/g, '');  // Remove white space
            if (parms.trim() !== "") {
                parms = parms.split(',');
            } else {
                parms = [];
            }

            editorContents.retryParms = parms;
            editorContents.afterAnnotationContent = groups[4];

        } catch (e) {

        }
        return editorContents;
    };

    /**
     * Parse the content of the editor to check that BOTH IOException
     * and TimeoutException were specified for the 'retryOn' parameter,
     * separated by a comma of course!
     *
     * This is specifically for the AddAbortOnRetry step.
     *
     * @param  content - content of the editor
     *
     * @returns true if both were specified
     *          false if one, both, or other exceptions were specified
     */
    var __checkMultiRetryOnAnnotationInContent = function(content) {
        try {
            var codeToMatch = "retryOn\\s*=\\s*{\\s*(?:TimeoutException.class\\s*,\\s*IOException.class|IOException.class\\s*,\\s*TimeoutException.class)\\s*}";
            var regExpToMatch = new RegExp(codeToMatch, "g");
            if (regExpToMatch.exec(content) !== null) {
                return true;
            }
        } catch (e) {

        }
        return false;
    }

    // Save the @Retry annotation as currently shown into the editor object.  This
    // includes marking the correct lines for writable and read-only.
    var __saveRetryAnnotationInContent = function(editor, content) {
        utils.saveContentInEditor(editor, content, "@Retry\\s*(?:\\([^\\(\\)]*\\))");
    };

    // Save the @Timeout annotation as currently shown into the editor object.  This
    // includes marking the correct lines for writable and read-only.
    var __saveTimeoutAnnotationInContent = function(editor, content) {

        utils.saveContentInEditor(editor, content, "@Timeout\\s*\\(\\s*2000\\s*\\)");
    };

    var createPlayground = function(root, stepName) {
        if(!root.selector){
            root = root.contentRootElement;
        }

        var playground = retryTimeoutPlayground.create(root, stepName);
        contentManager.setPlayground(stepName, playground, 0);
    };

    var __updatePlayground = function(editor) {
        var stepName = editor.getStepName();
        var playground = contentManager.getPlayground(stepName);
        if (stepName === 'Playground') {
            playground.updatePlayground();
        } else {
            if (!playground) {
                // If the step's playground has not yet been created, create it.
                var pod = contentManager.getPod(stepName);
                createPlayground(pod, stepName);
                playground = contentManager.getPlayground(stepName);
            }

            var contentValid = __validateContent(editor);
            if (contentValid) {
                // Put the browser into focus.
                var webBrowser = contentManager.getBrowser(stepName);
                webBrowser.contentRootElement.trigger("click");

                playground.updatePlayground();
            }

        }
    };

    var __validateContent = function(editor) {
        var stepName = editor.getStepName();
        var content = editor.getEditorContent();
        var paramsToCheck = getParamsToCheck(stepName);
        var contentIsCorrect = false;
        if (__checkRetryAnnotationInContent(content, paramsToCheck)) {
            contentIsCorrect = true;
            __saveRetryAnnotationInContent(editor, content);
        }
        utils.handleEditorSave(stepName, editor, contentIsCorrect, __correctEditorError, mapStepNameToScollLine[stepName], bankServiceFileName);
        return contentIsCorrect;
    };

    var getParamsToCheck = function(stepName) {
        var paramsToCheck = [];
        if (stepName === "AddLimitsRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                            "maxRetries=4",
                            "maxDuration=10",
                            "durationUnit=ChronoUnit.SECONDS"
                            ];
        } else if (stepName === "AddDelayRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                            "maxRetries=4",
                            "maxDuration=10",
                            "durationUnit=ChronoUnit.SECONDS",
                            "delay=200",
                            "delayUnit=ChronoUnit.MILLIS"
                            ];
        } else if (stepName === "AddJitterRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                            "maxRetries=4",
                            "maxDuration=10",
                            "durationUnit=ChronoUnit.SECONDS",
                            "delay=200",
                            "delayUnit=ChronoUnit.MILLIS",
                            "jitter=100",
                            "jitterDelayUnit=ChronoUnit.MILLIS"
                            ];
        }
        return paramsToCheck;
    };

    var listenToBrowserForRefresh = function(webBrowser) {
        var replayPlayground = function(currentURL) {
            var stepName = webBrowser.getStepName();
            var playground = contentManager.getPlayground(stepName);
            playground.replayPlayground();
        };
        webBrowser.addUpdatedURLListener(replayPlayground);
    };

    return {
        listenToEditorForFeatureInServerXML: listenToEditorForFeatureInServerXML,
        addMicroProfileFaultToleranceFeatureButton: addMicroProfileFaultToleranceFeatureButton,
        addMicroProfileFaultToleranceFeature: __addMicroProfileFaultToleranceFeature,
        saveServerXML: __saveServerXML,
        saveServerXMLButton: saveServerXMLButton,
        saveButtonEditor: saveButtonEditor,
        addTimeoutButton: addTimeoutButton,
        clickTransaction: clickTransaction,
        listenToEditorForTimeoutAnnotation: listenToEditorForTimeoutAnnotation,
        listenToBrowserForTransactionHistory: __listenToBrowserForTransactionHistory,
        listenToEditorForInitialRetryAnnotation: listenToEditorForInitialRetryAnnotation,
        listenToPlayground: listenToPlayground,
        listenToBrowserForRefresh: listenToBrowserForRefresh,
        correctEditorError: __correctEditorError,
        populateURL: __populateURL,
        addRetryAnnotationButton: addRetryAnnotationButton,
        createPlayground: createPlayground
    }
})();