// index.js
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');

// Create HTTP Server
var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// Start the HTTP Server
httpServer.listen(config.httpPort, function() {
    console.log("The server is listening on port " + config.httpPort);
});

// Unified server function to handle requests
var unifiedServer = function(req, res) {
    // Parse the URL
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        buffer += decoder.end();

        // Choose the handler this request should go to
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Data to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'method': method,
            'headers': headers
        };

        // Route the request to the handler specified
        chosenHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning this response: ', statusCode, payloadString);
        });
    });
};

// Handlers
var handlers = {};

// Hello handler
handlers.hello = function(data, callback) {
    callback(200, { 'message': 'Welcome to the Hello World API!' });
};

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};

// Define the request router
var router = {
    'hello': handlers.hello
};
