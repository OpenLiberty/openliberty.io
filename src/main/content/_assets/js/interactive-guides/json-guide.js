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
var jsonGuide = (function () {
    "use strict";

    var __guides = [];
    var __noGuideExist = "NO$$GUIDE$$EXIST";

    var __getJson = function (fullFileNameWithPath) {
        var deferred = new $.Deferred();
        var ajaxPromise = $.ajax({
            dataType: 'json',
            //url: "/guides/iguide-circuit-breaker/src/main/content/json-guides/" + fileName,
            url: fullFileNameWithPath,
            success: function(response) {
                //console.log("response", response);
                deferred.resolve(response);
            },
            error: function(jqXHR, status) {
                //console.log("not able to read " + fileName, status);
                deferred.resolve(__noGuideExist);
            }
        });
        return deferred;
    };

    var getGuides = function () {
        var deferred = new $.Deferred();
        __getJson('allGuides.toc').done(function(guidesToRead) {
            if (guidesToRead === __noGuideExist) {
                //console.log("Not table to read allGuides.toc");
            } else {
                //console.log("guidesToRead in done", guidesToRead);
                var promises = [];
                var done = 0;
                for (var i = 0; i < guidesToRead.length; i++) {
                    promises[i] = new $.Deferred();
                    //console.log("promises", promises);
                    __getJson(guidesToRead[i]).done(function (guide) {
                        if (guide !== __noGuideExist) {
                            __guides.push(guide);
                        }
                        //console.log("---- guides", __guides);
                        promises[done++].resolve();
                    });
                }

                $.when.apply($, promises).done(function () {
                    //console.log("------- all done");
                    deferred.resolve();
                });
            }
        });
        return deferred;
    };

    var getAGuide = function(guideName) {
        var deferred = new $.Deferred();
        __getJson(guideName).done(function (guide) {
            if (guide !== __noGuideExist) {
                __guides.push(guide);
            }
            deferred.resolve(guide);
        });
        return deferred;
    };

    var getSteps = function (guideName) {
        for (var i = 0; i < __guides.length; i++) {
            var guide = __guides[i];
            if (guide.name === guideName) {
                return guide.steps;
            }
        }
        return [];
    };

    var getStepsDefaultWidgets = function (guideName) {
        for (var i = 0; i < __guides.length; i++) {
            var guide = __guides[i];
            if (guide.name === guideName) {
                return guide.defaultWidgets;
            }
        }
        return [];
    }

    var getStepsConfigWidgets = function (guideName) {
        for (var i = 0; i < __guides.length; i++) {
            var guide = __guides[i];
            if (guide.name === guideName) {
                return guide.configWidgets;
            }
        }
        return [];
    }

    var getGuideDisplayTitle = function (guideName) {
        for (var i = 0; i < __guides.length; i++) {
            var guide = __guides[i];
            if (guide.name === guideName) {
                return guide.title;
            }
        }
        return [];
    };

    var getGuideDescription = function (guideName) {
        for (var i = 0; i < __guides.length; i++) {
            var guide = __guides[i];
            if (guide.name === guideName) {
                return guide.description;
            }
        }
        return [];
    };

    var getGithubRepo = function (guideName) {
        for (var i = 0; i < __guides.length; i++) {
            var guide = __guides[i];
            if (guide.name === guideName) {
                return guide.repo;
            }
        }
        return undefined;
    };

    return {
        getGuides: getGuides,
        getSteps: getSteps,
        getGuideDisplayTitle: getGuideDisplayTitle,
        getGuideDescription: getGuideDescription,
        getGithubRepo: getGithubRepo,
        getAGuide: getAGuide,
        getStepsDefaultWidgets: getStepsDefaultWidgets,
        getStepsConfigWidgets: getStepsConfigWidgets
    };

})();
