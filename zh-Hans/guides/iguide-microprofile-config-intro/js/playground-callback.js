var playground = function(){
    var STEP_NAME = 'DefaultPlayground';
    var JAVA_FILE = 'InventoryConfig.java';
    var PROP_FILE = '/META-INF/microprofile-config.properties';
    var ENV_FILE = 'server.env';
    var SYS_FILE = 'bootstrap.properties';
    var SERVER_FILE = 'server.xml';
var SERVER_FILE_ENV = 'server.xml - variable element';
var SERVER_FILE_APP_PROP = 'sever.xml - appProperties element';

    var FILETYPES = {'inject':'inject', 'propFile':'propFile', 'envVar':'envVar', 'sysProp':'sysProp', 'variableElement':'variableElement', 'appPropertiesElement': 'appPropertiesElement'};
    var FILENAMES = {'inject': JAVA_FILE, 'propFile': PROP_FILE, 'envVar': ENV_FILE, 'sysProp': SYS_FILE, 'serverFile': SERVER_FILE};

    var properties = {};
    var staging = [];
    var fileOrdinals = {};
    var hasError = false;

    var _playground = function(root, stepName) {
        this.root = root;
        this.stepName = stepName;
    };

    _playground.prototype = {
        /**
         *
         * @param {String} key - the name of the property
         * @param {String} value - the value of the property
         * @param {String} source - 'inject', 'propFile', 'envVar', 'sysProp', 'variableElement', 'appPropertiesElement'
         * @param {*} ordinal (optional) - provided ordinal number. otherwise default based on source
         */
        playgroundAddConfig: function(key, value, source, ordinal) {
            if (!value && (source === FILETYPES.inject)) {
                ordinal = '-1'; //must be assigned elsewhere if no defaultValue
            } else if (!ordinal) {
                ordinal = this.__getDefaultOrdinal(source);
            }

            if (properties[key]) {
                var oldOrdinal = properties[key].ordinal;
                if (parseInt(ordinal) >= parseInt(oldOrdinal)) {
                    properties[key] = {'ordinal': ordinal, 'value': value, 'source': source};
                }
            } else {
                properties[key] = {'ordinal': ordinal, 'value': value, 'source': source};
            }
        },

        /**
         * Clear all properties and error messages, and read/parse all files for properties again
         */
        repopulatePlaygroundConfigs: function() {
            properties = {};
            fileOrdinals = {};
            this.__clearErrorMessage();

            this.__getInjectionProperties(JAVA_FILE);
            this.__getPropertiesFileProperties(PROP_FILE);
            this.__getEnvironmentProperties(ENV_FILE);
            this.__getSystemProperties(SYS_FILE);
            this.__getServerXMLelements(SERVER_FILE);
            this.showProperties();
            this.updateFigure();

            return hasError;
        },

        __getInjectionProperties: function(fileName) {
            var injectionContent = contentManager.getTabbedEditorContents(STEP_NAME, fileName);

            // Use regex global search to find and store all indices of matches.
            // Makes sure we have @Inject and @ConfigProperty
            var regexp = /@Inject\s+@ConfigProperty/g;
            var match, matches = [];
            while ((match = regexp.exec(injectionContent)) != null) {
                matches.push(match.index);
            }

            // For each match, grab string until end of Java code line (including lines split for readability).
            var lines = [];
            for (var i in matches) {
                var content = injectionContent.substring(matches[i]);
                var endLine = content.indexOf(';');
                var line = content.substring(0, endLine).replace(/\n/g, ''); //remove newline characters
                lines.push(line);
            }

            // For each line, grab config value and properties
            for (var l in lines) {
                var lineRegexp = /\(.*(?=\))/;  //grab everything in between the parentheses
                var propertyLine = lineRegexp.exec(lines[l]);

                if (propertyLine) {
                    var inlineProperties = propertyLine[0];
                    var nameRegexp = /name\s*=\s*"(.*?)"/g; //match 'name' property, with the property value as substring match
                    var defaultValueRegexp = /defaultValue\s*=\s*"(.*?)"/g; //match 'defaultValue' property, with the property value as substring match
                    var name = nameRegexp.exec(inlineProperties);
                    var defaultValue = defaultValueRegexp.exec(inlineProperties);
                    if (name) {
                        var nameString = this.__sanitizeString(name[1]);
                        //index 1 is the regex substring match which contains the value of the match
                        if (defaultValue) {
                            this.playgroundAddConfig(nameString, this.__sanitizeString(defaultValue[1]), FILETYPES.inject);
                        } else {
                            this.playgroundAddConfig(nameString, '', FILETYPES.inject);
                        }
                    }
                }
            }
        },

        __getPropertiesFileProperties: function(fileName) {
            var editorInstance = this.__getEditorInstance(fileName);
            this.__parseAndStorePropertyFiles(fileName, FILETYPES.propFile);
        },

        __getEnvironmentProperties: function(fileName) {
            var editorInstance = this.__getEditorInstance(fileName);
            this.__parseAndStorePropertyFiles(fileName, FILETYPES.envVar);
        },

        __getSystemProperties: function(fileName) {
            var editorInstance = this.__getEditorInstance(fileName);
            this.__parseAndStorePropertyFiles(fileName, FILETYPES.sysProp);
        },

        /**
         * Parse properties files and store them.
         */
        __parseAndStorePropertyFiles: function(filename, filetype) {
            var fileContent = contentManager.getTabbedEditorContents(STEP_NAME, filename);

            if (fileContent) {
                var regex = /^[ \t]*(.+?)[ \t]*[=: ][ \t]*(.+$)/gm; // match all key value pairs
                var match = null;
                var ordinal;
                while ((match = regex.exec(fileContent)) !== null) {
                    var key = this.__sanitizeString(match[1].trim());
                    var value = this.__sanitizeString(match[2]);
                    if (key === 'config_ordinal') {
                        //TODO: what if ordinal has already been set? (multiple config_ordinal keys)
                        ordinal = value;
                        this.__setFileOrdinal(filetype, ordinal);
                    } else if (key.match(/^[!#].*/) !== null) {
                        // ignore lines that start with ! or # for comments
                        // all non-valid property lines are already ignored
                        continue;
                    } else {
                        this.__stageConfigProperty(key, value);
                    }
                }
                this.__storeStagedProperties(filetype, ordinal);
            }
        },

        __getServerXMLelements: function(fileName) {
            var fileContent = contentManager.getTabbedEditorContents(STEP_NAME, fileName);

            if (fileContent) {
                var fileContentString = fileContent.substring(0).replace(/\n/g, ''); //remove newline characters
                var errorConfigProps = [];  // Config props which are not injected in InventoryConfig.java

                try {
                    // Parse the server.xml contents to validate correct xml syntax
                    var xmlDoc = $.parseXML(fileContentString);
                    var $xml = $(xmlDoc);

                    var serverElement = $xml.find('server').get(0);
                    var xmlVariables = {};
                    var pg = this;
                    $xml.find('variable').each(function() {
                        if (serverElement === $(this).parent().get(0)) {
                            var varname = $(this).attr('name').trim();
                            if (varname) {
                                var varvalue = $(this).attr('value');
                                if (varvalue) {
                                    if (varname === 'config_ordinal') {
                                        pg.__setFileOrdinal(FILETYPES.variableElement, varvalue);
                                    } else {
                                        xmlVariables[varname] = varvalue;
                                    }
                                }
                            }
                        }
                    });
                    var variableElementOrdinal = this.__getFileOrdinal(FILETYPES.variableElement);
                    for (var variable in xmlVariables) {
                        if (this.getProperty(variable) !== null) {
                            this.playgroundAddConfig(variable, xmlVariables[variable], FILETYPES.variableElement, variableElementOrdinal);
                        } else {
                            // Identify variables not injected in InventoryConfig.java
                            errorConfigProps.push(variable);
                        }
                    }

                    var xmlappProperties = {};
                    $xml.find('appProperties').find('property').each(function() {
                        var propname = $(this).attr('name');
                        if (propname) {
                            var propvalue = $(this).attr('value');
                            if (propvalue) {
                                if (propname === 'config_ordinal') {
                                    pg.__setFileOrdinal(FILETYPES.appPropertiesElement, propvalue);
                                } else {
                                    xmlappProperties[propname] = propvalue;
                                }
                            }
                        }
                    });
                    var appPropertiesElementOrdinal = this.__getFileOrdinal(FILETYPES.appPropertiesElement);
                    for (var property in xmlappProperties) {
                        if (this.getProperty(property) !== null) {
                            this.playgroundAddConfig(property, xmlappProperties[property], FILETYPES.appPropertiesElement, appPropertiesElementOrdinal);
                        } else {
                            if (!errorConfigProps.includes(property)) {
                                // Combine with the variables not injected in InventoryConfig.java
                                // to identify the UNIQUE props not injected in InventoryConfig.java
                                errorConfigProps.push(property);
                            }
                        }
                    }

                    if (errorConfigProps.length > 0) {
                        // There were config props defined in the server.xml that were
                        // not yet injected in InventoryConfig.java with @Inject.
                        var errorMessages = "";
                        for (var x in errorConfigProps) {
                            // Add config prop name to error message and concatenate with line break.
                            errorMessages += utils.formatString(microprofile_config_messages.INJECTION_REQUIRED, [errorConfigProps[x]]) + "<br/>";
                        }
                        this.__displayErrorMessage(errorMessages, 'serverFile');
                    }

                } catch(e) {
                    this.__displayErrorMessage(microprofile_config_messages.XML_FORMAT_ERROR, 'serverFile', true);
                }
            }
        },

        /**
         * Remove injection codes within the string
         */

        __sanitizeString: function(string) {
            return $($.parseHTML(string)).text();
        },

        /**
         * Temporarily hold properties.
         * Used while parsing properties files and waiting to encounter `config_ordinal`
         */
        __stageConfigProperty: function(key, value) {
            staging.push([key, value]);
        },

        /**
         * Store properties.
         * Used after parsing properties files and checked for existence of `config_ordinal`
         */
        __storeStagedProperties: function(source, ordinal) {
            // use array to take care of multiple errors
            var errors = [];
            for (var i in staging) {
                var key = staging[i][0];
                var value = staging[i][1];
                if (this.getProperty(key) !== null) {
                    this.playgroundAddConfig(key, value, source, ordinal);
                } else {
                    var propFound = false;
                    if (ENV_FILE === FILENAMES[source]) {
                        // If the config property comes from an environment variable, then
                        // characters in a config property name that are not alphanumeric
                        // or the underscore character may be disallowed and may have
                        // been replaced with the underscore character.  Loop through the
                        // keys in our known properties replacing disallowed characters with
                        // an underscore and see if it matches the key set as an environment
                        // variable.  If not, try making it all UPPER case and see if there
                        // is a match.  If not....post the INJECTION_REQUIRED message.
                        var props = this.getProperties();
                        for (var prop in props) {
                            // Replace disallowed chars with underscore
                            var tryKey = prop.replace(/[^\w]/g, '_');
                            if (tryKey === key) {
                                this.playgroundAddConfig(prop, value, source, ordinal);
                                propFound = true;
                                break;
                            } else {
                                var tryKey2 = tryKey.toUpperCase();
                                if (tryKey2 === key) {
                                    this.playgroundAddConfig(prop, value, source, ordinal);
                                    propFound = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!propFound) {
                        var message = utils.formatString(microprofile_config_messages.INJECTION_REQUIRED, [key]);
                        errors.push(message);
                    }
                }
            }
            if (errors.length > 0) {
                // convert errors in array to strings with line break
                var errorMessages = errors.join("<br/>");
                this.__displayErrorMessage(errorMessages, source);
            }
            staging = [];
        },

        /**
         * Gets filename from the html of the property row in the table
         * and makes that file active in the tabbedEditor
         */
        __focusOnSourceTab: function(tableRow) {
            var cells = tableRow.querySelectorAll("td");
            var source = cells[2].innerText; //cells[2] - is the cell with the filename
            contentManager.focusTabbedEditorByName(STEP_NAME, source);
        },

        /**
         * Display final properties and values in pod
         */
        showProperties: function() {
            var props = this.getProperties();

            //create a table to display properties
            var propsTable = this.root.find('.propsTable');
            propsTable.attr('aria-label', microprofile_config_messages.PROPS_TABLE_LABEL);
            propsTable.empty();
            propsTable.append('<tr><th tabindex="0" aria-label="' + microprofile_config_messages.PROPERTY + '" scope="col">' + microprofile_config_messages.PROPERTY + '</th><th tabindex="0" aria-label="' + microprofile_config_messages.VALUE +  '"  scope="col">' + microprofile_config_messages.VALUE + '</th><th tabindex="0" aria-label="' + microprofile_config_messages.SOURCE + '"scope="col">' + microprofile_config_messages.SOURCE + '</th></tr></table>'); //adding the column headers

            // use array to take care of multiple errors
            var errors = [];
            for (var key in props) {
                if (props[key].ordinal < 0) {
                    errors.push(utils.formatString(microprofile_config_messages.VALUE_REQUIRED, [key]));
                } else {
                    var prop = $('<tr class="propertyRow" tabindex="0" aria-label="' + microprofile_config_messages.PROPS_TABLE_CLICKABLE + '">');
                    prop.append('<td title="'+ key + '" tabindex="0">' + key + '</td>');
                    prop.append('<td title="'+ props[key].value + '" tabindex="0">' + props[key].value + '</td>');
                    prop.append('<td title="'+ this.__getFileName(props[key].source) + '" tabindex="0">' + this.__getFileName(props[key].source) + '</td>');
                    propsTable.append(prop);
                }
            }
            if (errors.length > 0) {
                // convert errors in array to strings with line break
                var errorMessages = errors.join("<br/>");
                this.__displayErrorMessage(errorMessages, "inject", true);
            }

            //add on click event to each row in the properties table
            //clicking the row will activate the respective source tab
            var propRows = this.root.find('tr.propertyRow');
            var thisPlayground = this;
            propRows.each(function() {
                $(this).on('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  thisPlayground.__focusOnSourceTab(this);
                });
                //event listener for jaws
                $(this).on('keypress', function(e) {
                    if (e.which === 13) {
                      e.preventDefault();
                      e.stopPropagation();
                      thisPlayground.__focusOnSourceTab(this);
                    }
                });

            });
        },

        /* Updates the 6 config source cards and sorts them by their ordinal value with the highest ordinal being on top. */
        updateFigure: function(){
            var order = this.__getOrdinalObjects();
            // Sort the config objects by ordinal
            order.sort(function(a, b){
                var ordinalA = parseInt(a.ordinal);
                var ordinalB = parseInt(b.ordinal);
                if(ordinalA > ordinalB){
                    return 1;
                }
                else if(ordinalA < ordinalB){
                    return -1;
                }
                // Equal ordinals
                return 0;
            });
            // Update the cards text and color
            for(var i = 0; i < order.length; i++){
                var configSource = order[i];
                // Find the card's span associated with this order
                var card = $('.ordinal-' + order[i].filetype);
                if(card.length > 0){
                    card.removeClass('ordinal-0 ordinal-1 ordinal-2 ordinal-3 ordinal-4 ordinal-5');
                    card.addClass('ordinal-' + i);

                    // Update the ordinal if there is one
                    if(configSource.ordinal > 0) {
                        card.find('.ordinalCardOrdinal').html('Ordinal = ' + configSource.ordinal);
                    }
                    // Change the background color to always match the card
                    card.css('background-color', configSource.bgcolor);

                    //adding aria-labels to ordinal cards
                    var cardFile = card.find('.ordinalCardFileName').html();
                    var cardOrdinal = card.find('.ordinalCardOrdinal').html();
                    var cardInfo = cardFile;
                      if (cardOrdinal){
                        cardInfo += " " + cardOrdinal;
                      }
                    card.attr('aria-label', cardInfo);

                    // Create a closure to keep track of each configSource so it doesn't use the last one for each card.
                    var closure = function(configSource){
                        // Add onClick listener to focus the correct tab once clicked
                        card.on('click', function(event){
                            event.preventDefault();
                            event.stopPropagation();
                            contentManager.focusTabbedEditorByName(STEP_NAME, configSource.fileName);
                        });
                        card.on('keypress', function(event){
                            if(event.which === 13) {
                                event.preventDefault();
                                event.stopPropagation();
                                contentManager.focusTabbedEditorByName(STEP_NAME, configSource.fileName);
                            }
                        });
                    };
                    closure(configSource);
                }
            }
        },

        __getOrdinalObjects: function() {
            // Get order of the ordinals
            var ordinalObjects = [];
            for(var filetype in FILETYPES){
                var obj = {};
                obj.filetype = filetype;
                obj.ordinal = this.__getFileOrdinal(filetype);
                obj.fileName = this.__getFileName(filetype);
                obj.bgcolor = this.__getCardColor(filetype);
                ordinalObjects.push(obj);
            }
            return ordinalObjects;
        },

        __getDefaultOrdinal: function(source) {
            switch(source) {
            case FILETYPES.inject: return '0';
            case FILETYPES.propFile: return '100';
            case FILETYPES.envVar: return '300';
            case FILETYPES.sysProp: return '400';
            case FILETYPES.variableElement: return '500';
            case FILETYPES.appPropertiesElement: return '600';
            default: return '0';
            }
        },

        __setFileOrdinal: function(filetype, ordinal) {
            fileOrdinals[filetype] = ordinal;
        },

        /**
         * @param {String} filetype : shortname of filetype
         * @returns : ordinal of specified properties file
         */
        __getFileOrdinal: function(filetype) {
            if (fileOrdinals[filetype]) {
                return fileOrdinals[filetype];
            } else {
                return this.__getDefaultOrdinal(filetype);
            }
        },

        /**
         * @returns : array of file ordinals
         */
        __getAllFileOrdinals: function() {
            return fileOrdinals;
        },

        __getFileName: function(filetype) {
            switch(filetype) {
                case FILETYPES.inject: return JAVA_FILE;
                case FILETYPES.propFile: return PROP_FILE;
                case FILETYPES.envVar: return ENV_FILE;
                case FILETYPES.sysProp: return SYS_FILE;
                case FILETYPES.variableElement: return SERVER_FILE;
                case FILETYPES.appPropertiesElement: return SERVER_FILE;
                default: return null;
            }
        },

        /* Returns the color for the ordinal card associated with the fileType passed in */
        __getCardColor: function(filetype) {
            switch(filetype) {
                case FILETYPES.inject: return '#EAEDFF';
                case FILETYPES.propFile: return '#E1E7FF';
                case FILETYPES.envVar: return '#D9E1FF';
                case FILETYPES.sysProp: return '#D0DBFF';
                case FILETYPES.variableElement: return '#CCD7FF';
                case FILETYPES.appPropertiesElement: return '#C4D0FF';
                default: return null;
            }
        },

        getProperties: function() {
            return properties;
        },

        getProperty: function(key) {
            if (properties[key]) {
                return properties[key];
            } else {
                return null;
            }
        },

        __getEditorInstance: function(fileName) {
            if (contentManager.getEditorInstanceFromTabbedEditor) {
                return contentManager.getEditorInstanceFromTabbedEditor(STEP_NAME, fileName);
            }
        },

        /**
         * Displays error message across all the files in the tabbedEditor
         * TODO: possibly move this functionality into commons code, make sure to ignore readonly editors
         */
        __displayErrorMessage: function(message, source, showFirst) {
            var fileName = FILENAMES[source];
            var editor = this.__getEditorInstance(fileName);
            editor.createCustomErrorMessage(message);
            if (!hasError || showFirst) {
                contentManager.focusTabbedEditorByName(editor.stepName, fileName);
                hasError = true;
            }
        },

        /**
         * Clears all error messages across all the files in tabbedEditor
         * TODO: possibly move this functionality into commons code, make sure to ignore readonly editors
         */
        __clearErrorMessage: function() {
            hasError = false;
            var javaEditor = this.__getEditorInstance(JAVA_FILE);
            var propEditor = this.__getEditorInstance(PROP_FILE);
            var envEditor = this.__getEditorInstance(ENV_FILE);
            var sysEditor = this.__getEditorInstance(SYS_FILE);
            var serverEditor = this.__getEditorInstance(SERVER_FILE);

            javaEditor.closeEditorErrorBox();
            propEditor.closeEditorErrorBox();
            envEditor.closeEditorErrorBox();
            sysEditor.closeEditorErrorBox();
            serverEditor.closeEditorErrorBox();
        }
    };

    var _create = function(root, stepName){
        return new _playground(root, stepName);
    };

    return {
        create: _create
    };
}();
