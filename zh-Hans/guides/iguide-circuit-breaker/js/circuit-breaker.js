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
var circuitBreaker = function(){

    var circuitState = {
      'closed': '0',
      'open': '1',
      'halfopen': '2'
    };

    var _circuitBreaker = function(root, stepName, requestVolumeThreshold, failureRatio, delay, successThreshold){
        this.root = root; // Root element that this circuitBreaker is in
        this.stepName = stepName;
        this.updateParameters(requestVolumeThreshold, failureRatio, delay, successThreshold);
    };

    
    _circuitBreaker.prototype = {
      // Reset the circuit back to a closed state and update the parameters
      updateParameters: function(requestVolumeThreshold, failureRatio, delay, successThreshold){
        this.state = circuitState.closed;
        this.requestVolumeThreshold = requestVolumeThreshold ? requestVolumeThreshold : 20;
        this.failureRatio = failureRatio ? failureRatio : 0.5;
        this.delay = delay ? delay : 5000;
        this.successThreshold = successThreshold ? successThreshold : 1;

        // Additional counters needed
        this.successCount = 0;
        this.failureCount = 0;
        this.failureLimit = requestVolumeThreshold * failureRatio;
        this.pastRequests = [];
        this.rollingWindow = [];
        this.showRollingWindow = true;

        clearInterval(this.delayInterval);
        this.root.find('.delayCounter').text(circuit_breaker_messages.DELAYJS);

        this.updateDiagramAndCounters();
        this.__hideResetButton();
      },

      __showResetButton: function(){
        this.root.find(".circuitBreakerSuccessRequest, .circuitBreakerFailureRequest").hide();
        this.root.find(".circuitBreakerReset").show();
      },
  
      __hideResetButton: function(){
        this.root.find(".circuitBreakerSuccessRequest, .circuitBreakerFailureRequest").show();
        this.root.find(".circuitBreakerReset").hide();
      },

      addSuccessFailureSquares: function(container, array) {
        for(var i = 0; i < array.length; i++){
          var div = $("<div>");
          if(array[i] === circuit_breaker_messages.SUCCESS){
            div.addClass('box successBox');
          }
          else{
            div.addClass('box failureBox');
          }
          container.append(div);
        }
      },

      /*
        Update the counters in the Circuit Breaker pod
      */
      updateCounters: function(){
          if(this.state === circuitState.halfopen){
            this.root.find(".successCountDiv").css('visibility', 'visible');
          }
          else{
            this.root.find(".successCountDiv").css('visibility', 'hidden');
          }
          this.root.find(".successCount").text(circuit_breaker_messages.SUCCESS_COUNT + " " + this.successCount);

          // Display rolling window
          var rollingWindow = this.root.find(".circuitBreakerConnectionAttempts");
          rollingWindow.empty();
          if(this.pastRequests.length > 0 || this.rollingWindow.length > 0){
            if(this.showRollingWindow){
              rollingWindow.append("[");
            }            
            this.addSuccessFailureSquares(rollingWindow, this.rollingWindow);
            if(this.showRollingWindow){
              rollingWindow.append("]");
            } 
            this.addSuccessFailureSquares(rollingWindow, this.pastRequests);
          }

          // Update rolling window aria-label with the number of successes and failures
          this.root.find('.circuitBreakerRollingWindowDiv').attr('aria-label', circuit_breaker_messages.NUM_SUCCESSFUL + this.root.find('.sucessBox').length + circuit_breaker_messages.NUM_FAILED + this.root.find('.failureBox').length);

          // Show reset button and hide the success/failure buttons for the steps where the rest of the circuit breaker states are not introduced yet.
          if((this.stepName === "ConfigureFailureThresholdParams" && this.state === circuitState.open)
           || this.stepName === "ConfigureDelayParams" && this.state === circuitState.halfopen){
              this.__showResetButton();
          }
      },

      setFallback: function(callbackFunction){
        this.fallbackFunction = fallbackFunction;
      },

      checkForFailureRatio: function(){
        // The rolling window must have at least as many requests as the requestVolumeThreshold or else the circuit does not switch into open state.
        if(this.rollingWindow.length < this.requestVolumeThreshold){
          return;
        }
        var numFail = 0;
        for(var i = 0; i < this.rollingWindow.length; i++){
          if(this.rollingWindow[i] === circuit_breaker_messages.FAILURE){
            numFail++;
          }
        }
        if(numFail >= this.failureLimit){
          this.openCircuit();
        }
      },

      // Handle success and failure requests
      handleRequest: function(isSuccess){
        if(this.rollingWindow.length >= this.requestVolumeThreshold){
          this.pastRequests.unshift(this.rollingWindow[this.rollingWindow.length-1]);
          this.rollingWindow.splice(this.rollingWindow.length-1, 1);
        }
        if(isSuccess){
          this.rollingWindow.unshift(circuit_breaker_messages.SUCCESS);
        }
        else{
          this.rollingWindow.unshift(circuit_breaker_messages.FAILURE);
        }
      },

      // Handles a successful request to the microservice
      sendSuccessfulRequest: function(){
        switch(this.state){
          case circuitState.closed:
            // The circuit is already in a healthy state.
            this.handleRequest(true);            
            this.checkForFailureRatio();
            break;
          case circuitState.open:
            // Call the fallback if there is one. Otherwise, the service fails immediately
            if(this.fallbackFunction){
              this.fallbackFunction();
            }
            break;
          case circuitState.halfopen:
            this.handleRequest(true);
            // Update the count of successful invocations. If enough successful requests go through, the circuit switches back to closed.
            this.successCount++;
            if(this.successThreshold !== -1 && this.successCount >= this.successThreshold){
              this.closeCircuit();
            }
            break;
        }
        this.updateDiagramAndCounters();
      },      

      // Handles a failed request to the microservice
      sendFailureRequest: function(){
        this.successCount = 0;
        switch(this.state){
          case circuitState.closed:
            // Increase the failure count in the rolling window. If the total failures over the threshold, then the circuit changes to open.
            this.handleRequest(false);            
            this.checkForFailureRatio();
            break;
          case circuitState.open:
            // Call the fallback if there is one. Otherwise, the service fails immediately
            if(this.fallbackFunction){
              this.fallbackFunction();
            }
            break;
          case circuitState.halfopen:
            this.handleRequest(false);
            this.failureCount++;
            // Circuit switches back into open state
            this.openCircuit();
            break;
        }
        this.updateDiagramAndCounters();
      },

      updateDiagram: function(){
        switch(this.state){
          case circuitState.closed:
            if (!this.root.find('.closedCircuit').hasClass('infoShown')) {
              this.root.find('.circuitBreakerStates img').removeClass('infoShown');
              this.root.find('.closedCircuit').addClass('infoShown');
            }      
            break;
          case circuitState.open:
            if (!this.root.find('.openCircuit').hasClass('infoShown')) {
              this.root.find('.circuitBreakerStates img').removeClass('infoShown');
              this.root.find('.openCircuit').addClass('infoShown');
            }      
            break;
          case circuitState.halfopen:
            if (!this.root.find('.halfOpenCircuit').hasClass('infoShown')) {
              this.root.find('.circuitBreakerStates img').removeClass('infoShown');
              this.root.find('.halfOpenCircuit').addClass('infoShown');
            }      
            break;
        }
      },

      updateButtonAriaLabels: function() {
        switch(this.state){
          case circuitState.closed:
            this.root.find(".circuitBreakerSuccessRequest").attr('aria-label', circuit_breaker_messages.SIM_SUCCESS_CLOSED);
            this.root.find(".circuitBreakerFailureRequest").attr('aria-label', circuit_breaker_messages.SIM_FAILED_CLOSED);
            this.root.find(".circuitBreakerReset").attr('aria-label', circuit_breaker_messages.RESET_CLOSED);
            break;
          case circuitState.open:
            this.root.find(".circuitBreakerSuccessRequest").attr('aria-label', circuit_breaker_messages.SIM_SUCCESS_OPEN);
            this.root.find(".circuitBreakerFailureRequest").attr('aria-label', circuit_breaker_messages.SIM_FAILED_OPEN);
            this.root.find(".circuitBreakerReset").attr('aria-label', circuit_breaker_messages.RESET_OPEN);
         break;
          case circuitState.halfopen:
            this.root.find(".circuitBreakerSuccessRequest").attr('aria-label', circuit_breaker_messages.SIM_SUCCESS_HALF);
            this.root.find(".circuitBreakerFailureRequest").attr('aria-label', circuit_breaker_messages.SIM_FAILED_HALF);
            this.root.find(".circuitBreakerReset").attr('aria-label', circuit_breaker_messages.RESET_HALF);
         break;
        }
      },

      updateDiagramAndCounters: function() {
        this.updateDiagram();
        this.updateCounters();
        this.updateButtonAriaLabels();
      },

      /*
          Set the circuit to an open state.
          Any requests will be diverted to the fallback during this time.
          After the circuit delay, the circuit switches into half-open state.
      */
      openCircuit: function(){
        var me = this;
        this.state = circuitState.open;
        this.updateDiagramAndCounters();

        if (me.stepName === "ConfigureFailureThresholdParams") {
          return; // No need to go through delay since we haven't exposed that
                  // parameter yet at this step.  Otherwise, we go to a 
                  // half-open state at the end of the delay and visually the 
                  // user sees the rolling window "mysteriously" disappear.
        }

        var secondsLeft = this.delay;
        var delayCounter = this.root.find('.delayCounter');

        delayCounter.css('opacity', '1');
        delayCounter.text(circuit_breaker_messages.DELAYJS + " " + secondsLeft + " ms");
        this.delayInterval = setInterval(function(){
          secondsLeft -= 100;
          if (secondsLeft < 0) { 
              secondsLeft = 0; 
          }
          delayCounter.text(circuit_breaker_messages.DELAYJS + " " + secondsLeft + " ms");
          if(secondsLeft <= 0){
            delayCounter.css('opacity', '0.5');
            me.halfOpenCircuit();
            clearInterval(me.delayInterval);
          }
        }, 100);
      },

      /*
          Set the circuit to a closed state.
          The circuit will remain closed unless the microservice fails failureRatio * requestVolumeThreshold times
          during the requestVolumeThreshold window.
      */
      closeCircuit: function(){
        this.state = circuitState.closed;
        this.failureCount = 0;
        this.successCount = 0;
        this.pastRequests = [];
        this.rollingWindow = [];
        this.showRollingWindow = true;

        clearInterval(this.delayInterval);
        this.root.find('.delayCounter').text(circuit_breaker_messages.DELAYJS);

        // Update the pod to the closed circuit image by calling contentManager
        this.updateDiagramAndCounters();
        this.__hideResetButton();
      },

      /*
          Set the circuit to a half-open state.

      */
      halfOpenCircuit: function(){
        this.state = circuitState.halfopen;
        this.showRollingWindow = false;
        this.updateDiagramAndCounters();
      }
    };

    var _create = function(root, stepName, requestVolumeThreshold, failureRatio, delay, successThreshold){
      return new _circuitBreaker(root, stepName, requestVolumeThreshold, failureRatio, delay, successThreshold);
    };

    return {
        create: _create
    };
}();
