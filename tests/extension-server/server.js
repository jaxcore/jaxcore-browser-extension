var express = require('express');
var app = express();
var http = require('http')
// Socket connection
/* Creates new HTTP server for socket */
var socketServer = http.createServer(app);
var io = require('socket.io')(socketServer);
/* Listen for socket connection on port 3002 */
socketServer.listen(3201, function(){
  console.log('Socket server listening on : 3201');
});
/* This event will emit when client connects to the socket server */
io.on('connection', function(socket){
  console.log('Socket connection established');
});
/* Create HTTP server for node application */
var server = http.createServer(app);
/* Node application will be running on 3000 port */
server.listen(3200);