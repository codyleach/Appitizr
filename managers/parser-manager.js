// Requirements
var fileAccessor = require('../resource_accessors/file_accessor');
var path = require('path');
var htmlparser = require("htmlparser2");

// Know where we are
var rootPath = path.join(__dirname, '/..');
var configFilePath = path.join(rootPath, '/client/config.json');
var attributeName = "data-admin";

// Create the main function
var parserManager = function() { };

// Define the file reader
parserManager.prototype.getAllProperties = function(callback) {
    // Setup some needed variables
    var self = this,
        sections = {},
        filesToReadCount = 0,
        filesReadCount = 0;
        
    // Read the config file
    fileAccessor.readFile(configFilePath, function(err, data) {
        if (err) {
            console.error("It appears there was an error...");
            console.error(err);
        } else {
            // Turn the data into a JSON object
            data = JSON.parse(data);
            filesToReadCount = data.files.length;
            
            // Go through the files and open each one
            for (var i = 0; i < filesToReadCount; i++) {
                // Read the file
                fileAccessor.readFile(path.join(rootPath, data.files[i]), fileReadCallback);
            }
        }
    });
    
    // Private functions
    function fileReadCallback(fileErr, fileData) {
        if (fileErr) {
            console.error(fileErr);
       } else {
           self.parseHtmlString(fileData, sections);
           filesReadCount++;
       }
    }
    
    function allFilesRead() {
        
    }
};

parserManager.prototype.parseHtmlString = function(htmlString, resultObj) {
    var self = this;
    var handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
            console.error(error);
        } else {
            self.parseDomArray(dom, resultObj);
        }
    });
    var parser = new htmlparser.Parser(handler);
    parser.write(htmlString);
    parser.done();
};

parserManager.prototype.parseDomArray = function(domArray, resultObj, section) {
    var results = [];
    
    // Go through each and parse it
    for (var i = 0; i < domArray.length; i++) {
        // Is this a type tag?
        if (domArray[i].type == 'tag') {
            // Does it have what we're looking for?
            if (domArray[i].attribs.hasOwnProperty(attributeName)) {
                // Get the data string
                var dataObj = this.convertStringToObject(domArray[i].attribs[attributeName]);
                //var section = "default";
                //var component = null;
                
                // Is a section being defined?
                if (propExists(dataObj, 'type') && dataObj['type'].trim() == "section") {    
                    // Yes, it's being defined, so add in some of the information
                    if (!propExists(resultObj, dataObj['id'])) {
                        // Sanitize the id
                        var id = dataObj['id'].trim();
                        
                        // Need to create it
                        resultObj[id] = {
                            label: propExists(dataObj, 'label') ? dataObj['label'].trim() : id,
                            items: []
                        }
                        
                        section = id;
                    }
                } else if (propExists(dataObj, 'type') && dataObj['type'].trim() == "component") {
                    // TODO: Add component support
                    
                } else {
                    // Not defining a section, so it must be an item
                    if (propExists(dataObj, 'section')) {
                        section = dataObj['section'].trim();
                    }
                    
                    // Does this section exist on the results object?
                    if (!resultObj.hasOwnProperty(section)) {
                        // Create this section on the results object
                        resultObj[section] = {
                            label: section,
                            items: []
                        };
                    }
                    
                    // Push this item as a child
                    resultObj[section].items.push(dataObj);
                }
                
                // Turn it into an object
                console.log(dataObj);
                console.log(resultObj);
                console.log("");
            }
            
            // Go through the children
            this.parseDomArray(domArray[i].children, resultObj, section);
        }
    }
    
    return results;
};

parserManager.prototype.convertStringToObject = function(dataString) {
    // Trim the string
    dataString = dataString.trim();
    
    // Does the string start and end with brackets?
    if (dataString.indexOf("{") !== 0)
        dataString = "{" + dataString;
    
    if (dataString.lastIndexOf("}") != dataString.length - 1) 
        dataString += "}";
        
    try {
        return (new Function("return " + dataString))();
    } catch (e) {
        return null;
    }
}

function propExists(obj, prop) {
    return prop.trim() && obj.hasOwnProperty(prop);
}

var parserManagerInstance = new parserManager();

parserManagerInstance.getAllProperties();

//module.exports = parserManagerInstance;
