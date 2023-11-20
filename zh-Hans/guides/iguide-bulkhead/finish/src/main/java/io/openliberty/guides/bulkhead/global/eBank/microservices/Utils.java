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
package io.openliberty.guides.bulkhead.global.eBank.microservices;

public class Utils {


    private static String[] __advisors = {"Bob", "Jenny", "Lee", "Mary", "John", "Mike", "Sam", "Sandy", "Joann", "Frank" };
    private static String[] __advisorInitials = {"B", "J", "L", "M", "J", "M", "S", "S", "J", "F"};

    public static String getHTMLForChatWithVFA(int requestNum) {
        String advisor = __advisors[requestNum - 1];
        String chatAdvisorCount = "You are talking to advisor #" + requestNum;
        String chatIntro = "Hi, I am " + advisor + ",";
        String advisorInitials = __advisorInitials[requestNum - 1];

        String msg =  "<div class='chatAdvisorCount'>" + chatAdvisorCount + "</div>" +
        "<div class='advisorChatBlock'>" +
        "    <div class='flexContainer'>" +   
        "        <div class='advisorInitialBlock'>" +
        "            <span class='advisorInitial'>" + advisorInitials + "</span>" +
        "        </div>" +
        "        <div class='advisorChat'>" +
        "            <span class='advisorName'>" + chatIntro + "</span> an AI financial advisor from Global eBank. Let me review your account. I'll be with you shortly." +
        "        </div>" +
        "    </div>" +
        "</div>" +
        "<div class='customerChatBlock flexContainer'>" +
        "    <input type='text' class='customerChatInput' aria-label='Chat input from customer' value='For demo only'/>" +
        "    <button class='customerChatSubmitButton' title='For demo only'>Submit</button>" +
        "</div>";
        return msg;
    }

    public static String getHTMLForWaitingQueue(int waitQueue) {
        String msg = "<div>" +
                     "<p class='dotdotdot'><span>.</span><span>.</span><span>.</span></p>" +
                     "</div>" +
                     "<div>" +
                     "<p class='errorTextBox'>There are no financial advisors available.<br>You are number <b>" + waitQueue + "</b> in the queue.</p>" +
                     "</div>";
        return msg;
    }

    public static String getHTMLForBusy() {
        return "<div class='spacing errorTextBox'>All financial advisors are currently busy.<br>Please try again later.</div>";
    }

    public static String getHTMLForScheduleAppt() {
        String msg = 
        "<script>" +
        "function timeCheck(value) {" +
        "   document.getElementById('scheduleSubmitButton').disabled = false;" +
        "}" +
        " " +
        "function submitSchedule() {" +
        "   document.getElementById('formContent').style.display = 'none';" +
        "   document.getElementById('formResponse').style.display = 'block';" +
        "}" +
        "</script>" +
        "<div id='formContent' class='chatIntroText fallbackForm'>" +
        "<p>All financial advisors are busy with customers. Please schedule an appointment to chat with a financial advisor.</p>" +
        "<hr>" +
        "<p>Select from available times tomorrow:</p>" +
        "   <div class='timeChoices'>" +
        "        <input type = 'radio' name = 'aptTime' value = 'nine' onclick='timeCheck(this.value)' />9:00am<br>" +
        "        <input type = 'radio' name = 'aptTime' value = 'one' onclick='timeCheck(this.value)' />1:00pm<br>" +
        "        <input type = 'radio' name = 'aptTime'  value = 'twoThirty' onclick='timeCheck(this.value)' />2:30pm" +
        "   </div>" +
        "<div>" +
        "   <button id='scheduleSubmitButton' class='scheduleButton' onclick='submitSchedule()' disabled> Submit </button>" +
        "</div>" +
        "</div>" +
        "<div id='formResponse' class='timeResponse'>" +
        "<p class='errorTextBox' style='margin-top: 120px'>Thank you!</p>" +
        "</div>";
        return msg;
    }

    public static String getHTMLRestart() {
        return "<div class='spacing errorTextBox'>Please restart the server and retry the scenario.</div>";
    }

    public static int calculateAdvisorNum(int requests) {
        int localCounter = ((requests - 1) % 10) + 1;
        return localCounter;
    }

}