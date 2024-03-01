var Terminal = function() {
    
    var thisCommands = {};
    var thisElem = "";

    var history = (localStorage.getItem("history") ? localStorage.getItem("history").split(",") : []),
        historyIndex = history.length;
        self = {};

    var KEY_UP   = 38,
        KEY_DOWN = 40,
        KEY_TAB  = 9;

    // Auxiliary functions

    var resetPrompt = function(terminal, prompt) {
        var newPrompt = prompt.parentNode.cloneNode(true);
        prompt.setAttribute("contenteditable", false);
        if(self.prompt) {
            newPrompt.querySelector(".prompt").textContent = self.prompt;
        }
        terminal.appendChild(newPrompt);
        newPrompt.querySelector(".input").innerHTML = " ";
        newPrompt.querySelector(".input").focus();
    };

    var runCommand = function(terminal, cmd, args) {
        terminal.innerHTML += (thisCommands[cmd](args));
    };

    var updateHistory = function(cmd) {
        history.push(cmd);
        localStorage.setItem("history", history);
        historyIndex = history.length;
    };

    var browseHistory = function(prompt, direction) {
        var changedPrompt = false;
        if(direction == KEY_UP && historyIndex > 0) {
            prompt.textContent = history[--historyIndex];
            changedPrompt = true;
        } else if(direction == KEY_DOWN) {
            if(historyIndex < history.length) ++historyIndex;
            if(historyIndex < history.length) prompt.textContent = history[historyIndex];
            else prompt.textContent = " ";
            changedPrompt = true;
        }

        if(changedPrompt) {
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(prompt.childNodes[0], prompt.textContent.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    var autoCompleteInput = function(input) {
        var cmds        = thisCommands,
            re          = new RegExp("^" + input, "ig"),
            suggestions = [];
        for(var cmd in cmds) {
            if(cmds.hasOwnProperty(cmd) && cmd.match(re)) {
                suggestions.push(cmd);
            }
        }
        return suggestions;
    };

    // Terminal functions

    self.init = function(elem, commands) {    
        
        thisCommands = commands;
        thisElem = elem;

        thisElem.addEventListener("keydown", function(event) {
            if(event.keyCode == KEY_TAB) {
                var prompt = event.target;
                var suggestions = autoCompleteInput(prompt.textContent.replace(/\s+/g, ""));

                if(suggestions.length == 1) {
                    prompt.textContent = suggestions[0];
                    var range = document.createRange();
                    var sel = window.getSelection();
                    range.setStart(prompt.childNodes[0], suggestions[0].length);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

                //event.preventDefault(true);
                //return false;
            }
        });
    
        thisElem.addEventListener("keyup", function(event) {
            if(historyIndex < 0) return;
            browseHistory(event.target, event.keyCode);
        });

        thisElem.addEventListener("keypress", function(event) {
            var prompt = event.target;
            if(event.keyCode != 13) return false;

            updateHistory(prompt.textContent);

            var input = prompt.textContent.split(" ");
            if(input[0] && input[0] in thisCommands) {                            
                runCommand(thisElem, input[0], input);
            } else {
                //console.log("cmd not support " + input[0]);
                var strMsg = utils.formatString(messages.cmdNotSupport, input[0]);
                //thisElem.innerHTML += input[0]  + " not support";
                thisElem.innerHTML += strMsg;
            }

            resetPrompt(thisElem, prompt);
            event.preventDefault();
        });

        thisElem.querySelector(".input").focus(); 
                 
        return self;
    };
    
    return self;
};