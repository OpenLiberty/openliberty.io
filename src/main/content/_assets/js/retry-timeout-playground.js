var retryTimeoutPlayground = function() {
    var htmlRootDir = '/guides/iguide-retry-timeout/html/';
    var __browserTransactionBaseURL = 'https://global-ebank.openliberty.io/transactions';

    var _playground = function(root, stepName) {
        this.fileName = 'BankService.java';
        this.root = root;
        this.stepName = stepName;
        this.browser = contentManager.getBrowser(stepName);
        this.editor = contentManager.getEditorInstanceFromTabbedEditor(stepName, this.fileName);
    };

    _playground.prototype = {
        setParams: function(params) {
            var retryParams = params.retryParms;

            // Set params, or use default param values
            this.maxRetries = parseInt(retryParams.maxRetries);
            this.maxDuration = parseInt(retryParams.maxDuration);
            this.setMaxDurationOnTimeline(this.maxDuration);
            this.delay = parseInt(retryParams.delay);
            this.jitter = parseInt(retryParams.jitter);

            this.timeout = parseInt(params.timeoutParms.value);

            // maxRetries+1 is for timeoutsToSimulate. workaround to simulate the last timeout
            this.timeoutsToSimulate = this.maxRetries + 1;

            // If unlimited max duration, calculate theoretical using other params
            if (this.maxDuration === Number.MAX_SAFE_INTEGER && this.maxRetries !== -1) {
                this.maxDuration = this.calcMaxDuration();
            }

            this.progress1pct = this.maxDuration * 0.01; // Number Milliseconds in 1% of timeline.
            
        },
        startTimeline: function() {
            this.resetPlayground();
            this.ranOnce = true;

            var $tickContainers = $('[data-step=\'' + this.stepName + '\']').find('.tickContainer');
            this.timeoutTickContainer = $tickContainers[0];
            this.retryTickContainer = $tickContainers[1];
            this.progressBar = $('[data-step=\'' + this.stepName + '\']').find('.progressBar').find('div');

            if (!this.browser) {
                this.browser = contentManager.getBrowser(this.stepName);
            }
            this.browser.setBrowserContent(htmlRootDir + 'transaction-history-loading.html');
            this.setProgressBar();
        },

        updatePlayground: function() {
            this.resetPlayground();

            //TODO: this validation should be for playground step only
            // probably use existing validation for other steps.. somehow
            var params, paramsValid;
            try {
                params = this.getParamsFromEditor();
                // NOTE:  any errors found with the inputted parameter values will cause
                //        an appropriate error message to be thrown which will be caught
                //        below and shown to the user.

                // Retry guide steps use seconds for maxDuration, so convert to ms
                if (this.stepName !== 'Playground') {
                    params.retryParms.maxDuration = params.retryParms.maxDuration*1000;
                    paramsValid = this.verifyAndCorrectParams(params);
                    if (paramsValid) {
                        this.setParams(paramsValid);
                    }
                } else {
                    paramsValid = this.verifyAndCorrectParams(params);
                    if (paramsValid) {
                        this.setParams(paramsValid);
                        this.editor.addCodeUpdated();
                        // Put the browser into focus.
                        var webBrowser = contentManager.getBrowser(this.stepName);
                        webBrowser.contentRootElement.trigger("click");
                        
                        this.startTimeline(params);    
                    } else {
                        this.editor.createCustomErrorMessage(retryTimeout_messages.INVALID_PARAMETER_VALUE);
                    }
                }
            } catch(e) {
                this.editor.createCustomErrorMessage(e);
            }       
        },

        replayPlayground: function() {
            this.resetPlayground();
            if (this.ranOnce) {
                this.browser.setBrowserContent(htmlRootDir + 'transaction-history-loading.html');
                this.setProgressBar();
            }
        },

        resetPlayground: function() {
            if (!this.browser) {
                this.browser = contentManager.getBrowser(this.stepName);
            }
            if (!this.editor) {
                this.editor = contentManager.getEditorInstanceFromTabbedEditor(this.stepName, this.fileName);
            }
            this.editor.closeEditorErrorBox();

            clearInterval(this.moveProgressBar);
            if (this.progressBar) {
                this.resetProgressBar();
            }

            this.timeoutCount = 0;
            this.elapsedRetryProgress = 0;
            this.currentPctProgress = 0;

            $(this.timeoutTickContainer).empty();
            $(this.retryTickContainer).empty();
        },
        
        resetProgressBar: function() {
            this.progressBar.attr('style', 'width: 0%;');
        },

        calcMaxDuration: function() {
            return (this.timeoutsToSimulate) * (this.timeout + this.delay + this.jitter);
        },

        setMaxDurationOnTimeline: function(maxDurationValueInMS) {
            var maxDurationSeconds;
            if (maxDurationValueInMS === Number.MAX_SAFE_INTEGER) {
                maxDurationSeconds = '&infin; ';
            } else {
                // Convert the inputted MS value to Seconds
                maxDurationSeconds = Math.round((maxDurationValueInMS/1000) * 10)/10;
                if (maxDurationSeconds === 0) {
                    // If the converted value is less than .1s, convert to the 
                    // smallest amount of time greater than 0 seconds.
                    var convertedToSeconds = maxDurationValueInMS/1000;
                    var decimalPoints = 100;
                    while (maxDurationSeconds === 0) {
                        maxDurationSeconds = Math.round(convertedToSeconds * decimalPoints)/decimalPoints;
                        decimalPoints = decimalPoints * 10;
                    }
                }
            }
            
            // Add to the timeline in the playground.
            $maxDuration = $('[data-step=\'' + this.stepName + '\']').find('.timelineLegendEnd');
            $maxDuration.html(maxDurationSeconds + 's');
        },

        /**
         * Sets the timeout and retry ticks in the dashboard. Invoked from setProgress()
         * when a timeout should occur.  Re-invokes setProgress for the next "iteration".
         * 
         */
        setTicks: function() {
            this.timeoutCount++;

            // Show the timeout tick
            // Do the math...
            var timeoutTickPctPlacement = Math.round((this.elapsedRetryProgress/this.maxDuration) * 1000) / 10;  // Round to 1 decimal place
            if (this.currentPctProgress < timeoutTickPctPlacement) {
                if (timeoutTickPctPlacement <= 100) {
                    this.progressBar.attr('style', 'width:' + timeoutTickPctPlacement + '%;');
                    //console.log("set: " + timeoutTickPctPlacement + " -1");            
                    this.currentPctProgress = timeoutTickPctPlacement;           
                } else {
                    this.progressBar.attr('style', 'width: 100%');
                    this.browser.setBrowserContent(htmlRootDir + 'playground-timeout-error.html');
                    return;
                }
            }

            // Determine label for the timeout tick...convert from ms to seconds and round to 1 decimal place
            //console.log("Timeout: " + timeoutCount + " timeoutTickPctPlacement: " + timeoutTickPctPlacement);
            var timeoutLabel = (this.elapsedRetryProgress/1000).toFixed(2) + 's';
            var timeoutTickAdjustment = timeoutTickPctPlacement <= 1 ? '%);': '% - 3px);';
            $('<div/>').attr('class','timelineTick timeoutTick').attr('style','left:calc(' + timeoutTickPctPlacement + timeoutTickAdjustment).attr('title', timeoutLabel).appendTo(this.timeoutTickContainer);
            if (this.stepName !== 'Playground') {
                $('<div/>', {'class': 'timelineLabel timeoutLabel', text: timeoutLabel, style: 'left:calc(' + timeoutTickPctPlacement + '% - 29px);'}).appendTo(this.timeoutTickContainer);
            }

            if ((this.stepName === 'Playground') && (this.timeoutCount === this.timeoutsToSimulate)) {
                this.stopProgressBar();
                this.browser.setURL(__browserTransactionBaseURL);
                this.browser.setBrowserContent(htmlRootDir + 'playground-timeout-error.html');
                return;
            }

            // Show the retry tick
            var retryTickSpot = this.elapsedRetryProgress + this.delay;
            //console.log("retryTickSpot: " + retryTickSpot);
            if (this.jitter > 0 && this.delay > 0) {
                // Have a jitter that determines the next delay time.
                var positiveOrNegative = Math.random() < 0.5 ? -1: 1;
                var jitterDelay = Math.floor((Math.random() * this.jitter) + 1) * positiveOrNegative;
                //console.log("jitterDelay: " + jitterDelay);
                retryTickSpot += jitterDelay;
                //console.log("retryTickSpot adjusted for jitter: " + retryTickSpot);
            }
            var retryTickPctPlacement = Math.round((retryTickSpot/this.maxDuration) * 1000) / 10;  // Round to 1 decimal place
            var me = this;
            this.moveProgressBar = setInterval( function() {
                // Advance the blue progress bar 1% at a time until we reach the spot
                // for the retry tick.
                if (me.currentPctProgress < retryTickPctPlacement) { 
                    me.advanceProgressBar();
                } else {
                    clearInterval(me.moveProgressBar);
                    if (retryTickPctPlacement <= 100) {
                        // Move the blue progress bar exactly to the retry tick spot
                        me.progressBar.attr('style', 'width:' + retryTickPctPlacement + '%;');
                        //console.log("set: " + retryTickPctPlacement + " -5"); 
                        me.elapsedRetryProgress = retryTickSpot;
        
                        // Put up the retry tick at its spot...
                        // Determine label for the retry tick...convert from ms to seconds and round to 1 decimal place
                        var retryLabel = (me.elapsedRetryProgress/1000).toFixed(2) + 's';
                        //console.log("retry tick placed.  CurrentPctProgress: " + currentPctProgress);
                        var retryTickAdjustment = retryTickPctPlacement <= 1 ? '%);': '% - 3px);';
                        $('<div/>').attr('class','timelineTick retryTick').attr('style','left:calc(' + retryTickPctPlacement + retryTickAdjustment).attr('title', retryLabel).appendTo(me.retryTickContainer);
                        if (me.stepName !== 'Playground') {
                            $('<div/>', {'class': 'timelineLabel retryLabel', text: retryLabel, style: 'left:calc(' + retryTickPctPlacement + '% - 29px);'}).appendTo(me.retryTickContainer);

                            // Show transaction page after last retry
                            if (me.timeoutCount === me.maxRetries) {
                                me.stopProgressBar();
                                me.browser.setURL(__browserTransactionBaseURL);
                                me.browser.setBrowserContent(htmlRootDir + 'transaction-history.html');
                                return;
                            }
                        }

                        // Advance the progress bar until the next timeout
                        me.setProgressBar();    
                    } else {
                        // Hit max duration time limit before initiating a Retry.  Error out.
                        me.progressBar.attr('style', 'width: 100%;');
                        me.browser.setBrowserContent(htmlRootDir + 'playground-timeout-error.html');
                    }
                }
            }, this.progress1pct);
        },

        /**
         * Sets the progress in the progress bar timeline, then calls setTicks() to put
         * up the timeout and retry ticks.
         * 
         */
        setProgressBar: function() {
            var me = this;
            this.moveProgressBar = setInterval( function() {
                // Moves the timeline forward 1% at a time.  If no more timeouts should
                // be processed it stops and shows the transaction history.

                // Determine how far (% of timeline) we would travel in <timeout> milliseconds.
                var forwardPctProgress = Math.round(((me.elapsedRetryProgress + me.timeout)/me.maxDuration) * 1000) / 10;  // Round to 1 decimal place
                if (me.currentPctProgress + 1 < forwardPctProgress) {
                    me.advanceProgressBar();
                }  else {
                    clearInterval(me.moveProgressBar);
                    me.elapsedRetryProgress += me.timeout;
                    me.setTicks();
                }
            }, this.progress1pct);  // Repeat -- moving the timeline 1% at a time
        },

        advanceProgressBar: function() {
            this.currentPctProgress++;
            if (this.currentPctProgress < 100) {
                this.progressBar.attr('style', 'width:' + this.currentPctProgress + '%;');
            } else {
                // Exceeded maxDuration!
                this.stopProgressBar();
                this.browser.setURL(__browserTransactionBaseURL);
                this.browser.setBrowserContent(htmlRootDir + 'playground-timeout-error.html');
            }
        },

        stopProgressBar: function() {
            clearInterval(this.moveProgressBar);
            this.currentPctProgress++; // Advance the progress bar to simulate processing
            if (this.currentPctProgress < 100) {
                this.progressBar.attr('style', 'width:' + this.currentPctProgress + '%;');
            } else {
                this.progressBar.attr('style', 'width:100%;');
            }
        },

        getParamsFromEditor: function() {
            var editorContents = {};
            editorContents.retryParms = {};
            
            editorContents.retryParms = this.__getRetryParams();
            editorContents.timeoutParms = this.__getTimeoutParams();

            return editorContents;
        },

        __getRetryParams: function() {
            var content = this.editor.getEditorContent();
            var retryParms = {};
            // [0] - original content
            // [1] - Retry annotation
            // [2] - retry parameters as a string
            var retryRegexString = '@Retry\\s*' + '(\\(' +
            '((?:\\s*(?:\\w*)\\s*=\\s*[-\\d\.,a-zA-Z]*)*)*' +
            '\\s*\\))?';
            var retryRegex = new RegExp(retryRegexString, 'g');
            var retryMatch = retryRegex.exec(content);

            if (!retryMatch) {
                throw retryTimeout_messages.RETRY_REQUIRED;
            } else if (!retryMatch[2]) {
                // This just means the input didn't match the expected format.
                // Any non-empty code inside the parentheses should be invalid.
                var retryParamRegex = /@Retry\s*((?:\((.*\s*)\)?)|[\s\S]*\))?/g;
                var paramMatch = retryParamRegex.exec(content);
                // ensure empty parentheses match if they exist. else input is invalid
                if (paramMatch && paramMatch[1] && paramMatch[1].replace(/\s*/g, '') !== '()') {
                    throw retryTimeout_messages.INVALID_PARAMETER_VALUE;
                }
                return retryParms;
            }
            // Turn string of params into array
            var retryParamsString = retryMatch[2];
            retryParams = this.__parmsToArray(retryParamsString);

            var keyValueRegex = /(.*)=(.*)/;
            var match = null;
            var thisStepName = this.stepName;
            $.each(retryParams, function(i, param) {
                match = keyValueRegex.exec(param);
                if (!match) { // invalid param format for @Retry
                    throw retryTimeout_messages.SYNTAX_ERROR; 
                }
                switch (match[1]) {
                case 'retryOn':
                case 'abortOn':
                    if (thisStepName === 'Playground') {
                        throw retryTimeout_messages.RETRY_ABORT_UNSUPPORTED;
                    }
                    break;
                case 'maxRetries':
                case 'maxDuration':
                case 'delay':
                case 'jitter':
                    if (!match[2]) {
                        throw retryTimeout_messages.INVALID_PARAMETER_VALUE;
                    }
                    retryParms[match[1]] = match[2];
                    break;
                case 'durationUnit':
                case 'delayUnit':
                case 'jitterDelayUnit':
                    if (thisStepName === 'Playground') {
                        throw retryTimeout_messages.UNIT_PARAMS_DISABLED;
                    }
                    break;
                default:
                    throw retryTimeout_messages.UNSUPPORTED_RETRY_PARAM;
                }
            });
            return retryParms;
        },

        __getTimeoutParams: function() {
            var content = this.editor.getEditorContent();
            var timeoutParms = {};

            // [0] - original content
            // [1] - Timeout annotation
            // [2] - 'value=xyz' parameter if it exists
            // [3] - 'xyz' in `value=xyz' from above
            // [4] - standalone integer value parameter if it exists
            var timeoutRegexString = '\\s*(@Timeout)\\s*' + '(?:\\(' + 
            '((?:\\s*\\w+\\s*=\\s*([-\\w,.]*)\\s*)*)' + '\\)|(?:\\(\\s*([\\w]*)\\s*\\)))?'; // "(?:(?:unit|value)\\s*=\\s*[\\d\\.,a-zA-Z]+\\s*)*|"
            var timeoutRegex = new RegExp(timeoutRegexString, 'g');
            var timeoutMatch = timeoutRegex.exec(content);

            if (!timeoutMatch) {
                throw retryTimeout_messages.TIMEOUT_REQUIRED;
            }
            if (timeoutMatch[3] == '') {
                throw retryTimeout_messages.INVALID_PARAMETER_VALUE;
            }

            if (timeoutMatch[2]) { // valid parameter format
                var timeoutMatchString = timeoutMatch[2];
                var timeoutParams = this.__parmsToArray(timeoutMatch[2]);

                var keyValueRegex = /(.*)=(.*)/;
                var match = null;
                $.each(timeoutParams, function(i, param) {
                    match = keyValueRegex.exec(param);
                    if (!match) { // invalid param format for @Retry
                        throw retryTimeout_messages.SYNTAX_ERROR; 
                    }
                    switch (match[1]) {
                    case 'value':
                        if (!match[2]) {
                            throw retryTimeout_messages.INVALID_PARAMETER_VALUE;
                        }
                        timeoutParms[match[1]] = match[2];
                        break;
                    case 'unit':
                        throw retryTimeout_messages.UNIT_PARAMS_DISABLED;
                    default:
                        throw retryTimeout_messages.UNSUPPORTED_TIMEOUT_PARAM;
                    }
                });
            } else if (timeoutMatch[4]) { // else, standalone value (to be validated later)
                timeoutParms.value = timeoutMatch[4];
            } else { // else empty or some wrong format
                var timeoutParamRegex = /@Timeout\s*((?:\((.*\s*)\)?)|[\s\S]*\))?/g;
                var paramMatch = timeoutParamRegex.exec(content);
                // ensure empty parentheses match if they exist. else input is invalid
                if (paramMatch && paramMatch[1] && paramMatch[1].replace(/\s*/g, '') !== '()') {
                    throw retryTimeout_messages.INVALID_PARAMETER_VALUE;
                }
            }
            return timeoutParms;
        },
        
        // Checks if parameters are valid (all in milliseconds)
        // returns false if something is not valid and a generic message will be shown.  Else,
        //         throws an exception with appropriate message citing the parameter violation
        //         when the error is detected.
        // returns corrected parameters otherwise
        verifyAndCorrectParams: function(params) {
            var retryParms = params.retryParms;
            if (retryParms) {
                var maxRetries = this.__getValueIfInteger(retryParms.maxRetries);
                var maxDuration = this.__getValueIfInteger(retryParms.maxDuration);
                var delay = this.__getValueIfInteger(retryParms.delay);
                var jitter = this.__getValueIfInteger(retryParms.jitter);
        
                // If any variable is not valid, return false
                if (maxRetries === false ||
                    maxDuration === false ||
                    delay === false ||
                    jitter === false) {
                    return false;
                }

                if (maxRetries === -1 && maxDuration === 0) {
                    throw retryTimeout_messages.UNLIMITED_RETRIES;
                }

                if (maxRetries) {
                    if (maxRetries < -1) {
                        return false;
                    }
                } else if (maxRetries === null) {
                    maxRetries = 3;
                    params.retryParms.maxRetries = 3;
                }

                if (maxDuration !== null) { // 0 case matters and would get skipped in `if (maxDuration)`
                    if (maxDuration < 0) {
                        return false;
                    } else if (maxDuration === 0) {
                        maxDuration = Number.MAX_SAFE_INTEGER;
                        params.retryParms.maxDuration = Number.MAX_SAFE_INTEGER;
                    }
                } else {
                    maxDuration = 180000;
                    params.retryParms.maxDuration = 180000;
                }

                if (delay) {
                    if (delay < 0) {
                        return false;
                    }
                    if (delay > maxDuration) {
                        throw retryTimeout_messages.DURATION_LESS_THAN_DELAY;
                    }
                } else if (delay === null) {
                    delay = 0;
                    params.retryParms.delay = 0;
                }

                if (jitter) {
                    if (jitter < 0) {
                        return false;
                    }
                } else if (jitter === null) {
                    if (this.stepName === 'AddDelayRetry') {
                        //remove jitter in delay step for demonstration purposes
                        jitter = 0;
                        params.retryParms.jitter = 0;
                    } else {
                        jitter = 200;
                        params.retryParms.jitter = 200;    
                    }
                }

                // jitter clamp
                if (jitter > delay) {
                    params.retryParms.jitter = params.retryParms.delay;
                }
            }

            var timeoutParms = params.timeoutParms;
            if (timeoutParms) {
                var value = this.__getValueIfInteger(timeoutParms.value);
                if (value) {
                    if (value < 0) {
                        return false;
                    } 
                } else if (value === null) {
                    // Timeout was not specified. Default to 1000ms.
                    params.timeoutParms.value = 1000;
                } else if (value === 0) {
                    // Timeout = 0 is valid, but for our simulation we need
                    // to get a TimeoutException so Timeout has to be > 0.
                    throw retryTimeout_messages.ZERO_NOT_ALLOWED;
                } else {
                    return false;
                }
            }
            return params;
        },

        // returns the Integer value if the parameter string is an integer
        // returns null if nothing passed in
        // returns false if invalid input is passed in
        __getValueIfInteger: function(paramValueString) {
            if (paramValueString) {
                var regex =/^[-]?\d+$/gm; // regex for matching integer format
                var match = regex.exec(paramValueString);
                if (match) {
                    var param = match[0];
                    return parseInt(param);
                } else {
                    return false;
                }
            } else {
                return null;
            }
        },
        
        // converts the string of parameters into an array
        __parmsToArray: function(parms) {
            if (!parms) {
                throw retryTimeout_messages.INVALID_PARAMETER_VALUE;
            }
            parms = parms.replace(/\s/g, '');  // Remove white space
            if (parms.trim() !== '') {
                parms = parms.split(',');
            } else {
                parms = [];
            }
            return parms;
        }
    };

    var create = function(root, stepName) {
        return new _playground(root, stepName);
    };

    return {
        create: create
    };

}();