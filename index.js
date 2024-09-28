/*
* Primary file for the API
*
*/

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Before --The server should respond to all requests with a string
// Now -- Instatiate the Http Server
var httpServer  = http.createServer(function(req, res){

  // aqui estaba la funcion completa, que se corto y pego dentro de unifiedServer, luego de configurar Https
  unifiedServer(req,res);
});

// Start the server, and it listen on port 3000
/* server.listen(3000, function(){
    console.log("The server is listening on port 3000 now");
}); */

// Before -- Start the server   // Now -- Start the Http Server
httpServer.listen(config.httpPort, function(){
    console.log("The server is listening on port "+config.httpPort); //+" in "+config.envName+" mode"
});

// Instantiate the HTTPS Server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
 };

var httpsServer  = https.createServer(httpsServerOptions,function(req, res){
    unifiedServer(req,res);
  });

// Start the HTTPS Server
httpsServer.listen(config.httpsPort, function(){
    console.log("The server is listening on port "+config.httpsPort);
});

// Added after https configured
// All the server logic for both, the http and https server
// Start the HTTP server
var unifiedServer = function(req,res){

      // Get the URL and parse it
      var parseURL = url.parse(req.url, true);

      // Get the path
      var path = parseURL.pathname;
      var trimmedPath = path.replace(/^\/+|\/+$/g,'');
  
      // Get the query string as an object
      var queryStringObject = parseURL.query;
  
      // Get the HTTP Method
      var method = req.method.toLowerCase();
  
      // Get the headers as an object
      var headers = req.headers;
  
      // Get the payload, if any
      var decoder = new StringDecoder('utf-8');
      var buffer = '';
      req.on('data', function(data){
          buffer += decoder.write(data);
      });
      req.on('end', function(){
          buffer += decoder.end();
  
      // Choose the handler this request should go to. If one is not found, use the not found handler
      var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
  
      // Construct the data object to send to the handler
     var data = {
          'trimmedPath' : trimmedPath,
          'queryStringObject' : queryStringObject,
          'method' : method,
          'headers' : headers,
          'payload' : buffer
     };
  
     // Route the request to the handler specified in the router
     choosenHandler(data, function(statusCode, payload){
      // Use status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      //el equivalente de este operador ternario en un bloque if es:
    /*   if (typeof(statusCode) == 'number') {
          statusCode = statusCode;
      } else {
          statusCode = 200;
      } */
      
      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};
  
      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);
  
      // Return the response
      res.setHeader('Content-Type', 'application/json'); //aqui indicamos que estamos enviando JSON, asi se vera un JSON de manera Pretty
      res.writeHead(statusCode);    
      res.end(payloadString);
  
      // Log the request path
      console.log('Returning this response: ', statusCode,payloadString);
  
     });
          
      // Send the response
      // res.end('Hello world\n');
  
      // Log the request path
      // console.log('Request received with these payload: ', buffer);
      //('Request received with these headers: ', headers);
      //('Request received on path: '+trimmedPath+ ' with method: '+method+' and with these query string parameters', queryStringObject);
      });
    
};


// Define the handlers
var handlers = {};

// Ping Handler
handlers.ping = function(data,callback){
    callback(200);
};

// Commented on Ping lesson
// Sample handler
/* handlers.sample = function(data,callback){
    // Callback a http status code, and a payload object
    callback(406,{'name' : 'sample handler'});  
}; */

// Not found handler
handlers.notFound = function(data,callback){
    callback(404);
};


// Define a request router
/* var router = {
    'sample': handlers.sample
}; */
// Changed for this in ping lesson
var router = {
    'ping': handlers.ping
}; 