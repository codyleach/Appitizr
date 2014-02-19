//
// # Cody Leach's Portfolio
//
//var http = require('http');
var path = require('path');
var express = require('express');
// var lessMiddleware = require('less-middleware');

var clientDir = path.resolve(__dirname, 'client');

// Create the server
var app = express();

// Tell it where to find the files
app.configure(function () {
    // app.use(lessMiddleware({
    //     debug: true,
    //     dest: clientDir + '/css',
    //     src: clientDir + '/less',
    //     prefix: '/css',
    //     compress: 'auto'
    // }));
    
    app.use(express.static(clientDir));
});

// Start listening for requests
app.listen(process.env.PORT || 3000);
