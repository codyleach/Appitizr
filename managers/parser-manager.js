// Requirements
var fileAccessor = require('../resource_accessors/file_accessor');
var path = require('path');
var htmlparser = require("htmlparser2");

// Know where we are
var rootPath = path.join(__dirname, '/..');
var configFilePath = path.join(rootPath, '/client/config.json');

// Create the main function
var parserManager = function() { };

// Define the file reader
parserManager.prototype.getAllProperties = function(callback) {
    // Setup some needed variables
    var self = this,
        sections = [],
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
           self.parseHtmlString(fileData);
           filesReadCount++;
       }
    }
    
    function allFilesRead() {
        
    }
};

parserManager.prototype.parseHtmlString = function(htmlString) {
    var self = this;
    var handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
            console.error(error);
        } else {
            self.parseDomArray(dom);
        }
    });
    var parser = new htmlparser.Parser(handler);
    parser.write(htmlString);
    parser.done();
    // var parser = new htmlparser.Parser({
    //     onopentag: function(name, attribs){
    //         console.log("Open tag attribute: ");
    //         console.log(attribs);
    //         console.log(" ");
    //     },
    //     ontext: function(text){
    //         console.log("Text: ");
    //         console.log(text);
    //         console.log(" ");
    //     },
    //     onclosetag: function(tagname){
    //         console.log("Close tag: ");
    //         console.log(tagname);
    //         console.log(" ");
    //     }
    // });
};

parserManager.prototype.parseDomArray = function(domArray) {
    var results = [];
    
    // Go through each and parse it
    for (var i = 0; i < domArray.length; i++) {
        // Is this a type tag?
        if (domArray[i].type == 'tag') {
            // Does it have what we're looking for?
            if (domArray[i].attribs.hasOwnProperty('data-appitizr')) {
                // Get the value and add it to the results
                console.log(domArray[i].attribs['data-appitizr']);
            }
            
            // Go through the children
            this.parseDomArray(domArray[i].children);
        }
    }
    
    return results;
};

var parserManagerInstance = new parserManager();

parserManagerInstance.getAllProperties();

//module.exports = parserManagerInstance;
