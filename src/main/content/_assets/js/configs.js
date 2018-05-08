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

$(document).ready(function() {
    // Listener for the filters on the overview pane
    $("#toc_container a").on("click", function(event){
        var resource = $(event.currentTarget);

        setSelectedTOC(resource);
        if ($(".breadcrumb.fluid-container").find("li:last-child").find("a").hasClass("inactive_link")) {
            // remove existing inactive link
            $(".breadcrumb.fluid-container").find("li:last-child").remove();
        }
        $(".breadcrumb.fluid-container").append("<li><a class='inactive_link'>" + resource.text() + "</a></li>");
    });

    function setSelectedTOC(resource) {
        var currecntTOCSelected = $(".toc_selected");
        if (currecntTOCSelected.length === 1) {
            $(".toc_selected").removeClass("toc_selected");
        }
        resource.parent().addClass("toc_selected");
    };
});