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
var tableofcontents = (function() {
    "use strict";

    // orderedStepNamesArray: used to map guide step name to the index(step number)
    // in the __steps array.
    var orderedStepNamesArray = [];
    
    // A local pointer to the array of steps represented by this Table Of Contents.
    var __steps;

    var __getNextStepFromName = function(name) {
      var stepIdx = __getStepIndex(name);
      var nextStepName = orderedStepNamesArray[stepIdx+1];
      return nextStepName;
    };

    var __getPrevStepFromName = function(name) {
      var stepIdx = __getStepIndex(name);
      var previousStepName = orderedStepNamesArray[stepIdx-1];
      return previousStepName;
    };

    var __getStepIndex = function(name) {
      return orderedStepNamesArray.indexOf(name);
    };

    /*
        Creates the table of contents for the BluePrint based on the JSON representation.
        Input:
          steps - array - the steps of the BluePrint represented as JSON
    */
    var __create = function(steps){
        __steps = steps;   // Save a local pointer to the steps array, managed by step-content.js

        var container = $("#toc_container .sectlevel1");
        container.attr("role", "presentation");
        container.attr("aria-label", "Table of contents");

        // Loop through the steps and append each one to the table of contents.
        for(var i = 0; i < steps.length; i++){
          var step = steps[i];
          __buildStep(container, step);
        }

        // Set click processing for TOC entries. This onclick handler should match
        // the actions in ...content\assests\js\toc-multipane.js.  It is duplicated
        // here because the interactive guide TOC list items are created AFTER
        // the main document loads.
        $("#toc_container li").on('click', function(event) {
          // 'this' is the li element in the #toc_container.
          TOCEntryClick(this, event);
          var hash = window.location.hash.substring(1);  // Remove the '#'
          // Match the widgets on the right to the new id
          stepContent.showStepWidgets(hash);
          stepContent.setCurrentStepName(stepContent.getStepNameFromHash(hash));
        }); 
    };

    /*
       Creates a list item entry in the table of contents.
       The depth determines how much left-padding the list item has in the table of contents.
       The value is set as the 'TOCIndent' property of the guide's JSON file describing the steps.
       If 'TOCIndent' is not specified in the JSON for the step, a value of '0' is assumed and 
       the step's title appears at the leftmost edge of the TOC.
       Input: container: div - table of contents container
              dataTOC: string - step NAME, not it's Title, associated with this TOC entry
              title: title to display in the table of contents list item
              depth: how many levels the entry is indented.  '0' is no indent or leftmost edge. 
    */
    var __createListItem = function(container, dataToc, title, depth){
        depth = depth ? depth: 0;

        var listItem = $("<li class='tableOfContentsStep'></li>");
        listItem.attr('data-toc', dataToc);
        // Indent based on depth. Level1 TOC elements have a padding of 19px.
        //                        Each sublevel is indented 30px more.
        listItem.css('padding-left', ((depth * 30) + 19) + 'px');
      
        // Create an anchor <a> tag for the TOC entry.
        var stepHash = stepContent.createStepHashIdentifier(title);
        var anchor = $("<a href='#" + stepHash + "'>");
        anchor.text(title);

        // Append the anchor to the list item and then add it to the container
        listItem.append(anchor);
        container.append(listItem);
        return listItem;
    };

    /*
       Parses a given step and adds it to the container
       Input: {div} container, {JSON} step
    */
    var __buildStep = function(container, step){
      var listItem = __createListItem(container, step.name, step.title, step.TOCIndent || 0);
      __addOnClickListener(listItem);

      // A section is a portion of a step that appears in the TOC as a separate, indented entry
      // following the step's entry.  It appears on the same PAGE as the step, but has its
      // own TOC entry.   Selecting a section's entry in the TOC should load that step's page 
      // and scroll the contents down to the section's header.
      //
      // Build the subsection's table of contents links for this step.
      if(step.sections){
        var sections = step.sections;
        for(var i = 0; i < sections.length; i++){
          var section = sections[i];
          // Create a TOC link to this section, and when clicked on it loads the original step 
          // and then scrolls to the section.
          // Sections, in the TOC, are indented one from their parent.
          var depth = step.TOCIndent ? step.TOCIndent + 1: 1;
          var subStepLink = __createListItem(container, section.name, section.title, depth);
          __addOnClickListener(subStepLink);
        }
      }

      // NOTE: Sections aren't added to this array since they are part of 
      //       a parent page.
      orderedStepNamesArray.push(step.name);
    };

    /*
        Add handler to <li>s in the TOC
        Input: 
          listItem - html <li> item in TOC representing the step or section
    */
    var __addOnClickListener = function(listItem) {
          listItem.on("keydown", function(event) {
            if (event.which === 13 || event.which === 32) {   // Spacebar or Enter
              listItem.click();
            }
          });
    };

    return {
      create: __create,
      getStepIndex: __getStepIndex,
      nextStepFromName: __getNextStepFromName,
      prevStepFromName: __getPrevStepFromName
    };

})();
