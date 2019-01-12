var express = require('express');
var app = express();
var http = require('http');


var Spin = require('jaxcore-spin'); // outside this project use 'jaxcore-spin'

var socketServer = http.createServer(app);
var io = require('socket.io')(socketServer);

var port = 37524;
// var port = 80;


socketServer.listen(port, function () {
	console.log('Socket server listening on : ' + port);
});

Spin.connectAll(function (spin) {
	
	console.log('connected', spin.id);
	
	spin.on('spin', function (direction, position) {
		console.log('spin', direction, position);
	});
	
	spin.on('knob', function (pushed) {
		console.log('knob', pushed);
	});
	
	spin.on('button', function (pushed) {
		console.log('button', pushed);
	});
});



io.on('connection', function (socket) {
	console.log('Socket connection established');
	
	socket.emit('hello', {a: 1});
	
	socket.on('data', function (raw) {
		var data;
		try {
			data = JSON.parse(raw);
		}
		catch(e) {
			console.log(e);
		}
		console.log('client data:', data);
	});
});

io.on('disconnect', function (socket) {
	console.log('DISCONNECT', socket.request.session);
});

/* Create HTTP server for node application */
// var server = http.createServer(app);
/* Node application will be running on 3000 port */
// server.listen(3200);
