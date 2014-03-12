// Requirements
var fileAccessor = require('../resource_accessors/file_accessor');
var path = require('path');

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
    
};

var parserManagerInstance = new parserManager();

parserManagerInstance.getAllProperties();

//module.exports = parserManagerInstance;
