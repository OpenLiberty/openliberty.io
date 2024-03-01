/** 
  Copyright (c) 2018 IBM Corporation and others.
  All rights reserved. This program and the accompanying materials
  are made available under the terms of the Eclipse Public License v1.0
  which accompanies this distribution, and is available at
  http://www.eclipse.org/legal/epl-v10.html
 
  Contributors:
      IBM Corporation - initial API and implementation
*/
document.getElementById("redirectToVFA").onclick();
    
var vfaFail = "No virtual financial advisor could be retrieved";
function redirectToVFA (e) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('content').innerHTML = request.responseText;
            // hide ... msg
            document.getElementById('connecting').style.display='none';

            endChat(request.responseText);

            if (request.responseText.indexOf("You are number") > 0) {
                var stringToMatch = "You are number <b>(\\d+)<\\/b> in the queue";
                var regExpToMatch = new RegExp(stringToMatch, "g");
                var groups = regExpToMatch.exec(request.responseText);
                waitForQueueResult(groups[1]);
            }
        } else if (this.readyState == 4) {
            document.getElementById('connecting').style.display='none';
            displayText(vfaFail);
        }
    };
    request.open("GET", "/bulkheadSample/Bank/virtualFinancialAdvisor/vfa", true);
    request.setRequestHeader('Content-type', 'text/html');
    request.send();
};

function waitForQueueResult(numInQueue) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('content').innerHTML = request.responseText;
            document.getElementById('connecting').style.display='none';
            endChat(request.responseText);
        } else if (this.readyState == 4) {
            displayText(vfaFail);
        }
    };
    request.open("GET", "/bulkheadSample/Bank/virtualFinancialAdvisor/getResultInQueue/" + numInQueue, true);
    request.setRequestHeader('Content-type', 'text/html');
    request.send();
};

function endChat(responseText) {
    if (responseText.indexOf("advisorChat") > 0) {
        setTimeout(function() {
            displayText("Chat has ended");
        }, 60000);
    }
};

function displayText(text) {
    document.getElementById('content').innerHTML = "<div style='display: flex; height: 100px; justify-content: center; align-items:center;'>" + text + "</div>";
};

function timeCheck(value) {
    document.getElementById('scheduleSubmitButton').disabled = false;
};
 
function submitSchedule() {
    document.getElementById('formContent').style.display = 'none';
    document.getElementById('formResponse').style.display = 'block';
};
