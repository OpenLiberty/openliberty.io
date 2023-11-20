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
var cmdPrompt = (function(){

  var cmdPromptType = function(container, stepName, content) {
      var deferred = new $.Deferred();
      this.stepName = stepName;
      this.id = "";
      __loadAndCreate(this, container, stepName, content).done(function(result){
        deferred.resolve(result);
      });
      return deferred;
  };

  cmdPromptType.prototype = {        
      getStepName: function() {
          return this.stepName;
      },
      getId: function() {
          return this.id;
      },
      setCmdPrompt: function(cmds) {
          __setCmdPrompt(cmds, this.getId());
      },
      getDefaultCmds: function() {
          return __defaultCmds();
      }
  };

  var __loadAndCreate = function(thisCmdPrompt, container, stepName, content) {
      //console.log("using ajax to load cmd-prompt.html", container);
      var deferred = new $.Deferred();
      $.ajax({
          context: thisCmdPrompt,
          url: "/guides/iguides-common/html/interactive-guides/cmd-prompt.html",
          async: true,
          cache: true,
          success: function (result) {
              container.append($(result));
              var cmdP = container.find('.terminal');
              //console.log("cmdP ", cmdP);
              //console.log("container id", container[0].id);
              var id = container[0].id + "-cmdPrompt";
              //console.log("id ", id);
              this.id = id;
              cmdP.attr("id", id);
              //console.log("this.id ", this.id);

              container.find(".terminal").attr('aria-label', messages.cmdPromptSample);
              container.find(".cmdPromptHelp").attr('aria-label', messages.cmdPromptHelpMessage);
              if (content.preload) {
                 $(".cmdPromptHelp").text(content.preload);
              } else {
                 $(".cmdPromptHelp").text(messages.cmdPromptHelpMessage);
              }
              container.find(".input").attr("aria-label", messages.cmdPromptInput);

              if (content.callback) {
                  __createCmdPromptCallBack(thisCmdPrompt, id, stepName, content);
              } else {
                  __createCmdPrompt(thisCmdPrompt, id, stepName, content);
              }
              deferred.resolve(thisCmdPrompt);
          },
          error: function (result) {
              console.error("Could not load the cmd-prompt.html");
              deferred.resolve(thisCmdPrompt);
          }
      });
      return deferred;
  };

  var __createCmdPrompt = function(thisCmdPrompt, id, stepName, content) {

      var cmds = __defaultCmds();
      //console.log("initialize terminal ", cmds);
      var elem = document.getElementById(id);
      var terminal = new Terminal();
      terminal.init(elem, cmds);

      //__checkSupportCmd(elem, cmds);
      /*
      elem.addEventListener("keypress", function(event) {
            var prompt = event.target;
            if(event.keyCode != 13) 
              return false;

            var input = prompt.textContent.split(" ");
            if(input[0] && input[0] in cmds) {               
                //console.log("support cmds");
            } else {
                //console.log("not support" + input);
                elem.innerHTML += input[0]  + " not support";
            }

            //Terminal.resetPrompt(elem, prompt);
            //event.preventDefault();
      });*/  
  };

  var __createCmdPromptCallBack = function(thisCmdPrompt, id, stepName, content) {
      //console.log(" createCmdPromptCallBack");
      var callback = eval(content.callback);
      callback(thisCmdPrompt); //pass in instance of this class
  };

  var __setCmdPrompt = function(cmds, id) {
      //console.log("cmds ", cmds);
      //console.log("initialize terminal via callback ", id);
      var elem = document.getElementById(id);
      var terminal = new Terminal();
      terminal.init(elem, cmds);
  };

  var __defaultCmds = function() {
      var cmds = {};

      cmds.help = function () {
        var output = "<div>" +
          "<ul>" +
          "<li><strong>help</strong> " + messages.cmdPromptDisplayHelp + "</li>" +
          "<li><strong>hello NAME</strong> - displays a greeting for NAME.</li>" +
          "<li><strong>mkdir dir_name</strong> - create a directory name dir_name.</li>" +
          "<li><strong>server create|start|run server_name</strong> - create|start|run server.</li>" +
          "<li><strong>unzip filename</strong> - unzip a file.</li>" +
          "</ul></div>";
        return output;
      };

      cmds.hello = function (args) {
        //console.log("args.length ", args.length);
        if (args.length < 3) return "<p>Hello. Why don't you tell me your name?</p>";
        return "Hello " + args[1];
      };

      cmds.cd = function (args) {
        //console.log("args.length ", args.length); 
        //<span class="prompt">$></span>
        var elem = document.getElementById(id);      
        var nodes = elem.querySelectorAll('.prompt');
        var last = nodes[nodes.length- 1];
        last.innerHTML = args[1]  + "$>";
        return "";
      };

      cmds.mkdir = function (args) {
        return "";
      };

      cmds.unzip = function (args) {
        return "unzip successfully";
      };

      cmds.server = function (args) {
        if (args.length === 3 || (args.length === 4 && args[3] === "")) { // don't understand why an extra empty string is passed in sometimes
          if (args[1] === "create" || args[1] === "start" || args[1] === "run") {
             return args[2] + " " + args[1] + " successfully";
          } else {
            return "unrecognize servcer command - " + args[1];
          }
        } else {
          return "invalid server command syntax";
        }
      };

      return cmds;
  };

  var __checkSupportCmd = function(elem, cmds) {
      elem.addEventListener("keypress", function(event) {
            var prompt = event.target;
            if(event.keyCode != 13) 
              return false;

            var input = prompt.textContent.split(" ");
            if(input[0] && input[0] in cmds) {               
                //console.log("support cmds");
            } else {
                //console.log("not support" + input);
                elem.innerHTML += input[0]  + " not support";
            }
      });   
  };

  var __focusOnLastInput = function(container) {
      //console.log("focus on last input");
      var cmdP = container.find('.terminal');
      var id = container[0].id + "-cmdPrompt";
      //console.log("id ", id);    
      var elem = document.getElementById(id);          
      var nodes = elem.querySelectorAll('.input');
      var last = nodes[nodes.length- 1];
      last.focus(); 
  };

  var __hide = function(container) {
      //console.log("hide terminal");
      container.hide();
      //container.addClass("hidden");
      //if ($('#commandPrompt')) {
      //    $('#commandPrompt').addClass( "hidden");
      //}
  };

  var __create = function(container, stepName, content) {
      return new cmdPromptType(container, stepName, content);
  };

  return {
    create: __create
  };
})();
