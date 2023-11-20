/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation
 *******************************************************************************/
var iguideMultipane = (function () {
    "use strict";

    var currentView;  // value is "single" or "multi"
    var widgetDivs, codeColumnDiv;
    var currentStepShow;  // keep track of where we are so that it calls resizeWidget only when step is changed

    var initView = function () {
        widgetDivs = $('.stepWidgetContainer');
        codeColumnDiv = $('#code_column');

        if (inSingleColumnView()) {
            currentView = 'single';
            multiToSingleColumn();
        } else {
            currentView = 'multi';
        }
    };

    var getCurrentViewType = function () {
        return currentView;
    };

    var multiToSingleColumn = function () {
        currentView = 'single';

        // JQuery's detach() method returns a NodeList which is tricky to iterate over
        var widgetDivsArray = [].slice.call(widgetDivs.detach());
        widgetDivsArray.map(function (widget) {
            var step = widget.dataset.step;
            var contentStepDiv = $('#contentContainer #' + step + '_content');

            var subsection = contentStepDiv.find('.sect2');
            if (subsection.length > 0) {
                subsection.before(widget);
            } else {
                contentStepDiv.append(widget);
            }

            var stepWidgetContainer = contentStepDiv.find('.stepWidgetContainer[data-step="' + step + '"]');
            var stepWidgetHeights = stepContent.getStepWidgetHeights(step, true);
            _adjustBrowserHeight(stepWidgetHeights, contentStepDiv.find('#' + step + '-webBrowser-0'));
            _adjustTabbedEditorHeight(stepWidgetHeights, contentStepDiv.find('#' + step + '-tabbedEditor-0'));
            _adjustPodHeight(stepWidgetHeights, contentStepDiv.find('#' + step + '-pod-0'));
            _adjustWidgetOrdering(stepWidgetContainer);           
        });
    };

    var singleToMultiColumn = function () {
        currentView = 'multi';

        var widgetDivsArray = [].slice.call(widgetDivs.detach());
        widgetDivsArray.map(function (widget) {
            codeColumnDiv.append(widget);

            // adjust the widget ordering and height of the widgets (with stepContent.resizeStepWidgets) in the code_column
            widget = $(widget);
            _adjustWidgetOrdering(widget);
            _resizeActiveWidget(widget);
        });
    };

    var _getWidgetHeight = function(stepWidgetHeights, widgetType) {
        var height = stepWidgetHeights[widgetType];
        if (height && height.indexOf('px') !== -1) { 
            height = parseInt(height.substring(0, height.indexOf('px')));
        }
        return height;
    }

    var _adjustPodHeight = function (stepWidgetHeights, pod) {
        var height = _getWidgetHeight(stepWidgetHeights, 'pod');
        if (pod.length > 0) {
            if (currentView === 'single') {
                pod.css('height', 'auto');
            } else {
                pod.css('height', height + 'px');
            }
        } else {
            height = 0;
        }
        return height;
    };

    var _adjustBrowserHeight = function (stepWidgetHeights, browser) {
        var height = _getWidgetHeight(stepWidgetHeights, 'webBrowser');
        if (browser.length > 0) {
           browser.css('height', height + 'px');
        } else {
            height = 0;
        }
        return height;
    };

    var _adjustTabbedEditorHeight = function (stepWidgetHeights, tabbedEditor) {
        if (tabbedEditor.length > 0) {
            if (currentView === 'single') {
                if (!tabbedEditor.hasClass('disableContainer')) {
                    // in single view set fix height 
                    var tabbedEditorHeight = _getWidgetHeight(stepWidgetHeights, 'tabbedEditor');
                    tabbedEditor.css('height', tabbedEditorHeight + 'px');
                }
            }
        }
    };

    var _adjustWidgetOrdering = function(stepWidgetContainer) {
        var widgets = stepWidgetContainer.find('.subContainerDiv');
        if (widgets.length > 0) {
            // flag to determine whether to move the editor as the first editor by default
            var isSingleColumnOrderSet = false;

            var stepName = stepWidgetContainer.attr('data-step');
            var browser = stepWidgetContainer.find('#' + stepName + '-webBrowser-0');
            var pod = stepWidgetContainer.find('#' + stepName + '-pod-0');
            var editor = stepWidgetContainer.find('#' + stepName + '-tabbedEditor-0');

            var stepWidgetsInfo = stepContent.getStepWidgets(stepName);
            var orderingWidgets = [];

            // figuring out the order of the widgets
            for (var i = 0; i < stepWidgetsInfo.length; i++) {
                if (inSingleColumnView()) {
                    var order = stepWidgetsInfo[i].singleColumnOrder;
                    if (order && $.isNumeric(order) && parseInt(order)) {
                        orderingWidgets[parseInt(order)] = stepWidgetsInfo[i].displayType;
                        isSingleColumnOrderSet = true;
                    } else {
                        orderingWidgets[i] = stepWidgetsInfo[i].displayType;
                    }
                } else {
                    orderingWidgets[i] = stepWidgetsInfo[i].displayType;
                }
            }

            // put the widgets in the order determined
            for (var i = 0; i < orderingWidgets.length; i++){
                if (orderingWidgets[i] === "webBrowser") {
                    browser.detach();
                    stepWidgetContainer.append(browser);
                } else if (orderingWidgets[i] === "pod") {
                    pod.detach();
                    stepWidgetContainer.append(pod);
                } else if (orderingWidgets[i] === "tabbedEditor") {
                    editor.detach();
                    stepWidgetContainer.append(editor);
                }
            }

            if (inSingleColumnView() && !isSingleColumnOrderSet) {
                // if no single column ordering is set, then move the editor as the first widget
                editor.detach();
                stepWidgetContainer.prepend(editor);
            }
        }
    };

    var resizeCodeColumnHeightInStepShown = function(isCallFromResize) {
        var stepContainer = $('.stepWidgetContainer.multicolStepShown');
        if (stepContainer.length > 0) {
            var stepToResize = stepContainer.attr('data-step');
            // resize widgets only if different step or call from the resize listener
            if (isCallFromResize || stepToResize !== currentStepShow) {
                currentStepShow = stepToResize;
                _resizeActiveWidget(stepContainer);
            }
        }
    };

    var _resizeActiveWidget = function(containerWidget) {
        var stepName = containerWidget.attr('data-step');
        var webBrowserWidget = containerWidget.find('#' + stepName + '-webBrowser-0');
        var editorWidget = containerWidget.find("#" + stepName + "-tabbedEditor-0");
        var podWidget = containerWidget.find("#" + stepName + "-pod-0");
        var activeWidgetType;
        if (webBrowserWidget && webBrowserWidget.hasClass('activeWidget')) {
            activeWidgetType = "webBrowser";
        } else if (editorWidget && editorWidget.hasClass('activeWidget')) {
            activeWidgetType = "tabbedEditor";
        } else if (podWidget && podWidget.hasClass('activeWidget')) {
            activeWidgetType = "pod";
        }
        stepContent.resizeStepWidgets(stepContent.getStepWidgets(stepName), activeWidgetType);
    };

    return {
        initView: initView,
        getCurrentViewType: getCurrentViewType,
        multiToSingleColumn: multiToSingleColumn,
        singleToMultiColumn: singleToMultiColumn,
        resizeCodeColumnHeightInStepShown: resizeCodeColumnHeightInStepShown
    };
})();


$(document).ready(function () {

    $(window).on('resize', function () {
        var currentView = iguideMultipane.getCurrentViewType();
        if (currentView === 'multi' && inSingleColumnView()) {
            iguideMultipane.multiToSingleColumn();
        } else if (currentView === 'single' && !inSingleColumnView()) {
            iguideMultipane.singleToMultiColumn();
        } else if (currentView === 'multi' && !inSingleColumnView()) {
            // passing in true to resize the widgets in the step
            iguideMultipane.resizeCodeColumnHeightInStepShown(true);
        }
    });

    $(window).on('scroll', function() {
        if (iguideMultipane.getCurrentViewType() === 'multi') {
            iguideMultipane.resizeCodeColumnHeightInStepShown();
        }
    });
});
