/******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 ******************************************************************************/
var supportedLanguages = ["cs",
                          "de",
                          "en",
                          "es", 
                          "fr",
                          "hu",
                          "it",
                          "ja",
                          "ko",
                          "pl",
                          "pt-br",
                          "ro",
                          "ru",
                          "zh",
                          "zh-tw"
                          ];

/**
 * Check if browser language is supported by us
 */
function checkIfLanguageSupported(browserLanguage){
    "use strict";
    var languageCode = "";
    
    if (supportedLanguages.indexOf(browserLanguage) !== -1) {
        languageCode = browserLanguage;
    } else if (browserLanguage.length === 5) { 
        var code = browserLanguage.substring(0, 2);
        if(supportedLanguages.indexOf(code) !== -1) {
            languageCode = code;
        }
    }  
  
    return languageCode;
}

/**
 * Get language code from the browser's list of languages
 */
function getLanguageCode(){
    "use strict";
    
    // Obtain browser languages
    var browserLanguages = navigator.languages;
    var languageCode = "";
    var browserLanguage = "";
    
    // Loop through languages and check if supported 
    if (browserLanguages) {
        for(var i=0; i<browserLanguages.length; i++){
            languageCode = checkIfLanguageSupported(browserLanguages[i].toLowerCase());
            if(languageCode){
                break;
            }
        }
    } else {
        browserLanguage = navigator.language ? navigator.language : navigator.userLanguage;
        languageCode = checkIfLanguageSupported(browserLanguage.toLowerCase());
    }
    // Default to English if no language found
    if (languageCode === ""){
        languageCode = "en";
    }

    return languageCode;
}

/**
 * Query all the data-externalizedString in html to translate the message.
 */
function retrieveExternalizedStrings(rootDir) {
    'use strict';
        
    var languageCode = getLanguageCode();

    var nlsFile = "messages.js";
    var lastIndex = (rootDir.length - 1);
    var lastStr = rootDir.substring(lastIndex);
    rootDir = (lastStr === "/") ? rootDir : rootDir + "/";
    var url = (languageCode !== "en") ? rootDir + languageCode + "/" + nlsFile :  rootDir + nlsFile;
    
    //Retrieve translations
    httpSendRequest(url);  
}

/**
 * Send request to the server side base on the browser language to retrieve the translate messages.
 */
function httpSendRequest(url) {
    'use strict';
    
    var httpReq = new XMLHttpRequest();
    var params = null;
    
    httpReq.open("GET", url, true);

    // Call a function when the state changes.
    httpReq.onreadystatechange = function () {
        if (httpReq.readyState === 4 && httpReq.status === 200) {   
            replaceExternalizedStrings(httpReq.responseText);
        } else if (httpReq.readyState === 4 && httpReq.status !== 200) {
            console.log('Unable to retrieve externalize string');
        }
    };
    httpReq.send(params);
}

/**
 * Parse the http response string for translate messages into key=value array
 */
function parseQuery(qstr) {
    'use strict';
    
    var query = {};
    var firstIndex = qstr.indexOf("{") + 1; 
    var lastIndex = qstr.lastIndexOf("}");
    var s = qstr.substring(firstIndex, lastIndex);
    var a = s.split(',');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split(':');
        var key = b[0].trim();
        var value = b[1].trim();

        var fI = value.indexOf("\"") + 1;
        var lI = value.lastIndexOf("\"");
    
        var res = value.substring(fI, lI);   
        query[key] = (res);
    }
    return query;
}

function findMatchingKey(queryArr, msgKey) {
    'use strict';
    
    var translateMsg = "";
    
    for (var key in queryArr) {
        if (queryArr.hasOwnProperty(key)) {
            if (key.trim().valueOf() === msgKey.trim().valueOf()) {
                translateMsg = queryArr[key];
                break;
            } 
        }
    }
    return translateMsg;
}

function appendDate(element, translateMsg) {
    var date = translateMsg + element.innerHTML;
    return date;
}

/**
 * Query for all strings and replace them with translate messages into key=value array
 */

function replaceExternalizedStrings(responseText) {
    'use strict';  
    var messages = parseQuery(responseText);

    var allExternalizedStrs = Array.prototype.slice.call(document.querySelectorAll("[data-externalizedString]"));
    allExternalizedStrs.forEach(function(element) {
        element.innerHTML = messages[element.dataset.externalizedstring];
    });

    var allExternalizedAriaLabels = Array.prototype.slice.call(document.querySelectorAll("[data-externalizedAriaLabel]"));
    allExternalizedAriaLabels.forEach(function(element) {
        element.setAttribute("aria-label", messages[element.dataset.externalizedarialabel]);
    });

    var allExternalizedTitles = Array.prototype.slice.call(document.querySelectorAll("[data-externalizedTitle]"));
    allExternalizedTitles.forEach(function(element) {
        element.setAttribute("title", messages[element.dataset.externalizedtitle]);
    });

    var allExternalizedAlts = Array.prototype.slice.call(document.querySelectorAll("[data-externalizedAlt]"));
    allExternalizedAlts.forEach(function(element) {
        element.setAttribute("alt", messages[element.dataset.externalizedalt]);
    });

    var allExternalizedValues = Array.prototype.slice.call(document.querySelectorAll("[data-externalizedValue]"));
    allExternalizedValues.forEach(function(element) {
        element.setAttribute("value", messages[element.dataset.externalizedvalue]);
    });
};