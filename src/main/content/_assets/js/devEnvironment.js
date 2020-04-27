$(document).ready(function(){
    // Check if the QA site or Dev site is loaded and add a flag to the header 
    var host = window.location.hostname;
    var label = $("<div></div>");
    label.addClass('qa-descriptor');
    if (host.indexOf('qa-guides') > -1) {
        label.text('QA Site');
        $("#nav_bar").after(label);
    } else if (host.indexOf('draft-openlibertyio') > -1) {
        label.text('Draft Site');
        $("#nav_bar").after(label);
    } else if (host.indexOf('dev-openlibertyio') > -1) {
        label.text('Dev Site');
        $("#nav_bar").after(label);
    } else if (host.indexOf('demo') > -1) {
        label.text('Demo Site');
        $("#nav_bar").after(label);
    }
});