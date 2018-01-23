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


function resizeJavaDocWindow() {
    var topSection = $('#background_container').height();
    var bottomSection = $('#footer_container').height();

    var middleSectionHeight = $(window).height() - (topSection + bottomSection);
    $('#javadoc_container').height(middleSectionHeight);

    $("body").css("overflow" , "hidden");
}

$(document).ready(function() {

    resizeJavaDocWindow();

    $(window).on('resize', function(){
        resizeJavaDocWindow();
    });
});
