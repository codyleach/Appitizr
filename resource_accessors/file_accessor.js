// Requirements
var fs = require('fs');

// Create the main function
var fileAccessor = function() { };

// Define the file reader
fileAccessor.prototype.readFile = function(filePath, callback) {
    fs.readFile(filePath, {encoding: 'utf-8'}, callback);
};

var fileAccessorInstance = new fileAccessor();

module.exports = fileAccessorInstance;