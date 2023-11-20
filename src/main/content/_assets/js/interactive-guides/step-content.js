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
var stepContent = (function() {
  "use strict";

  var currentStepName = ""; // Internal ID of the current step.  Not the hash ID.
  var _steps;
  var hashStepNames = {};   // Maps step's hash to its name.  This contains
                            // more entries than the _steps array because it also
                            // contains elements for sections which appear in the TOC.
  var _defaultWidgets;
  var _mapStepWidgets = {};
  var _mapWidgetsHeight = {}; // store widgets height
  var _mapWidgetsSingleColumnHeight = {}; // widget height for single column if different

  var setSteps = function(steps, defaultWidgets, configWidgets) {
    _steps = steps;
    _defaultWidgets = defaultWidgets;
    __getConfigurableWidgetsHeight(configWidgets);
    __createLinks();
  };

  /*
     1) Create the mapping between the step's name and its hash.  The hash
     for the step is created from its title.  Hashes must be created for
     sections as well as steps. It is created for every entry that appears
     in the Table of Contents (TOC). The hash may be used as the
     URL fragment identifier to go directly to a step or section.

     2) Create a reference to parent step for each section so it can load
     the parent step when selected from the Table of Contents or identified
     in the URL hash.
  */
  var __createLinks = function() {
    var step, section, hashIdentifier;

    for(var i = 0; i < _steps.length; i++){
      step = _steps[i];
      hashIdentifier = __createStepHashIdentifier(step.title);
      hashStepNames[hashIdentifier] = step.name;

      if(step.sections){
        for(var j=0; j<step.sections.length; j++){
          section = step.sections[j];
          hashIdentifier = __createStepHashIdentifier(section.title);
          hashStepNames[hashIdentifier] = section.name;

          section.parent = step;    // Link parent to the section
        }
      }
    }
  };

  /*
   Create the hash identifier for the TOC element.  This identifier
   can be used in the fragment identifier of a URL to indicate which
   page, or part of a page, to go to.

   The identifier is the step or section title converted to lower-case.
   Spaces and apostrophes are changed to dashes (-).
   Existing dashes and underscores are allowed to remain.
   All other characters are removed.

   elementTitle - step or section title (NOT name) which appears in the TOC.
  */
  var __createStepHashIdentifier = function(elementTitle) {
    var stepTitle = elementTitle.toLowerCase();
    // Get rid of any non-alphanumeric character that
    // is not a space, dash, or apostrophe.
    var cleanedStepTitle = stepTitle.replace(/[^\w\s-']/g, '');
    // Replace duplicate spaces with only one.
    var reducedStepTitle = cleanedStepTitle.replace(/\s\s+/g, ' ');
    // Replace spaces and apostrophes with a dash and remove duplicate dashes
    var hashIdentifier = reducedStepTitle.replace(/[\s']/g, '-').replace(/--+/g, '-');
    return hashIdentifier;
  };

  var getCurrentStepName = function() {
    return currentStepName;
  };

  /*
    Tracks the current stepName.  NOTE: this should be the internal stepName for 
                                        the step and NOT its hash ID.
  */
  var setCurrentStepName = function(stepName) {   
    currentStepName = stepName;
  }

  /* 
    Return the step or section name value associated with the hash value.  
    If the hash is not recognized, return an empty string.

    hash - string - hash value for a step.  Created in __createStepHashIdentifier(),
                    so it should NOT be preceeded with '#'.
  */
  var getStepNameFromHash = function(hash) {
    return hashStepNames[hash] ? hashStepNames[hash] : "";
  };

  // Append the element's title to the content
  var __addTitle = function(element, $stepContent) {
      if(!element.title){
        return;
      }
      var hashIdentifier = __createStepHashIdentifier(element.title);
      var newTitle;
      // If the element has a parent, it is a section and should have a h3 tag
      if(element.parent){
        newTitle = $("<h3 class='title' id='" + hashIdentifier + "'></h3>");
      }
      else{
        newTitle = $("<h2 class='title' id='" + hashIdentifier + "'></h2>");
      }
      newTitle.attr('aria-label', element.title);
      newTitle.attr('data-step', element.name);
      newTitle.html(element.title);
      $stepContent.append(newTitle);
  };

  // Append the step description text
  var __addDescription = function(step, $stepContent) {
    if(!step.description){
      return;
    }
    var description = step.description;
    if ($.isArray(description)) {
        $.each(description, function(i, desc) {
            if (desc) {
                if (!__containsHTMLTag(desc)) {
                    description[i] = $('<p>').html(desc).prop('outerHTML'); //Use .text instead of .html for debugging
                }
            }
        });
        description = description.join("");
    }
    var newDescription = $("<div class='description' tabindex='0'></div>");
    newDescription.attr('data-step', step.name);
    newDescription.html(description);
    $stepContent.append(newDescription);
  };

  //Used for the Description rendering (__addDescription)
  //Prevent certain description strings with these HTML tags that should not be wrapped in <p>
  var __containsHTMLTag = function(content) {
    if (content.indexOf("<ul>") !== -1 || content.indexOf("</ul>") !== -1 ||
        content.indexOf("<li>") !== -1 || content.indexOf("</li>") !== -1 ||
        content.indexOf("<h4>") !== -1 || content.indexOf("</h4>") !== -1 ||
        content.indexOf("<instruction>") !== -1 || content.indexOf("</instruction>") !== -1) {
            return true;
        }
    return false;
  };

  // Update the step instruction text
  var __updateInstructions = function(step, $stepContent) {
    var stepName = step.name;

    // Check if any instructions exist for this step
    if(!contentManager.checkIfInstructionsForStep(stepName)){
      return;
    }

    for (var index = 0; index < step.instruction.length; index ++ ) {
      var instruction = contentManager.getInstructionAtIndex(index, stepName);
      instruction = __parseInstructionForActionTag(instruction);
      if(instruction){
        // Append the instruction to the bottom of the current content.
        var instr = $(".instructionContent[data-step='" + stepName + "'][data-instruction='" + index + "']");
        instr = __addInstructionTag(stepName, instruction, index);
        $stepContent.append(instr);
      }
    }
  };

  var __addInstructionTag = function (stepName, instruction, index) {
    if (instruction != null) { // Some steps don't have instructions
      var instructionTag = $('<instruction>', {id: stepName + '-instruction-' + index, class: 'instruction', tabindex: 0});
      instructionTag.attr("data-step", stepName); // Set a data tag to identify the instruction block with this step
      if (index > 0) {
        instructionTag.addClass("unavailable");
        instructionTag.attr('aria-disabled', true);
        instructionTag.attr('tabindex', '-1');
        // Mark the instruction's actions disabled
        instruction = instruction.replace("tabindex='0'", "tabindex='-1'");
      }
      //var instrCompleteMark = $('<span>', {class: 'instrCompleteMark glyphicon glyphicon-check'});
      var instructionContentDiv = $("<div class='instructionContent'></div>");
      instructionContentDiv.attr("data-step", stepName); // Set a data tag to identify the instruction  with this step
      instructionContentDiv.attr("data-instruction", index);
      instructionContentDiv.html(instruction);
      //instructionTag.append(instrCompleteMark).append(instructionContentDiv);
      instructionTag.append(instructionContentDiv);
      return instructionTag;
    }
  };

  var __parseInstructionForActionTag = function(instruction) {
    if (instruction) {
      if ($.isArray(instruction)) {
        for (var i in instruction) {
          var instrStr = instruction[i];
          var newInstrStr = utils.parseActionTag(instrStr);
          if (newInstrStr) {
            instruction[i] = newInstrStr;
          }
        }
      } else {
        var newInstrStr = utils.parseActionTag(instruction);
        if (newInstrStr) {
          instruction = newInstrStr;
        }
      }
    }
    return instruction;
  };

  /*
    Searches through a step object (root) to see if the step or one of its
    sections has a name matching stepToFind.

    returns the step or section object if a match is found
  */
  var __findStepFromName = function(root, stepToFind){
    if(root.name === stepToFind){
      return root;
    }
    else if(root.sections){
      for(var i=0; i<root.sections.length; i++){
        var section = __findStepFromName(root.sections[i], stepToFind);
        if(section){
          return section;
        }
      }
    }
  };

  var createGuideContents = function() {
    var $stepContent, step;

    for(var i = 0; i < _steps.length; i++) {
      step = _steps[i];

      $stepContent = $("<div class='sect1' id='" + step.name + "_content'></div>");
      $("#contentContainer").append($stepContent);

      __buildContent(step, $stepContent);
      if(step.sections){
        var $sectionContent;
        for(var j = 0; j < step.sections.length; j++){
          $sectionContent = $("<div class='sect2' id='" + step.sections[j].name + "_content'></div>");
          $stepContent.append($sectionContent);
          __buildContent(step.sections[j], $sectionContent);
        }
      }
    }
    resizeGuideSections();
    createEndOfGuideContent();
  };

  var getStepWidgets = function(stepName) {
    return _mapStepWidgets[stepName];
  }

  var __createWidgetInfo = function(step) {
    var widgetInfo = [];

    // populate the widget object with displayType/state
    // enable: the widgets that are use in this step
    // active: the active one that will be interact first in this step
    // hidden: the widget is not show when initially display the step
    if (step.content) {
      $.each(step.content, function(index, content) {
          var widgetObj = {};
          widgetObj.displayType = content.displayType;
          widgetObj.enable = (content.enable === false) ? content.enable : true;
          widgetObj.active = (content.active === true) ? content.active : false;
          widgetObj.hidden = (content.hidden === true) ? content.hidden : false;
          // override the default ordering in single column view
          if (content.singleColumnOrder) {
            widgetObj.singleColumnOrder = content.singleColumnOrder;
          }
          // override the default configured height
          if (content.height) {
            widgetObj.customHeight = content.height;
          }
          widgetInfo.push(widgetObj);
      });
    }
    return widgetInfo;
  }

  var getCodeColumnHeight = function() {
    var columnHeight = 0;
    var rightColumn = $("#code_column:visible");
    if (rightColumn.length > 0) {
      columnHeight = window.innerHeight - 101;
    }
    return columnHeight;  
  }

  // get configurable widgets heights from json
  var __getConfigurableWidgetsHeight = function(configWidgets) {
      for (var i = 0; i < configWidgets.length; i++) {
        var widget = configWidgets[i];
        _mapWidgetsHeight[widget.displayType] = configWidgets[i].height;
        if (configWidgets[i].singleColumnHeight) {
          _mapWidgetsSingleColumnHeight[widget.displayType] = configWidgets[i].singleColumnHeight;
        }
      }
  }

  // return the widget object base on type
  var __getInfoForWidget = function(widgetsInfo, displayType) {
    var widgetInfo;
    for (var i = 0; i < widgetsInfo.length; i++) {
      if (widgetsInfo[i].displayType === displayType) {
        widgetInfo = widgetsInfo[i];
      }
    }
    return widgetInfo;
  }

  // WebBrowser: the height is either set in json for widget height when active or 70px when not active.
  // Pod: always same fix height that is set in json
  // Editor: if active then use fix height in the json, inactive is the remaining height - (pod + browser)
  //
  // If there is not enough height to fit all the widgets, scale the browser to minimum height for step 
  // with non-default widget. Editor may or may not shown depending on whether there is remaining height
  // to fit miniumum height browser and pod.
  var __setWidgetsHeight = function (widgetsInfo, activeWidgetType, enablePod) {

    var columnHeight = getCodeColumnHeight();
    if (columnHeight === 0) {
      return;
    }

    // Recalculate the height of visible right column
    var windowHeight = window.innerHeight;
    var endOfGuideTopPosition = $("#end_of_guide")[0].getBoundingClientRect().top;
    if (endOfGuideTopPosition > windowHeight) {
      $("#code_column").css('bottom', '0');
    }

    var numOfWidgets = widgetsInfo.length;

    var podWidget = __getInfoForWidget(widgetsInfo, "pod");;
    var browserWidget = __getInfoForWidget(widgetsInfo, "webBrowser");
    var editorWidget = __getInfoForWidget(widgetsInfo, "tabbedEditor");

    // this is for the margin-top + margin-bottom space surrounding each widget in the 3rd column.
    var marginHeight = parseInt("5");

    var browserWidgetHeight = _mapWidgetsHeight["webBrowser"];
    if (browserWidget && browserWidget.customHeight) {
      browserWidgetHeight = browserWidget.customHeight;
    }
    var browserMaxHeight = parseInt(browserWidgetHeight.substring(0, browserWidgetHeight.length - 2));
    var browserMinHeight = 70;

    var podWidgetHeight = _mapWidgetsHeight["pod"];
    if (podWidget && podWidget.customHeight) {
      podWidgetHeight = podWidget.customHeight;
    }
    var podHeight = parseInt(podWidgetHeight.substring(0, podWidgetHeight.length - 2));

    var editorWidgetMaxHeight = _mapWidgetsHeight["tabbedEditor"];
    if (editorWidget && editorWidget.customHeight) {
      editorWidgetMaxHeight = editorWidget.customHeight;
    }
    var editorMaxHeight = parseInt(editorWidgetMaxHeight.substring(0, editorWidgetMaxHeight.length - 2));

    // pod is fix height
    var isPodHidden = false;
    if (podWidget) {
      podWidget.height = podWidgetHeight;
      isPodHidden = podWidget.hidden;
    }

    // take care of margin here
    if (isPodHidden && enablePod === undefined) {
      columnHeight = columnHeight - marginHeight * (numOfWidgets - 1);
    } else {
      columnHeight = columnHeight - marginHeight * numOfWidgets;
    }

    if (activeWidgetType === "webBrowser") {
      // set browser height
      browserWidget.height = browserMaxHeight + "px";

      // set editor height
      // Note: if the columnHeight is too short to accomodate all the widgets, 
      // the editor may get a negative height. 
      if (editorWidget) {
        var editorHeight;
        if (numOfWidgets === 3) {
          if (isPodHidden) {
            editorHeight = columnHeight - browserMaxHeight;
          } else {
            editorHeight = columnHeight - browserMaxHeight - podHeight;
          }
        } else if (numOfWidgets === 2) {
          editorHeight = columnHeight - browserMaxHeight;
        }
        if (editorHeight < 0) {
          editorHeight = 0;
        }
        editorWidget.height = editorHeight + "px";
      }
    } else if (activeWidgetType === "tabbedEditor") {
      // set editor height
      var editorHeight = editorMaxHeight;

      if (numOfWidgets === 3) {
        if (browserWidget) {
          var browserHeight;
          // Again if columnHeight is too short, browser height may be negative. 
          // If browser height is negative, it will adjust to the min height in the
          // next block of codes.
          if (isPodHidden) {
            browserHeight = columnHeight - editorHeight;
          } else {
            browserHeight = columnHeight - editorHeight - podHeight;
          }

          // recalculate browser height if too tall or too short
          if (browserHeight < browserMinHeight) {
            // Has to recalculate editor height using column height that factors in margin space
            // as browserMinHeight is not a calculation factored in the margin space
            if (isPodHidden) {
              editorHeight = columnHeight - browserMinHeight
            } else {
              editorHeight = columnHeight - browserMinHeight - podHeight;
            }
            browserHeight = browserMinHeight;
          } else if (browserHeight > browserMaxHeight) {
            // browser height already factors in margin space ... recalculate just using editor height
            editorHeight = editorHeight + (browserHeight - browserMaxHeight);
            browserHeight = browserMaxHeight;
          }

          // set browser height to minimum if browser is disable and editor is not at max height
          if (editorHeight < editorMaxHeight && browserWidget.enable === false) {
            if (browserHeight > browserMinHeight) {
              editorHeight = editorHeight + (browserHeight - browserMinHeight);
              browserHeight = browserMinHeight;
            }
          }
          browserWidget.height = browserHeight + "px";
        }
      } else if (numOfWidgets === 2) {
        if (browserWidget) {
          var browserHeight = columnHeight - editorHeight;

          // extend editor height to make it taller and keep browser height to its max height
          if (browserHeight > browserMaxHeight) {
            // browser height already factors in margin space ... recalculate just using editor height
            editorHeight = editorHeight + browserHeight - browserMaxHeight;
            browserHeight = browserMaxHeight;
          } if (browserHeight < browserMinHeight) {
            // take care of negative and shorter than minimum browser height
            browserHeight = browserMinHeight;
            // recalculate editor height from column height with margin space factoring in
            editorHeight = columnHeight - browserHeight;
          }

          browserWidget.height = browserHeight + "px";
        } else if (podWidget) {
          editorHeight = columnHeight - podHeight;
        }
      }

      // take care of negative height
      if (editorHeight < 0) {
        editorHeight = 0;
      }

      editorWidget.height = editorHeight + "px";
    } else if (activeWidgetType === "pod") {
      if (enablePod) {
        // show pod
        var podContainer = $("#" + podWidget.id);
        podContainer.removeClass('hiddenContainer');
        podWidget.hidden = false;

        columnHeight = columnHeight - podHeight;
        var editorHeight;
        var browserHeight;
        if (numOfWidgets === 3) {
          // recalculate brower/editor height
          if (columnHeight - browserMaxHeight > 0) {
            browserHeight = browserMaxHeight;
          } else {
            // set the minimum browser height regardless
            browserHeight = browserMinHeight;
          }
          editorHeight = columnHeight - browserHeight;
          if (editorHeight < 0) {
            editorHeight = 0;
          }
        } else if (numOfWidgets === 2) {
          if (browserWidget) {
            // use the remaining height
            browserHeight = columnHeight;
          }
          if (editorWidget) {
            // use the remaining height
            editorHeight = columnHeight;
          }
        }
        if (browserHeight) {
          if (browserHeight < 0) {
            browserHeight = browserMinHeight;
          }
          browserWidget.height = browserHeight + "px";
        }
        if (editorHeight) {
          if (editorHeight < 0) {
            editorHeight = 0;
          }
          editorWidget.height = editorHeight + 'px';
        }
      }
    } else if (activeWidgetType === undefined) {
      // default widgets - not going to scale the browser to fit in other widgets
      if (browserWidget) {
        browserWidget.height = browserMaxHeight + "px";
      }
      if (editorWidget) {
        var editorHeight = editorMaxHeight;
        if (podWidget) {
          if (browserWidget) {
            editorHeight = columnHeight - browserMaxHeight - podHeight;
          } else {
            editorHeight = columnHeight - podHeight;
          }
        } else {
          if (browserWidget) {
            editorHeight = columnHeight - browserMaxHeight;
          }
        }
        if (editorHeight < 0) {
          editorHeight = 0;
        }
        editorWidget.height = editorHeight + "px";
      }
    }
  }

  // only one widget is active at a time
  var __getActiveWidget = function(widgetsInfo) {
    var activeWidget;
    for (var i = 0; i < widgetsInfo.length; i++) {
      if (widgetsInfo[i].active === true) {
        activeWidget = widgetsInfo[i];
      }
    }
    return activeWidget;  
  }

  var __getWidgetsInfoForStep = function(step) {

    var widgetsInfo = (step.content === undefined ? _defaultWidgets : __createWidgetInfo(step));
 
    // get active widget
    var activeWidget = __getActiveWidget(widgetsInfo);
    var activeWidgetType;
    if (activeWidget !== undefined) {
      activeWidgetType = activeWidget.displayType;
    }
    
    // populate the widgets object with height
    __setWidgetsHeight(widgetsInfo, activeWidgetType);

    return widgetsInfo;
  }

  var resizeWidgets = function(widgetsInfo, activeWidget, enablePod) {

    // set the current active widget to be used for resizing from single to multi column pane
    _addActiveWidgetClass(widgetsInfo, activeWidget);

    if (inSingleColumnView()) {
      if (activeWidget === "pod" && enablePod === true) {
          var podWidget = __getInfoForWidget(widgetsInfo, "pod");
          // show pod
          var podContainer = $("#" + podWidget.id);
          podContainer.removeClass('hiddenContainer');
      }
      return;
    }
    
    // readjust the widgets height
    __setWidgetsHeight(widgetsInfo, activeWidget, enablePod);

    // actual resize of widgets
    __resizeWidgets(widgetsInfo);

    // add hover over container if 
    // widget is not at full configurable height/custom height
    // widget is not a default widget
    // widget is not an active widget
    if (!inSingleColumnView()) {
      for (var i = 0; i < widgetsInfo.length; i++) {
        var widgetInfo = widgetsInfo[i];
        var subContainer = $("#" + widgetInfo.id);
        // unbind all the hover event
        var widgetOnHover = undefined;
        if (widgetInfo.displayType === "webBrowser") {
          widgetOnHover = subContainer.find(".wb")
        } else if (widgetInfo.displayType === "tabbedEditor") {
          widgetOnHover = subContainer.find(".teContainer");
        }
      
        if (widgetOnHover) {
          widgetOnHover.off('mouseenter mouseleave');
          if (widgetOnHover.hasClass('stepWidgetOnHover')) {
          widgetOnHover.removeClass('stepWidgetOnHover');
          }
        }
        
        if (__enabledWidgetOnHover(widgetInfo, activeWidget)) {  
          __widgetOnHover(subContainer, widgetInfo.displayType);
        }
      }
    }
  }

  var __resizeWidgets = function(widgetsInfo) {
    // actual resize of widgets
    for (var i = 0; i < widgetsInfo.length; i++) {
      var widgetId = widgetsInfo[i].id;
      var widgetContainer = $("#" + widgetId);
      widgetContainer.css("height", widgetsInfo[i].height);
      // Default 100% height is overridden under the cover during resizing.
      // Has to explicit reset the height back to 100%.
      if (widgetId.indexOf('tabbedEditor') !== -1) {
        var teContainer = widgetContainer.find('.teContainer');
        if (teContainer.length > 0) {
          teContainer.css('height', '100%');
        }
        var editorContainer = widgetContainer.find('.editorContainer');
        if (editorContainer.length > 0) {
          editorContainer.css('height', '100%');
        }
      } else if (widgetId.indexOf('webBrowser') !== -1) {
        var wb = widgetContainer.find('.wb');
        if (wb.length > 0) {
          wb.css('height', '100%');
        }
      }
    }
  }

  var _addActiveWidgetClass = function(widgetInfo, activeWidgetType) {
    var activeWidget;
    for (var i = 0; i < widgetInfo.length; i++) {
      var widgetId = widgetInfo[i].id;
      var widgetContainer = $("#" + widgetId);
      if (widgetContainer.hasClass('activeWidget')) {
        widgetContainer.removeClass('activeWidget');
      }
      if (widgetInfo[i].displayType === activeWidgetType) {
        activeWidget = widgetContainer;
      }
    }

    if (activeWidget) {
      activeWidget.addClass('activeWidget');
    }
  }

  // change the outline of the widget container when the widget is disable
  var __changeWidgetBorderColor = function(subContainer, displayType, disable) {
    var widget;
    if (displayType === "webBrowser") {
        widget = subContainer.find(".wb")
    } else if (displayType === "tabbedEditor") {
        widget = subContainer.find(".teContainer");
    } else if (displayType === "pod") {
        widget = subContainer.find(".podContainer");
    }
    if (widget) {
      if (disable === true) {
        widget.css("border-color", "#5E6B8D");     
      } else {
        widget.css("border-color", "#c8d6fb");
      }
    }    
  }

  var __createDefaultWidgets = function(step, widgetContainer, stepWidgets) {
    var displayTypeCounts = {};

    for (var i = 0; i < stepWidgets.length; i++){
        var widget = stepWidgets[i];
        var displayType = widget.displayType;
        var isEnable = widget.enable;
        var isHidden = widget.hidden;
        
        if (displayTypeCounts[displayType] === undefined){
            displayTypeCounts[displayType] = 0;
        } else {
            displayTypeCounts[displayType]++;
        }
        var displayTypeNum = displayTypeCounts[displayType];
        var subContainerId = step.name + '-' + displayType + '-' + displayTypeNum;
        // data-step attribute is used to look for content of an existing step in __hideContents
        // and __lookForExistingContents.
        var subContainerDivId = '<div id="' + subContainerId + '" data-step="' + step.name + '" class="subContainerDiv col-sm-12"></div>';
        widget.id = subContainerId;
        widget.default = true;
        var subContainer = $(subContainerDivId);
        if (isEnable === false) {
            subContainer.addClass('disableContainer');
            subContainer.attr('aria-disabled', true);
        }
        if (isHidden === true) {
            subContainer.addClass('hiddenContainer');
        }
        widgetContainer.append(subContainer);

        if (widget.height !== undefined) {
            subContainer.css("height", widget.height);
        }
    
        __createWidget(step.name, widget, displayType, subContainer, displayTypeNum);

        // change the outline of the disable widget container
        if (isEnable === false) {
          __changeWidgetBorderColor(subContainer, displayType, true);
        }
    }
  }

  var __buildContent = function(step, $stepContent) {
    contentManager.setInstructions(step.name, step.instruction);

    __addTitle(step, $stepContent);
    __addDescription(step, $stepContent);
    __updateInstructions(step, $stepContent);

    // no need to create widgets for these steps
    if (step.name === "WhatNext" || step.name === "RelatedLinks") {
      return;
    }

    // Insert widgets into the widgets div for its step.
    var stepWidgets;
    if ($(".stepWidgetContainer[data-step='" + step.name + "']").length > 0) {
        stepWidgets = $(".stepWidgetContainer[data-step='" + step.name + "']");
    } else { // create div
        stepWidgets = $("<div class='stepWidgetContainer multicolStepHidden' data-step='" + step.name + "'></div>");
        $("#code_column").append(stepWidgets);
    }

    // build/get widgets info
    // store widgets object for each step in _mapStepWidgets
    var widgetsObjInfo = _mapStepWidgets[step.name];
    if (widgetsObjInfo === undefined) {
        widgetsObjInfo = __getWidgetsInfoForStep(step);
        _mapStepWidgets[step.name] = widgetsObjInfo;
    }      

    if (step.content) {
        var displayTypeCounts = {}; // Map of displayType to the displayCount for that type
        
        $.each(step.content, function(index, content) {
            if (content.displayType) {
                // Create an id for the subContainer using the displayType, starting with 0 for each displayType
                if(displayTypeCounts[content.displayType] === undefined){
                    displayTypeCounts[content.displayType] = 0;
                } else {
                    displayTypeCounts[content.displayType]++;
                }
                // create a new div under the main contentContainer to load the content of each display type
                var displayTypeNum = displayTypeCounts[content.displayType];
                var subContainerDivId = step.name + '-' + content.displayType + '-' + displayTypeNum;
                // data-step attribute is used to look for content of an existing step in __hideContents
                // and __lookForExistingContents.
                var subContainerDiv = '<div id="' + subContainerDivId + '" data-step="' + step.name + '" class="subContainerDiv col-sm-12"></div>';      
                widgetsObjInfo[index].id = subContainerDivId;

                stepWidgets.append(subContainerDiv);
                var subContainer = $("#" + subContainerDivId);
                // always disable the widget if specified
                if (content.enable === false) {
                  subContainer.addClass('disableContainer');
                  subContainer.attr('aria-disabled', true);
                }
                if (!inSingleColumnView() || content.displayType === "tabbedEditor") {
                  // dynamically setup height for each widget based on each step content    
                  var widgetHeight = widgetsObjInfo[index].height;
                  subContainer.css("height", widgetHeight);
                  // set min height for browser
                  if (content.displayType === "webBrowser") { 
                     subContainer.css("min-height", "70px");
                  }
                }
                if (content.active) {
                  subContainer.addClass('activeWidget');
                }

                __createWidget(step.name, content, content.displayType, subContainer, displayTypeNum);

                // Cannot just handle this in multi view column. When it is resized, need to handle click too.
                // Enable the click listener all the times for now. Will refactor the codes here so that
                // it could be called in initial build content + during resize from single to multi pane.
                //if (!inSingleColumnView()) {
                // hide the widget if it's hidden
                var isWidgetHidden = widgetsObjInfo[index].hidden;
                if (isWidgetHidden === true) {
                  subContainer.addClass('hiddenContainer');   
                }

                // listen to onclick on webBrowser nav bar
                var isWidgetEnable = widgetsObjInfo[index].enable;
                // change the outline of the disable widget container
                if (isWidgetEnable === false) {
                    __changeWidgetBorderColor(subContainer, content.displayType, true);
                }

                __widgetOnClick(subContainer, content.displayType, widgetsObjInfo, isWidgetEnable);
                
                if (!inSingleColumnView() && 
                    __enabledWidgetOnHover(widgetsObjInfo[index])) {
                    __widgetOnHover(subContainer, content.displayType);
                }
                //}
            }
      });
    } else {
      // create empty widgets
      __createDefaultWidgets(step, stepWidgets, widgetsObjInfo);
    }
  };

  var __enabledWidgetOnHover = function(widgetInfo, activeWidget) {
    var isActiveWidget = false;
    if (activeWidget) {
        if (widgetInfo.displayType === activeWidget) {
            isActiveWidget = true;
        }
    } else {
        isActiveWidget = (widgetInfo.active === true);
    }
    var isDefaultWidget = false;
    if (widgetInfo.default) {
      isDefaultWidget = true;
    }
    return (__isWidgetAtConfigurableHeight(widgetInfo) === false &&
            isDefaultWidget === false &&
            isActiveWidget === false);  
  }

  var __isWidgetAtConfigurableHeight = function(widgetObjInfo) {
    var isWidgetAtFullHeight = false;
    if (widgetObjInfo.displayType === "webBrowser") {
      if (widgetObjInfo.height === _mapWidgetsHeight["webBrowser"] ||
          widgetObjInfo.height === widgetObjInfo.customHeight) {
        isWidgetAtFullHeight = true;
      }
    } else if (widgetObjInfo.displayType === "tabbedEditor") {
      if (widgetObjInfo.height) {
        var editorHeight = parseInt(widgetObjInfo.height.substring(0, widgetObjInfo.height.length - 2));
        var editorConfigurableHeight = parseInt(_mapWidgetsHeight["tabbedEditor"].substring(0, _mapWidgetsHeight["tabbedEditor"].length - 2));
        if (editorHeight >= editorConfigurableHeight ||
            widgetObjInfo.height === widgetObjInfo.customHeight) {
          isWidgetAtFullHeight = true;
        }
      }
    } else if (widgetObjInfo.displayType === "pod") {
      isWidgetAtFullHeight = true;
    }
    return isWidgetAtFullHeight; 
  }

  var __widgetOnClick = function(subContainer, displayType, widgetsObjInfo, isWidgetEnable) {
    // handle widget onclick
    subContainer.on("click", function() {
      resizeWidgets(widgetsObjInfo, displayType);
    });

    // listen to onclick on webBrowser content since it's an iframe
    if (displayType === "webBrowser") {        
      var webBrowserContent = subContainer.find('iframe[name="iframeResult"]');
      webBrowserContent.on('load', function() {
        $(this).contents().on("click", function() {
          resizeWidgets(widgetsObjInfo, displayType);
        });
      });
    }
  }

  var __widgetOnHover = function(subContainer, displayType) {
    // enable hover on clickable widget
    if (displayType !== "pod") {
      var widgetOnHover;
      if (displayType === "webBrowser") {
          widgetOnHover = subContainer.find(".wb")
      } else if (displayType === "tabbedEditor") {
          widgetOnHover = subContainer.find(".teContainer");
      }
      if (widgetOnHover) {
        widgetOnHover.on('hover', function(e) {
          if (e.type === "mouseenter") {
            $(this).addClass('stepWidgetOnHover');
          } else {
            $(this).removeClass('stepWidgetOnHover');
          }
        });
      }
    }
  }

  /* 
   * Update widgets displayed on right-hand side of multipane layout for the specified id.
   * 
   * id - the step ID (hash value without the '#') for the given step.
   */
  var showStepWidgets = function(id) {
    // Find the stepName based on the ID
    var stepName = getStepNameFromHash(id);
    if (window.innerWidth >= twoColumnBreakpoint) {
      // #codeColumn is showing.   Only display applicable widgets for the step.
      $('.multicolStepShown').removeClass('multicolStepShown').addClass('multicolStepHidden');

      // stepName is "" when srollTop displays guide header, or #guide_meta.
      if (stepName === "") {
        // Set stepName to Intro when at the top of the guide to display the widgets
        // from the first section.
        stepName = "Intro";
      }

      // Find the .stepWidgetContainer holding the widgets for the specified step.
      var $selectedStepContainer =  $('.stepWidgetContainer[data-step=' + stepName + ']');
      $selectedStepContainer.removeClass('multicolStepHidden').addClass('multicolStepShown');
    } 
  };

  var __createWidget = function(stepName, content, displayType, subContainer, displayTypeNum) {
      switch (displayType) {
          case 'fileEditor':
          editor.create(subContainer, stepName, content).done(function(newEditor){
              contentManager.setEditor(stepName, newEditor, displayTypeNum);
          });
          break;
          case 'tabbedEditor':
          // NOTE! tabbedEditors may not display well in less than 1/2 screen.
          tabbedEditor.create(subContainer, stepName, content).done(function(newTabbedEditor){
              contentManager.setTabbedEditor(stepName, newTabbedEditor, displayTypeNum);
          });
          break;
          case 'commandPrompt':
          cmdPrompt.create(subContainer, stepName, content).done(function(newCmdPrompt){
              contentManager.setCommandPrompt(stepName, newCmdPrompt, displayTypeNum);
          });
          break;
          case 'webBrowser':
          webBrowser.create(subContainer, stepName, content).done(function(newWebBrowser){
              contentManager.setWebBrowser(stepName, newWebBrowser, displayTypeNum);
          });
          break;
          case 'fileBrowser':
          fileBrowser.create(subContainer, content, stepName).done(function(newFileBrowser){
              contentManager.setFileBrowser(stepName, newFileBrowser, displayTypeNum);
          });
          break;
          case 'pod':
          pod.create(subContainer, stepName, content).done(function(newPod){
              contentManager.setPod(stepName, newPod, displayTypeNum);
          });
          break;
      }
  }

  /*
   * Return the heights of all the widgets belonging to the step. 
   * If custom height is set for the widget, use it.
   * If single column view and single column height is set, use it.
   * Otherwise, use the configured height.
   */
  var getStepWidgetHeights = function(stepName, isSingleColumnView) {
    var widgetHeights = {};
    var widgetsInfo = getStepWidgets(stepName);
    widgetsInfo.forEach(function(widgetInfo) {
      if (widgetInfo.customHeight) {
        widgetHeights[widgetInfo.displayType] = widgetInfo.customHeight;
      } else if (isSingleColumnView && _mapWidgetsSingleColumnHeight[widgetInfo.displayType]) {
        widgetHeights[widgetInfo.displayType] = _mapWidgetsSingleColumnHeight[widgetInfo.displayType];
      } else {
        widgetHeights[widgetInfo.displayType] = _mapWidgetsHeight[widgetInfo.displayType];
      }
    });
    return widgetHeights;
  }

  return {
    setSteps: setSteps,
    createStepHashIdentifier: __createStepHashIdentifier,
    getCurrentStepName: getCurrentStepName,
    setCurrentStepName: setCurrentStepName,
    getStepNameFromHash: getStepNameFromHash,
    createGuideContents: createGuideContents,
    showStepWidgets: showStepWidgets,
    getStepWidgets: getStepWidgets,
    resizeStepWidgets: resizeWidgets,
    getCodeColumnHeight: getCodeColumnHeight,
    getStepWidgetHeights: getStepWidgetHeights
  };
})();
