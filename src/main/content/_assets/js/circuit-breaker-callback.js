/*******************************************************************************
 * Copyright (c) 2017,2021 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/

 var circuitBreakerCallBack = (function() {
    var bankServiceFileName = "BankService.java";
    var checkBalanceURL = "https://global-ebank.openliberty.io/checkBalance";
    var welcomePageURL = "https://global-ebank.openliberty.io/welcome";
    var isRefreshing = false;
    var mapStepNameToScollLine = { 'AfterAddCircuitBreakerAnnotation': 14,
                                   'ConfigureFailureThresholdParams': 15,
                                   'ConfigureDelayParams': 16,
                                   'ConfigureSuccessThresholdParams': 17,
                                   'ConfigurefailOnskipOn': 18};

    var __refreshWebBrowserContent = function(webBrowser, htmlToLoad) {
        webBrowser.setBrowserContent(htmlToLoad);
    };

    /*
     * This function will display the check-balance-fail.html as is if useDelay is not set.
     * If useDelay is set, then wait until the content is loaded. Once the content is loaded,
     * display the loader and wait for 5 sec before displaying the system is down.
     */
    var __refreshCheckBalanceFailWithDelay = function(webBrowser, useDelay) {
        if (useDelay) {
            __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/check-balance-wait.html");
            setTimeout(
                function displaySystemDown() {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/check-balance-fail.html");
                }, 5000);
        } else {
            __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/check-balance-fail.html");
        }
    };

    var __listenToBrowserForFailBalance = function(webBrowser) {
        var setBrowserContent = function(currentURL) {
            // Check if the browser is currently handling a keypress for the browser URL by waiting on a timeout.
            if (isRefreshing){
                return;
            }
            if (currentURL.trim() === checkBalanceURL) {

                var stepName = this.getStepName();
                switch (stepName) {
                    case 'BankScenario':
                        __refreshCheckBalanceFailWithDelay(webBrowser, true);
                        contentManager.markCurrentInstructionComplete(stepName);
                        isRefreshing = true;
                        setTimeout(function () {
                            var stepWidgets = stepContent.getStepWidgets(stepName);
                            stepContent.resizeStepWidgets(stepWidgets, "pod", true);
                            contentManager.setPodContentWithSlideDown(stepName,
                                "<div class='flexWithPic'>" +
                                "<div class='flexPicDiv'>" +
                                "<img src='/guides/iguide-circuit-breaker/html/images/bank_2-01.svg' alt='" + circuit_breaker_messages.MICROSERVICE_DOWN + "' class='picInPod'></div>" +
                                "<p>" + circuit_breaker_messages.OH_NO +
                                "</p>" +
                                "</div>",
                                0
                                );
                            isRefreshing = false;
                        }, 5000);
                        break;
                    case 'ConfigureDelayParams':
                            // Put the browser into focus.
                            webBrowser.contentRootElement.trigger("click");

                            var currentStepIndex = contentManager.getCurrentInstructionIndex(stepName);
                            if (currentStepIndex === 1) {
                                __refreshCheckBalanceFailWithDelay(webBrowser);
                                contentManager.setPodContentWithRightSlide(stepName,
                                    "<div class='flexWithPic'>" +
                                    "<div class='circuitBreakerStates flexPicDiv'>" +
                                    " <img src='/guides/iguide-circuit-breaker/html/images/open_norm.svg' alt='" + circuit_breaker_messages.CHECK_BALANCE_OPEN + "' class='openCircuit picInPod playgroundImg infoShown'>" +
                                    " <img src='/guides/iguide-circuit-breaker/html/images/half_norm.svg' alt='" + circuit_breaker_messages.CHECK_BALANCE_HALF_OPEN + "' class='halfOpenCircuit picInPod playgroundImg'>" +
                                    "</div>" +
                                    "<div class='leftDelayPodText'>" +
                                    " <p>" + circuit_breaker_messages.ASSUMING_CIRCUIT  + "</p>" +
                                    " <p style='padding-top: 0;'> " + circuit_breaker_messages.CIRCUIT_REMAINS +  "</p>" +
                                    " <div class='delayCountdownText'><b>" + circuit_breaker_messages.DELAY + "&nbsp;&nbsp;</b><span class='delayCountdown delayCountdownColor'>5000 ms</span></div>" +
                                    "</div></div>",
                                    0
                                );
                                isRefreshing = true;

                                clearInterval(delayCountdownInterval);
                                var $delayCountdown = $('.delayCountdown');
                                var secondsLeft = 5000;
                                var delayCountdownInterval = setInterval(function () {
                                    secondsLeft -= 100;

                                    $delayCountdown.text(secondsLeft + " ms");
                                    if (secondsLeft <= 0) {
                                        clearInterval(delayCountdownInterval);   // Stop interval
                                        var stepPod = contentManager.getPod(stepName);

                                        // Remove red highlighting from countdown text
                                        $('.delayCountdown').removeClass("delayCountdownColor");

                                        // Update pic
                                        stepPod.contentRootElement.find('.picInPod').removeClass('infoShown');
                                        stepPod.contentRootElement.find('.halfOpenCircuit').addClass('infoShown');
                                        isRefreshing = false;
                                        contentManager.markCurrentInstructionComplete(stepName);

                                        // Remove sliding behavior from pod
                                        stepPod.contentRootElement.find('.pod-animation-slide-from-right').addClass('infoShown transitionalInfo').removeClass('pod-animation-slide-from-right');
                                    }
                                }, 100);
                            }
                        break;
                    case 'ConfigureFailureThresholdParams':
                        // Put the browser into focus.
                        webBrowser.contentRootElement.trigger("click");

                        var currentStepIndex = contentManager.getCurrentInstructionIndex(stepName);
                        if (currentStepIndex === 1) {
                           __refreshCheckBalanceFailWithDelay(webBrowser, true);
                           webBrowser.enableRefreshButton(false);
                           isRefreshing = true;
                           setTimeout(function () {
                                contentManager.setPodContentWithRightSlide(webBrowser.getStepName(),
                                    "<div class='flexWithPic'>" +
                                    "<div class='flexPicDiv'>" +
                                    "<img src='/guides/iguide-circuit-breaker/html/images/closed_serviceFailed.svg' alt='" + circuit_breaker_messages.CHECK_BALANCE_RESULT_CLOSED + "' class='picInPod'>" +
                                    "</div>" +
                                    "  <p>" + circuit_breaker_messages.THRESHOLD_1 + "</p>" +
                                    "</div>",
                                    0
                                );
                                webBrowser.enableRefreshButton(true);
                                isRefreshing = false;
                                contentManager.markCurrentInstructionComplete(stepName);
                            }, 5000);
                        } if (currentStepIndex === 2) {
                            __refreshCheckBalanceFailWithDelay(webBrowser, true);
                            isRefreshing = true;

                            var stepPod = contentManager.getPod(stepName);
                            var insertHTML = "<div class='transitionalInfo'><div class='flexWithPic'>" +
                                             "<div class='flexPicDiv'>" +
                                             "<img src='/guides/iguide-circuit-breaker/html/images/open_serviceFailed.svg' alt='" + circuit_breaker_messages.CHECK_BALANCE_RESULT_OPEN + "' class='picInPod'>" +
                                             "</div>" +
                                             "  <p>" + circuit_breaker_messages.THRESHOLD_2 + "</p>" +
                                             "</div></div>";
                            stepPod.contentRootElement.append(insertHTML);

                            setTimeout(function () {
                                stepPod.contentRootElement.find('.pod-animation-slide-from-right').addClass('transitionalInfo').removeClass('pod-animation-slide-from-right');
                                stepPod.contentRootElement.find('.transitionalInfo').last().addClass('infoShown');

                                isRefreshing = false;
                                contentManager.markCurrentInstructionComplete(stepName);
                            }, 5000);
                        }
                        break;
                }
            } else {
                if (currentURL.trim() === welcomePageURL) {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguides-common/html/interactive-guides/bankApp-welcome.html");
                } else {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/page-not-found.html");
                }
            }
        };
        webBrowser.addUpdatedURLListener(setBrowserContent);
    };

    var __listenToBrowserFromHalfOpenCircuit = function (webBrowser) {
        var setBrowserContent = function (currentURL) {
            // Put the browser into focus.
            webBrowser.contentRootElement.trigger("click");

            if (currentURL.trim() === checkBalanceURL) {
                var stepName = this.getStepName();
                var currentStepIndex = contentManager.getCurrentInstructionIndex(stepName);
                if (currentStepIndex === 1) {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/check-balance-success.html");
                    contentManager.setPodContentWithRightSlide(webBrowser.getStepName(),
                        "<div class='flexWithPic'>" +
                        "<div class ='flexPicDiv'>" +
                        "<img src='/guides/iguide-circuit-breaker/html/images/half_norm.svg' alt='" + circuit_breaker_messages.CHECK_BALANCE_RESULT_HALF_OPEN + "' class='picInPod'>" +
                        "</div>" +
                        "<p>" + circuit_breaker_messages.SUCCESSFUL_CALL1 + "</p> " +
                        "</div>",
                        0
                    );
                    contentManager.markCurrentInstructionComplete(stepName);
                }  else if (currentStepIndex === 2) {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/check-balance-success.html");

                    var stepPod = contentManager.getPod(stepName);
                    var insertHTML = "<div class='flexWithPic transitionalInfo'>" +
                                     "<div class='flexPicDiv'>" +
                                     "<img src='/guides/iguide-circuit-breaker/html/images/closed_norm.svg' alt='" +  circuit_breaker_messages.CHECK_BALANCE_CLOSED + "' class='picInPod'>" +
                                     "</div>" +
                                     " <p>" + circuit_breaker_messages.SUCCESSFUL_CALL2 + "</p> " +
                                     "</div>";
                    stepPod.contentRootElement.append(insertHTML);

                    setTimeout(function() {
                        stepPod.contentRootElement.find('.pod-animation-slide-from-right').addClass('transitionalInfo').removeClass('pod-animation-slide-from-right');
                        stepPod.contentRootElement.find('.transitionalInfo').last().addClass('infoShown');

                        contentManager.markCurrentInstructionComplete(stepName);
                    }, 100);
                }
            } else {
                if (currentURL.trim() === welcomePageURL) {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguides-common/html/interactive-guides/bankApp-welcome.html");
                } else {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/page-not-found.html");
                }
            }
        };
        webBrowser.addUpdatedURLListener(setBrowserContent);
        if (webBrowser.getStepName() === "ConfigureSuccessThresholdParams") {
            webBrowser.contentRootElement.addClass("");
        }
    };

    var __listenToBrowserForFallbackSuccessBalance = function(webBrowser) {
        var setBrowserContent = function(currentURL) {
            if (currentURL === checkBalanceURL) {
                var stepName = this.getStepName();
                __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/check-balance-fallback-success.html");
                contentManager.markCurrentInstructionComplete(stepName);
                isRefreshing = true;
                setTimeout(function () {
                    __transitionToNextImage(stepName);
                    __transitionToNextImage(stepName, 2);
                    // remove opacity for first image
                    __transitionToNextImage(stepName, 0, true);
                    isRefreshing = false;
                }, 200);
            } else {
                if (currentURL.trim() === welcomePageURL) {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguides-common/html/interactive-guides/bankApp-welcome.html");
                } else {
                    __refreshWebBrowserContent(webBrowser, "/guides/iguide-circuit-breaker/html/page-not-found.html");
                }
            }
        };
        webBrowser.addUpdatedURLListener(setBrowserContent);
    };

    var __listenToEditorForCircuitBreakerAnnotation = function(editor) {
        var __showPodWithCircuitBreaker = function() {
            var stepName = this.getStepName();
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            var paramsToCheck = [];
            var updateSuccess = false;
            if (__checkCircuitBreakerAnnotationInContent(content, paramsToCheck, stepName) === true) {
                updateSuccess = true;
                // Find images to transition from circuit to circuit with Circuit Breaker.
                __transitionToNextImage(stepName);
                // Save off the new content in this editor
                __saveCircuitBreakerAnnotationInContent(editor, content);
            }
            utils.handleEditorSave(stepName, editor, updateSuccess, __correctEditorError);
        };
        editor.addSaveListener(__showPodWithCircuitBreaker);
    };

    var __listenToEditorForAnnotationParamChange = function(editor) {
        var __validateConfigureParamsInEditor = function() {
            var updateSuccess = false;
            var stepName = editor.getStepName();
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            var paramsToCheck = [];

            if (stepName === "ConfigureFailureThresholdParams") {
                paramsToCheck[0] = "requestVolumeThreshold=2";
                paramsToCheck[1] = "failureRatio=0.5";
                if (__checkCircuitBreakerAnnotationInContent(content, paramsToCheck, stepName) === true) {
                    updateSuccess = true;
                }
            } else if (stepName === "ConfigureDelayParams") {
                paramsToCheck[0] = "requestVolumeThreshold=2";
                paramsToCheck[1] = "failureRatio=0.5";
                paramsToCheck[2] = "delay=5000";
                if (__checkCircuitBreakerAnnotationInContent(content, paramsToCheck, stepName) === true) {
                    updateSuccess = true;
                }
            } else if (stepName === "ConfigureSuccessThresholdParams") {
                paramsToCheck[0] = "requestVolumeThreshold=2";
                paramsToCheck[1] = "failureRatio=0.5";
                paramsToCheck[2] = "delay=5000";
                paramsToCheck[3] = "successThreshold=2";
                if (__checkCircuitBreakerAnnotationInContent(content, paramsToCheck, stepName) === true) {
                    updateSuccess = true;
                }
            } else if (stepName === "ConfigurefailOnskipOn") {
                paramsToCheck[0] = "requestVolumeThreshold=2";
                paramsToCheck[1] = "failureRatio=0.5";
                paramsToCheck[2] = "delay=5000";
                paramsToCheck[3] = "successThreshold=2";
                paramsToCheck[4] = "failOn=ConnectException.class";
                if (__checkCircuitBreakerAnnotationInContent(content, paramsToCheck, stepName) === true) {
                    updateSuccess = true;
                }
            }
            if (updateSuccess) {
                __saveCircuitBreakerAnnotationInContent(editor, content);
            }
            utils.handleEditorSave(stepName, editor, updateSuccess, __correctEditorError, mapStepNameToScollLine[stepName], bankServiceFileName);
        };
        editor.addSaveListener(__validateConfigureParamsInEditor);
    };

    var __listenToEditorForFallbackAnnotation = function(editor) {
        var __showPodWithCircuitBreakerAndFallback = function() {
            var stepName = this.getStepName();
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            var updateSuccess = false;
            if (__checkFallbackAnnotationContent(content) === true &&
                __checkFallbackMethodContent(content) === true) {
                updateSuccess = true;
                // Find images to transition from circuit breaker to circuit breaker with fallback.
                __transitionToNextImage(stepName, 0);
                __transitionToNextImage(stepName, 2);
                // Save off annotation in editor
                __saveFallbackAnnotationInContent(editor, content);
            }
            utils.handleEditorSave(stepName, editor, updateSuccess, __correctEditorError);
        };
        editor.addSaveListener(__showPodWithCircuitBreakerAndFallback);
    };

    var __listenToEditorForCircuitBreakerAnnotationChanges = function(editor){
        var __listenToContentChanges = function(editorInstance, changes) {
            var stepName = editor.getStepName();
            // Get pod from contentManager
            var cb = contentManager.getPlayground(stepName);
            // Get the parameters from the editor and send to the circuitBreaker
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName, 0);
            editor.addCodeUpdated();

            try{
                var matchPattern = "public class BankService\\s*{\\s*@CircuitBreaker\\s*\\((([^\\(\\)])*?)\\)\\s*public Service checkBalance";
                var regexToMatch = new RegExp(matchPattern, "g");
                var groups = regexToMatch.exec(content);
                var annotation = groups[1];

                var params = annotation.replace(/[{\s()}]/g, ''); // Remove whitespace and parenthesis
                params = params.split(',');

                // putting in defaults
                var requestVolumeThreshold = "20";
                var failureRatio = "0.5";
                var delay = "5000";
                var successThreshold = "1";

                // Parse their annotation for values
                var keyValueRegex = /(.*)=(.*)/;
                var match = null;
                $.each(params, function(i, param) {
                    match = keyValueRegex.exec(param);
                    if (!match) {  // invalid param format for @CircuitBreaker
                        throw circuit_breaker_messages.SYNTAX_ERROR;
                    }
                    switch(match[1]) {
                        case 'requestVolumeThreshold':
                            requestVolumeThreshold = match[2];
                            break;
                        case 'failureRatio':
                            failureRatio = match[2];
                            break;
                        case 'delay':
                            delay = match[2];
                            break;
                        case 'successThreshold':
                            successThreshold = match[2];
                            break;
                        case 'failOn':
                        case 'skipOn':
                            throw circuit_breaker_messages.FAILON_SKIPON_UNSUPPORTED;
                            break;
                        default:
                            throw circuit_breaker_messages.UNSUPPORTED_CB_PARAM;
                    }
                });

                // Prevent the user from setting the delay and success threshold in the failure step, since they are not introduced yet.
                if('ConfigureFailureThresholdParams' === editor.stepName){
                    delay = 5000;
                    successThreshold = -1;
                }
                // Prevent the user from setting the success threshold in the failure step, since it is not introduced yet.
                else if('ConfigureDelayParams' === editor.stepName){
                    successThreshold = -1;
                }

                // Apply the annotation values to the circuit breaker. If one is not specified, the value will be undefined and circuit breaker will use its default value
                cb.updateParameters.apply(cb, [requestVolumeThreshold, failureRatio, delay, successThreshold]);
            }
            catch(e){
                editorInstance.createCustomErrorMessage(e);
            }
        }
        var stepName = editor.getStepName();
        editor.contentValue = contentManager.getTabbedEditorContents(stepName, bankServiceFileName); // Reset the contentValue for undo and reset to work.
        editor.addSaveListener(__listenToContentChanges);
    };

    /* reset: to clear out/unset the opacity */
    var __transitionToNextImage = function(stepName, imageNum, reset) {
        // Find images to transition
        var stepPod = contentManager.getPod(stepName);
        var stepImages = stepPod.contentRootElement.find('img');
        // Fade out the top image to reveal the new changed state image
        if (imageNum === undefined) {
            imageNum = 1;
        }
        // If reset is set - remove the opacity value
        if (reset) {
            $(stepImages[imageNum]).css("opacity", '');
        } else {
            $(stepImages[imageNum]).css("opacity", 0);
        }
    }

    var __correctEditorError = function(stepName) {
        // correct annotation/method
        if (stepName === "AddFallBack") {
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            var hasFBMethod = __checkFallbackMethodContent(content);
            if (hasFBMethod === false) {
                __addFallBackMethod(stepName, false);
            }
            __addFallBackAnnotation(stepName);
        } else if (stepName === "AddLibertyMPFaultTolerance") {
            __addMicroProfileFaultToleranceFeature(stepName);
        } else {
            __addCircuitBreakerAnnotation(stepName);
        }
    };

    // functions to support validation
    /*
      Parse for @CircuitBreaker annotation in the content. If the annotation is there, then
      return the following three attributes:
         beforeAnnotationContent - content up to the annotation
         annotationParams - annotation parameters in an array with line break and extra spacing removed
         afterAnnotationContent - content after the annotation
    */
    var __getCircuitBreakerAnnotationContent = function(content) {
        var editorContents = {};
        try{
            // match
            // public class BankService {
            //   <space or newline>
            //   @CircuitBreaker(...)
            //   <space or newline>
            //   public Service checkBalance
            //
            // and capturing groups to get content before annotation, the annotation
            // params, and after annotation content.
            // Syntax:
            //  \s to match all whitespace characters
            //  \S to match non whitespace characters
            //  \d to match digits
            //  () capturing group
            //  (?:) noncapturing group
            var annotationToMatch = "([\\s\\S]*public class BankService {\\s*)(@CircuitBreaker" + "\\s*" + "\\(" + "\\s*" +
            "((?:\\s*(?:requestVolumeThreshold|failureRatio|delay|successThreshold|failOn)\\s*=\\s*[\\d.,a-zA-Z]*)*)" +
            "\\s*" + "\\))" + "(\\s*public\\s*Service\\s*checkBalance[\\s\\S]*)";
            var regExpToMatch = new RegExp(annotationToMatch, "g");
            var groups = regExpToMatch.exec(content);
            editorContents.beforeAnnotationContent = groups[1];

            var params = groups[3];
            params = params.replace('\n','');
            params = params.replace(/\s/g, ''); // Remove whitespace
            if (params.trim() !== "") {
                params = params.split(',');

            } else {
                params = [];
            }
            editorContents.annotationParams = params;
            editorContents.afterAnnotationContent = groups[4];
          }
          catch(e){

          }
          return editorContents;
    };

    /*
      Match the parameters. Returns
        0 for no match
        1 for exact match
        2 for extra parameters
    */
    var __isParamInAnnotation = function(annotationParams, paramsToCheck) {
        var params = [];
        var allMatch = 1;  // assume matching to begin with

        // for each parameter, break it down to name and value so as to make it easier to compare
        $(annotationParams).each(function(index, element){
            if (element.indexOf("=") !== -1) {
                params[index] = {};
                params[index].value = element.trim().substring(element.indexOf('=') + 1);
                params[index].name = element.trim().substring(0, element.indexOf('='));
            }
        });
        // now compare with the passed in expected params
        $(paramsToCheck).each(function(index, element){
            if (element.indexOf("=") !== -1) {
                var value = element.trim().substring(element.indexOf('=') + 1);
                var name = element.trim().substring(0, element.indexOf('='));
                var eachMatch = false;
                $(params).each(function(paramsIndex, annotationInEditor) {
                    if (annotationInEditor.name === name && annotationInEditor.value === value) {
                        eachMatch = true;
                        return false;  // break out of each loop
                    }
                });
                if (eachMatch === false) {
                    allMatch = 0;
                    return false; // break out of each loop
                }
            }
        });

        if (allMatch === 1 && annotationParams.length > paramsToCheck.length) {
            allMatch = 2; // extra parameters
        }
        return allMatch;
    };

    var __checkCircuitBreakerAnnotationInContent = function(content, paramsToCheck, stepName) {
        var annotationIsThere = true;
        var editorContentBreakdown = __getCircuitBreakerAnnotationContent(content);
        if (editorContentBreakdown.hasOwnProperty("annotationParams")) {
            var isParamInAnnotation = __isParamInAnnotation(editorContentBreakdown.annotationParams, paramsToCheck);
            if (isParamInAnnotation !== 1) {
                annotationIsThere = false;
            }
        } else {
            annotationIsThere = false;
        }
        return annotationIsThere;
    };

    /*
      Parse for @Fallback annotation in the content. Returns true if the annotation is there, otherwise false.
    */
    var __checkFallbackAnnotationContent = function(content) {
        var match = true;
        //var editorContentBreakdown = {};
        try {
            // match
            // public class BankService {
            //   @Fallback(fallbackMethod="fallbackService", applyOn="ConnectException.class")
            //   <space or newline here>
            //   @CircuitBreaker
            var annotationToMatch = "([\\s\\S]*public class BankService {\\s*)" +
                "(@Fallback\\s*\\(\\s*" + "((?:(?:fallbackMethod|applyOn)\\s*=\\s*" +
                "[\\\\\"{}.,a-zA-Z\\s*]*)*)\\s*\\))" + "(\\s*@CircuitBreaker)";
            var regExpToMatch = new RegExp(annotationToMatch, "g");
            var groups = regExpToMatch.exec(content);

            var parms = groups[3];  // String of just the Fallback parameters
            parms = parms.replace('\n','');
            parms = parms.replace(/\s/g, '');  // Remove white space
            if (parms.trim() !== "") {
                var annotationMatch = parms.match(/(applyOn={(ConnectException\.class,CircuitBreakerOpenException\.class|CircuitBreakerOpenException\.class,ConnectException\.class)}|fallbackMethod=\"fallbackService\"),(applyOn={(ConnectException\.class,CircuitBreakerOpenException\.class|CircuitBreakerOpenException\.class,ConnectException\.class)}|fallbackMethod=\"fallbackService\")/g);
                if (annotationMatch == null) {  // Fallback annotation parameters were not correct
                    match = false;
                }
            } else {
                match = false;   // Parameters are missing in syntax
            }
        }
        catch (e) {
            match = false;
        }
        return match;
    };

    var __checkFallbackMethodContent = function(content) {
        var match = false;
        try {
            // match
            //     return checkBalanceService();
            //   }
            //   <space or newline here>
            //   private Service fallbackService () {
            //     return balanceSnapshotService;
            //   }
            //   <space or newline here>
            // }
            var contentToMatch = "([\\s\\S]*)" + "(return\\s*checkBalanceService\\s*\\(\\s*\\)\\s*;\\s*})" +
            "(\\s*private\\s*Service\\s*fallbackService\\s*\\(\\s*\\)\\s*{\\s*return\\s*balanceSnapshotService\\s*\\(\\s*\\)\\s*;\\s*}\\s*})";
            var regExpToMatch = new RegExp(contentToMatch, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch (e) {

        }
        return match;
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
        var features = features.replace('\n', '');
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
                if (features.length !== "<feature>mpFaultTolerance-3.0</feature><feature>cdi-2.0</feature>".length) {
                    isFTFeatureThere = false; // contains extra text
                } else {
                    // Syntax is good. Save off this version of server.xml.
                    utils.saveFeatureInContent(editor, content, "mpFaultTolerance-3.0");
                }
            }
        } else {
            isFTFeatureThere = false;
        }
        utils.handleEditorSave(editor.stepName, editor, isFTFeatureThere, __correctEditorError);
        return isFTFeatureThere;
    };

    var __addMicroProfileFaultToleranceFeatureButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            __addMicroProfileFaultToleranceFeature(stepName);
        }
    };

    var __addMicroProfileFaultToleranceFeature = function(stepName) {
        var FTFeature = "      <feature>mpFaultTolerance-3.0</feature>";
        var serverFileName = "server.xml";
        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, serverFileName);

        contentManager.insertTabbedEditorContents(stepName, serverFileName, 5, FTFeature);
        var readOnlyLines = [];
        // mark cdi feature line readonly
        readOnlyLines.push({
            from: 4,
            to: 4
        });
        contentManager.markTabbedEditorReadOnlyLines(stepName, serverFileName, readOnlyLines);
    };

    var __addCircuitBreakerAnnotation = function(stepName) {
        // Put the BankService.java editor into focus.
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);

        // Reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var params = [];

        var constructAnnotation = function(params) {
            var circuitBreakerAnnotation = "    @CircuitBreaker(";
            if ($.isArray(params) && params.length > 0) {
                circuitBreakerAnnotation += params.join(",\n                    ");
            }
            circuitBreakerAnnotation += ")";
            return circuitBreakerAnnotation;
        };

        if (stepName === "AfterAddCircuitBreakerAnnotation") {
            contentManager.insertTabbedEditorContents(stepName, bankServiceFileName, 13, "    @CircuitBreaker()");
            contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
        } else if (stepName === "ConfigureFailureThresholdParams") {
            params[0] = "requestVolumeThreshold=2";
            params[1] = "failureRatio=0.5";
            contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 13, constructAnnotation(params), 2);
            contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
        } else if (stepName === "ConfigureDelayParams") {
            params[0] = "requestVolumeThreshold=2";
            params[1] = "failureRatio=0.5";
            params[2] = "delay=5000";
            contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 14, constructAnnotation(params), 3);
            contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
        } else if (stepName === "ConfigureSuccessThresholdParams") {
            params[0] = "requestVolumeThreshold=2";
            params[1] = "failureRatio=0.5";
            params[2] = "delay=5000";
            params[3] = "successThreshold=2";
            contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 15, constructAnnotation(params), 4);
            contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
        }  else if (stepName === "ConfigurefailOnskipOn") {
            params[0] = "requestVolumeThreshold=2";
            params[1] = "failureRatio=0.5";
            params[2] = "delay=5000";
            params[3] = "successThreshold=2";
            params[4] = "failOn=ConnectException.class";
            contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 16, constructAnnotation(params), 5);
            contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
        }
    };

    var __addCircuitBreakerAnnotationButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            __addCircuitBreakerAnnotation(stepName);
        }
    };

    // This is called when the 'Configure it' button is clicked in an instruction.
    // The playgroud for the corresponding configure step appears in the result
    // pod for the current step.
    var __configureIt = function(stepName) {
      // Fade out the existing pod content
      var stepPod = contentManager.getPod(stepName);

      // Create the Circuit Breaker playground for the step.
      if (stepName === "ConfigureFailureThresholdParams") {
        contentManager.setPodContent(stepName,
            "/guides/iguide-circuit-breaker/html/circuit-breaker-configure-failure-threshold.html",
            0, __createCircuitBreaker, true);
      } else if (stepName === "ConfigureDelayParams") {
        contentManager.setPodContent(stepName,
            "/guides/iguide-circuit-breaker/html/circuit-breaker-configure-delay.html",
            0, __createCircuitBreaker, true);
      } else if (stepName === "ConfigureSuccessThresholdParams" ||
                 stepName === "ConfigurefailOnskipOn") {
        contentManager.setPodContent(stepName,
            "/guides/iguide-circuit-breaker/html/circuit-breaker-configure-success-threshold.html",
            0, __createCircuitBreaker, true);
      }

      // Convert the step's editor to now update the playground created when changed.
      var editor = contentManager.getEditorInstanceFromTabbedEditor(stepName, bankServiceFileName);
      if (editor) {
          // reset the editor content in case it is messed up
          editor.closeEditorErrorBox();
          editor.resetEditorContent();
          // Scroll to the starting line number of the circuit-breaker annotation
          var lineNumber = editor.markTextWritable[0].from;
          editor.scrollToLine(lineNumber);
          __listenToEditorForCircuitBreakerAnnotationChanges(editor);
      }
      // Put the tabbedEditor into focus with  "BankService.java" file selected.
      contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);

      // Display the playground.
      var showPlaygroundInterval = setInterval(function () {
        var $cbContent = stepPod.contentRootElement.find('.circuitBreaker');
        if ($cbContent.length > 0) {
            clearInterval(showPlaygroundInterval);  // Stop interval when playground html is fully loaded

            stepPod.contentRootElement.find('.infoShown').first().removeClass('infoShown');
            stepPod.contentRootElement.find('.transitionalInfo').last().addClass('infoShown');
            contentManager.markCurrentInstructionComplete(stepName);
        }
      }, 100);
    };

    //The 'Configure it' button to bring up a playground for each configure step.
    var __configureItButton = function(event, stepName){
      event.preventDefault();
      event.stopPropagation();
      if (utils.isElementActivated(event)) {
          // Click or 'Enter' or 'Space' key event...
          __configureIt(stepName);
      }
    };

    var __addFallBackAnnotation = function(stepName, performReset) {
        // Put the BankService.java editor into focus.
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);

        var hasFBMethod;
        if (performReset === undefined || performReset) {
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            hasFBMethod = __checkFallbackMethodContent(content);
            // reset content every time annotation is added through the button so as to clear out any
            // manual editing
            contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
            if (hasFBMethod === true) {
                __addFallBackMethod(stepName, false);
            }
        }

        var fallbackAnnotation = "    @Fallback (fallbackMethod = \"fallbackService\",\n               applyOn={ConnectException.class, CircuitBreakerOpenException.class})";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 13, fallbackAnnotation, 2);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, 15);
    };

    var __addFallBackAnnotationButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            __addFallBackAnnotation(stepName);
        }
    };

    var __addFallBackMethod = function(stepName, performReset) {
        // Put the BankService.java editor into focus.
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);

        var hasFBAnnotation;
        if (performReset === undefined || performReset) {
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            hasFBAnnotation = __checkFallbackAnnotationContent(content);
            // reset content every time annotation is added through the button so as to clear out any
            // manual editing
            contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        }
        var fallbackMethod = "    private Service fallbackService() {\n" +
                             "        return balanceSnapshotService();\n" +
                             "    }\n";
        contentManager.insertTabbedEditorContents(stepName, bankServiceFileName, 24, fallbackMethod, 3);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, 27);

        if (hasFBAnnotation === true) {
            __addFallBackAnnotation(stepName, false);
        }
    };

    var __addFallBackMethodButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            __addFallBackMethod(stepName);
        }
    };

    var __enterButtonURLCheckBalance = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.setBrowserURL(stepName, checkBalanceURL);
            contentManager.refreshBrowser(stepName);
        }
    };

    var __saveButtonEditor = function(stepName) {
        contentManager.saveTabbedEditor(stepName, bankServiceFileName);
    };

    var __saveButtonEditorButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            __saveButtonEditor(stepName);
        }
    };

    var __refreshButtonBrowser = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.refreshBrowser(stepName);
        }
    };

    var __createCircuitBreaker = function(circuitBreakerPod, stepName, requestVolumeThresholdParm, failureRatioParm, delayParm, successThresholdParm) {
        var root = circuitBreakerPod.contentRootElement;
        var stepName = circuitBreakerPod.stepName;

        var requestVolumeThreshold = requestVolumeThresholdParm ? requestVolumeThresholdParm : 2,
            failureRatio = failureRatioParm ? failureRatioParm : 0.5,
            delay = delayParm ? delayParm : 5000,
            successThreshold = successThresholdParm ? successThresholdParm : -1;

        if (stepName === "ConfigureSuccessThresholdParams") {
            successThreshold = 2;
        }

        var cb = circuitBreaker.create(root, stepName, requestVolumeThreshold, failureRatio, delay, successThreshold);
        root.circuitBreaker = cb;

        root.find(".circuitBreakerSuccessRequest").on("click", function(){
            cb.sendSuccessfulRequest();
        });
        root.find(".circuitBreakerFailureRequest").on("click", function(){
            cb.sendFailureRequest();
        });
        root.find(".circuitBreakerReset").on("click", function(){
            cb.closeCircuit();
        });
        contentManager.setPlayground(stepName, cb, 0);

        root.find('.circuitBreakerSuccessRequest').trigger('focus');
    };

    var __listenToEditorForFeatureInServerXML = function(editor) {
        var __saveServerXML = function() {
          var stepName = this.getStepName();
          var serverFileName = "server.xml";
          var content = contentManager.getTabbedEditorContents(stepName, serverFileName);
          __checkMicroProfileFaultToleranceFeatureContent(editor, content);
        };
        editor.addSaveListener(__saveServerXML);
    };

    var __saveServerXMLButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.saveTabbedEditor(stepName, "server.xml");
        }
    };

    // Save the @CircuitBreaker annotation as currently shown into the editor object.
    // This includes marking the correct lines for writable and read-only.
    var __saveCircuitBreakerAnnotationInContent = function(editor, content) {
        utils.saveContentInEditor(editor, content, "@CircuitBreaker\\s*(?:\\([^\\(\\)]*\\))");
    };

    // Save the @Fallback annotation and method as currently shown in the editor object.
    // This includes marking the correct lines for writable and read-only.
    var __saveFallbackAnnotationInContent = function(editor, content) {
        try {
            // Save the new content for this editor.  Determine which lines
            // should be marked editable and which should be read-only.
            //
            // Use capture groups to get content before the editable content,
            // the editable content, and content after the editable part.
            // Then we can count the lines of code in each group in order
            // to correctly update the saved writable and read-only lines.
            //
            // Result:
            //   groups[0] - same as content
            //   groups[1] - content before the @Fallback annotation
            //   groups[2] - the editable (writable) lines
            //   groups[3] - content after the writable lines
            var codeToMatch = "([\\s\\S]*)" +
                            "(@Fallback\\s*(?:\\([^\\(\\)]*\\)))" +
                            "([\\s\\S]*)" +
                            "(\\s*private\\s*Service\\s*fallbackService\\s*\\(\\s*\\)\\s*{\\s*return\\s*balanceSnapshotService\\s*\\(\\s*\\)\\s*;\\s*})" +
                            "([\\s\\S]*)";
            var regExpToMatch = new RegExp(codeToMatch, "g");
            var groups = regExpToMatch.exec(content);

            var start = groups[1];
            var startLines = utils.countLinesOfContent(start);
            var annotation = groups[2];   // Group containing just the editable content
            var annotationLines = utils.countLinesOfContent(annotation) + 1;
            var middle = groups[3];
            var middleLines = utils.countLinesOfContent(middle) - 1;
            var method = groups[4];      // Group containing just the editable content
            var methodLines = utils.countLinesOfContent(method) + 1;
            var end = groups[5];
            var endLines = utils.countLinesOfContent(end);

            var markText = [{from: 1, to: startLines},
                            {from: startLines + annotationLines + 1, to: startLines + annotationLines + middleLines},
                            {from: startLines + annotationLines + middleLines + methodLines + 1, to: startLines + annotationLines + middleLines + methodLines + endLines}];
            var markTextWritable = [{from: startLines + 1, to: startLines + annotationLines},
                            {from: startLines + annotationLines + middleLines + 1, to: startLines + annotationLines + middleLines + methodLines}];
            editor.updateSavedContent(content, markText, markTextWritable);
        } catch (e) {

        }
    };

    return {
        listenToBrowserForFailBalance: __listenToBrowserForFailBalance,
        listenToBrowserForFallbackSuccessBalance: __listenToBrowserForFallbackSuccessBalance,
        listenToBrowserFromHalfOpenCircuit: __listenToBrowserFromHalfOpenCircuit,
        listenToEditorForCircuitBreakerAnnotation: __listenToEditorForCircuitBreakerAnnotation,
        listenToEditorForFallbackAnnotation: __listenToEditorForFallbackAnnotation,
        listenToEditorForCircuitBreakerAnnotationChanges: __listenToEditorForCircuitBreakerAnnotationChanges,
        listenToEditorForAnnotationParamChange: __listenToEditorForAnnotationParamChange,
        createCircuitBreaker: __createCircuitBreaker,
        addMicroProfileFaultToleranceFeatureButton: __addMicroProfileFaultToleranceFeatureButton,
        addCircuitBreakerAnnotationButton: __addCircuitBreakerAnnotationButton,
        addFallbackAnnotationButton: __addFallBackAnnotationButton,
        addFallbackMethodButton: __addFallBackMethodButton,
        enterButtonURLCheckBalance: __enterButtonURLCheckBalance,
        saveButtonEditorButton: __saveButtonEditorButton,
        refreshButtonBrowser: __refreshButtonBrowser,
        saveServerXMLButton: __saveServerXMLButton,
        listenToEditorForFeatureInServerXML: __listenToEditorForFeatureInServerXML,
        configureItButton: __configureItButton
    };
})();
