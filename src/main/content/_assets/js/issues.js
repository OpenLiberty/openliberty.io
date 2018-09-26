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

var issues = [];
var focus_issue_index = 0;
var scroll_in_progress = false;
var issues_url = '/api/github/issues';

$('#issues_up_arrow').click(function(event) {
    event.preventDefault();
    scroll(true);
});



$('#issues_down_arrow').click(function(event) {
    event.preventDefault();
    scroll();
});



$('#issues_content').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', '.issue_0, .issue_6', function(event) {
    $(event.currentTarget).remove();
});


$('#issues_content').on('mousewheel wheel DOMMouseScroll', function(event) {
    if(issues.length > 0) {
        event.preventDefault();
        if(event.originalEvent.deltaY < 0 || event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            scroll(true);
        }
        else {
            scroll();
        }
    }
});



function scroll(up) {
    if(!scroll_in_progress) {
        scroll_in_progress = true;
        if(up) {
            if(issues.length > 4 || (issues.length == 4 && focus_issue_index == 3)) {
                var offset = (issues.length + focus_issue_index) - 3;
                if(offset + 1 > issues.length) {
                    offset = offset - issues.length;
                }
                var new_issue_element = create_issue_element(offset, 0);
                $('#issues_content').prepend(new_issue_element);
            }
            if(issues.length > 4 || focus_issue_index > 0) {
                $('#issues_content .issue_5').toggleClass('issue_5 issue_6');
                $('#issues_content .issue_4').toggleClass('issue_4 issue_5');
                $('#issues_content .issue_3').toggleClass('issue_3 issue_4');
                $('#issues_content .issue_2').toggleClass('issue_2 issue_3');
                $('#issues_content .issue_1').toggleClass('issue_1 issue_2');
                $('#issues_content .issue_0').toggleClass('issue_0 issue_1');
                if(focus_issue_index > 0) {
                    focus_issue_index--;
                } else {
                    focus_issue_index = issues.length - 1;
                }
            }
        } else {
            offset = focus_issue_index + 3;
            if(issues.length > offset) {
                new_issue_element = create_issue_element(offset, 6);
                $('#issues_content').prepend(new_issue_element);
            } else if(issues.length > 4) {
                offset = (focus_issue_index - issues.length) + 3;
                new_issue_element = create_issue_element(offset, 6);
                $('#issues_content').prepend(new_issue_element);
            }
            if(issues.length > 4 || focus_issue_index + 1 < issues.length) {
                $('#issues_content .issue_1').toggleClass('issue_1 issue_0');
                $('#issues_content .issue_2').toggleClass('issue_2 issue_1');
                $('#issues_content .issue_3').toggleClass('issue_3 issue_2');
                $('#issues_content .issue_4').toggleClass('issue_4 issue_3');
                $('#issues_content .issue_5').toggleClass('issue_5 issue_4');
                $('#issues_content .issue_6').toggleClass('issue_6 issue_5');
                if(focus_issue_index + 1 < issues.length) {
                    focus_issue_index++;
                } else {
                    focus_issue_index = 0;
                }
            }
        }
        update_tab_index();
        window.setTimeout(function() {
            scroll_in_progress = false;
        }, 400);
    }
}



function update_tab_index() {
    $('#issues_content .issue').attr('tabindex', '-1');
    $('#issues_content .issue_3').removeAttr('tabindex');
}



function create_issue_element(index, ui_position) {
    var issue = issues[index];
    var issue_element = $('<a target="new" class="issue issue_' + ui_position + ' clearfix center-block"</a>');
    issue_element.attr('href', issue.html_url);    
    var bar_element = $('<div class="issue_green_bar"></div>');
    var title_element = $('<h3 class="truncate"></h3>');
    title_element.text(issue.title);    
    var date_element = $('<p class="pull-left"></p>');
    var date_value = new Date(issue.updated_at).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
    date_element.text(date_value);

    var index_element = $('<p class="pull-right">' + (index + 1) + ' / ' + issues.length + '</p>');
    var shadow_element = $('<div class="shadow"></div>');
    issue_element.append(bar_element);
    issue_element.append(title_element);
    issue_element.append(date_element);
    issue_element.append(index_element);
    issue_element.append(shadow_element);
    return issue_element;
}



function retrieve_github_issues() {
    var deferred = new $.Deferred();
    $.ajax({
        url: issues_url
    }).done(function(data) {
        issues = data.filter(function(value){return !value.hasOwnProperty('pull_request')});
        deferred.resolve();
    }).fail(function() {
        deferred.reject();
    });
    return deferred;
}



function initialize_issues() {
    show_issues_message('Loading issues...');
    retrieve_github_issues().done(function() {
        
        show_issues_message();

        for(var i = 0; i < issues.length && i < 3; i++) {
            var issue_element = create_issue_element(i, i + 3);
            $('#issues_content').append(issue_element);
        }

        if(issues.length > 4) {
            var issue_element_2 = create_issue_element(issues.length - 1, 2);
            $('#issues_content').prepend(issue_element_2);
            var issue_element_1 = create_issue_element(issues.length - 2, 1);
            $('#issues_content').prepend(issue_element_1);
        }

        update_tab_index();

    }).fail(function() {
        show_issues_message('Could not load issues.');
    });
}



function show_issues_message(message) {
    var message_container = $('#issues_message');
    message_container.text(message);
    if(!message) {
        message_container.addClass('hidden');
    }
}



$(document).ready(function() {
    initialize_issues();
});
