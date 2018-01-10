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

    // javadocs/liberty-javaee7-javadoc/index.html
    // javadocs/microprofile-1.2-javadoc/index.html
    $('#liberty').on('click', function(){
        $('#javadoc_container').prop('src', "javadocs/liberty-javaee7-javadoc/index.html");
    });
    $('#mp').on('click', function(){
        $('#javadoc_container').prop('src', "javadocs/microprofile-1.2-javadoc/index.html");
    });
});