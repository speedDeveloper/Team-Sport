/* Team-Sport. */

var express = require('express');
var http = require('http');

var app = express();

app.get('/', (request, response) => {
  response.sendFile('www/index.html');
});

http.createServer(app).listen(8080);