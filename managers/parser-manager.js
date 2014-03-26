// Requirements
var fileAccessor = require('../resource_accessors/file_accessor');
var path = require('path');
var htmlparser = require("htmlparser2");

// Know where we are
var rootPath = path.join(__dirname, '/..');
var configFilePath = path.join(rootPath, '/client/config.json');

// Define some private variables
var _attributeName = "data-admin";
var _defaultSectionId = "section-";
var _defaultSectionCount = 0;
var _defaultComponentId = "component-";
var _defaultComponentCount = 0;

// Create the main function
var parserManager = function() { };

// Define the file reader
parserManager.prototype.getAllProperties = function(callback) {
    // Setup some needed variables
    var self = this,
        defaultSection = null,
        sections = {},
        filesToReadCount = 0,
        filesReadCount = 0;
        
    // Create the default section
    defaultSection = createParentObject(_defaultSectionId + _defaultSectionCount);
    sections[defaultSection.id] = defaultSection;
    _defaultSectionCount++;
        
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
           self.parseHtmlString(fileData, sections, defaultSection);
           filesReadCount++;
       }
    }
    
    function allFilesRead() {
        
    }
};

parserManager.prototype.parseHtmlString = function(htmlString, root, parent) {
    var self = this;
    var handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
            console.error(error);
        } else {
            self.parseDomArray(dom, root, parent);
        }
    });
    var parser = new htmlparser.Parser(handler);
    parser.write(htmlString);
    parser.done();
};

parserManager.prototype.parseDomArray = function(domArray, root, parent) {
    var newParent = null;
    
    // Go through each and parse it
    for (var i = 0; i < domArray.length; i++) {
        // Is this a type tag?
        if (domArray[i].type == 'tag') {
            // Does it have what we're looking for?
            if (domArray[i].attribs.hasOwnProperty(_attributeName)) {
                // Get the data string
                var dataObj = this.convertStringToObject(domArray[i].attribs[_attributeName]);
                
                // Is a section being defined?
                if (propExists(dataObj, 'type') && dataObj['type'].trim() == "section") {
                    
                    // Grab the id
                    var id = dataObj['id'] ? dataObj['id'].trim() : null;
                    
                    if (!id) {
                        id = _defaultSectionId + _defaultSectionCount;
                        _defaultSectionCount++;
                    }
                    
                    // Yes, it's being defined, so add in some of the information
                    if (!propExists(root, dataObj['id'])) {
                        // Need to create it
                        newParent = createParentObject(id, propExists(dataObj, 'label') ? dataObj['label'].trim() : id);
                        
                        root[id] = newParent;
                    }
                    
                } else if (propExists(dataObj, 'type') && dataObj['type'].trim() == "component") {
                    // Grab the id
                    var id = dataObj['id'] ? dataObj['id'].trim() : null;
                    
                    if (!id) {
                        id = _defaultComponentId + _defaultComponentCount;
                        _defaultComponentCount++;
                    }
                    
                    // Need to create it
                    newParent = createParentObject(id, propExists(dataObj, 'label') ? dataObj['label'].trim() : id);
                    
                    // Add it to the parent
                    parent.items.push(newParent);
                    
                } else {
                    // Get the contents
                    dataObj['contents'] = getElementContents(domArray[i]);
                    
                    // Push this item as a child
                    parent.items.push(dataObj);
                }
                
                // Turn it into an object
                console.log(dataObj);
                console.log(parent);
                console.log("");
            }
            
            // Go through the children
            this.parseDomArray(domArray[i].children, root, newParent ? newParent : parent);
        }
    }
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
    return obj && prop.trim() && obj.hasOwnProperty(prop);
}

function createParentObject(id, label) {
    return {
        id: id,
        label: label ? label : id,
        items: []
    };
}

function getElementContents(element) {
    // What type of element is this?
    if (element.type == "tag") {
        // Is this an image?
        if (element.name == "img") {
            return element.attribs ? (element.attribs.src || null) : null;
        }
        
        // Go through the children
        var content = "";
        for (var i = 0; i < element.children.length; i++) {
            content += element.children[i].data ? element.children[i].data.toString() : "";
        }
        
        return content;
    } else if (element.type == "text") {
        return element.data || null;
    }
    
    // Not sure what this is
    return null;
}

var parserManagerInstance = new parserManager();

parserManagerInstance.getAllProperties();

//module.exports = parserManagerInstance;
