$(document).ready(function(){
    // Check if the QA site or Dev site is loaded and add a flag to the header 
    var host = window.location.hostname;
    var label;
    if(host.indexOf('qa-guides') > -1){
        label = $("<div></div>");
        label.addClass('qa-descriptor');
        label.text('QA Site');
        $(".navbar").after(label);
    } else if(host.indexOf('openlibertydev') > -1){
        label = $("<div></div>");
        label.addClass('qa-descriptor');
        label.text('Dev Site');
        $(".navbar").after(label);
    }
});