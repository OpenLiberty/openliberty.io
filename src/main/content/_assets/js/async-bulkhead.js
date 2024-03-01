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
var asyncBulkhead = function(){

    var _asyncBulkhead = function(root, stepName, value, waitingTaskQueue){
        this.root = root;     // Root element that this asyncBulkhead is in
        this.stepName = stepName;
        this.updateParameters(value, waitingTaskQueue);
    };

    _asyncBulkhead.prototype = {

      // Update the parameters - invoked whenever the parameter values are set.
      updateParameters: function(value, waitingTaskQueue) {
        this.value = value ? value : 10;
        this.waitingTaskQueue = waitingTaskQueue ? waitingTaskQueue : 10;

        // Initialize chat request processed count
        this.requestChatCount = 0;

        this.initializeQueues();
      },

      initializeQueues: function() {
        var requestQueue = this.root.find(".bulkheadThreadpoolQueue");
        var waitingTasksQueue = this.root.find(".bulkheadWaitQueue");

        requestQueue.empty();
        waitingTasksQueue.empty();

        var queueSpot;
        // Thread pool queue - available chat spots
        for (queueSpot = 0; queueSpot < this.value; queueSpot++) {
           $("<img class='queuePerson' src='/guides/iguide-bulkhead/html/images/user_outline-green.svg' alt='Available chat session' />").appendTo(requestQueue);
        }
        // Wait queue - chats waiting to be queued
        for (queueSpot = 0; queueSpot < this.waitingTaskQueue; queueSpot++) {
          $("<img class='queuePerson' src='/guides/iguide-bulkhead/html/images/user_outline-orange.svg' alt='Available wait queue slot' />").appendTo(waitingTasksQueue);
        }
      },

      updateRequestSquares: function(requestContainer, waitQueueContainer) {
        // this.requestChatCount = total number of requests made
        // this.value = @Bulkhead parameter - number of concurrent threads
        //                                    to handle requests.
        // this.waitingTaskQueue = @Bulkhead parameter - size of the wait
        //                                    queue.

        var requestCount;          // Tracks number of requests processed on queues
        var queueSpots = requestContainer.find('img');

        for (requestCount = 0; requestCount < queueSpots.length && requestCount < this.requestChatCount; requestCount++) {
          queueSpots[requestCount].setAttribute('src', '/guides/iguide-bulkhead/html/images/user_green.svg');
          queueSpots[requestCount].setAttribute('alt', bulkhead_messages.ACTIVE_CHAT);
        }

        if (requestCount === this.requestChatCount && requestCount < queueSpots.length) {
          // The request queue is not full. Add empty chats to the request queue.
          var emptyRequestCount;
          for (emptyRequestCount = requestCount; emptyRequestCount < queueSpots.length; emptyRequestCount++) {
            queueSpots[emptyRequestCount].setAttribute('src', '/guides/iguide-bulkhead/html/images/user_outline-green.svg');
            queueSpots[emptyRequestCount].setAttribute('alt', bulkhead_messages.AVAILABLE_CHAT);
          }
          // No requests for the wait queue.  Fill with empty queue slots.
          queueSpots = waitQueueContainer.find('img');
          for (emptyRequestCount = 0; emptyRequestCount < queueSpots.length; emptyRequestCount++) {
            queueSpots[emptyRequestCount].setAttribute('src', '/guides/iguide-bulkhead/html/images/user_outline-orange.svg');
            queueSpots[emptyRequestCount].setAttribute('alt', bulkhead_messages.AVAILABLE_SLOT);
          }
        } else if (requestCount <= this.requestChatCount) {
          // There are more requests to display.  Spill them over to the wait queue.
          queueSpots = waitQueueContainer.find('img');
          var waitRequestCount;
          for (waitRequestCount = 0;
               requestCount < this.requestChatCount && waitRequestCount < queueSpots.length;
               requestCount++, waitRequestCount++) {
                 queueSpots[waitRequestCount].setAttribute('src', '/guides/iguide-bulkhead/html/images/user_orange.svg');
                 queueSpots[waitRequestCount].setAttribute('alt', bulkhead_messages.TAKEN_SLOT);
          }
          if (requestCount !== this.requestChatCount) {
            // Still requests that haven't been processed.  Issue BulkheadException.
            this.requestChatCount = this.value + this.waitingTaskQueue;  // Reset the requestChatCount to maximum
                                                                         // so 'End chat' request won't process
                                                                         // requests that were rejected.
            this.root.find(".bulkheadExceptionDiv").show();
          } else {
            this.root.find(".bulkheadExceptionDiv").hide();
            // The wait queue is not full.  Add empty boxes to the wait queue.
            for ( ; waitRequestCount < queueSpots.length; waitRequestCount++) {
              queueSpots[waitRequestCount].setAttribute('src', '/guides/iguide-bulkhead/html/images/user_outline-orange.svg');
              queueSpots[waitRequestCount].setAttribute('alt', bulkhead_messages.AVAILABLE_SLOT);
            }
          }
        }
      },

      /*
        Update the queues displayed in the Async Bulkhead pod
      */
      updateQueues: function() {
          var requestQueue = this.root.find(".bulkheadThreadpoolQueue");
          var waitingTasksQueue = this.root.find(".bulkheadWaitQueue");

          this.updateRequestSquares(requestQueue, waitingTasksQueue);

          var requestQueueSize = (this.requestChatCount < this.value ? this.requestChatCount : this.value);
          var waitQueueSize = 0;
          if (requestQueueSize === this.value) {
            // Filled the request queue.  Look for wait queue values.
            if ((requestQueueSize + this.waitingTaskQueue) >= this.requestChatCount) {
              waitQueueSize = this.requestChatCount - requestQueueSize;
            } else {
              // Also filled wait queue size.
              waitQueueSize = this.waitingTaskQueue;
            }
          }

          // Update request queue aria-label with the number of requests on the queue.
         requestQueue.attr('aria-label', bulkhead_messages.REQUESTED_CHATS + requestQueueSize + bulkhead_messages.SIZE_OF_TP + this.value);
          // Update waiting task queue aria-label with the number of requests on the waiting queue.
          waitingTasksQueue.attr('aria-label', bulkhead_messages.NUMBER_WAITING + waitQueueSize + bulkhead_messages.SIZE_OF_WAITING + this.waitingTaskQueue);
      },

      // Handle chat request and end chat requests
      handleRequest: function(startChat){
        if (startChat) {
          this.requestChatCount++;
        } else {
          // end chat selected
          if (this.requestChatCount > 0) {
            this.requestChatCount--;
          } else {
            this.requestChatCount = 0;
          }
        }
      },

      // Handles a successful chat request to the microservice
      sendStartChatRequest: function() {
        this.handleRequest(true);
        this.updateQueues();
      },

      // Handles a request to end a chat session
      sendEndChatRequest: function() {
        this.handleRequest(false);
        this.updateQueues();
      },

      // Reset the request and waiting queues so they are empty.
      resetQueues: function() {
        this.requestChatCount = 0;
        this.updateQueues();
        this.root.find(".bulkheadExceptionDiv").hide();
      },

      // Enables/disables the Chat Request, End Chat, and Reset buttons.
      //
      // enableAction: boolean   True to enable buttons, False to disable buttons
      enableActions: function(enableAction) {
        this.root.find('.bulkheadThreadRequestButton').prop("disabled", !enableAction);
        this.root.find('.bulkheadThreadReleaseButton').prop("disabled", !enableAction);
        this.root.find('.bulkheadResetButton').prop("disabled", !enableAction);
      }

    };

    var _create = function(root, stepName, value, waitingTaskQueue){
      return new _asyncBulkhead(root, stepName, value, waitingTaskQueue);
    };

    return {
        create: _create
    };
}();
