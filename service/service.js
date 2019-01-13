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
	
	// spin.on('spin', function (direction, position) {
	// 	console.log('spin', direction, position);
	// });
	//
	// spin.on('knob', function (pushed) {
	// 	console.log('knob', pushed);
	// });
	//
	// spin.on('button', function (pushed) {
	// 	console.log('button', pushed);
	// });
});







io.on('connection', function (socket) {
	console.log('Socket connection established');
	
	
	const spinCreate = (id, state) => {
		console.log('SEND spin created', id, state);
		socket.emit('spin-created', id, state);
	};
	const spinUpdate = (id, state) => {
		console.log('SEND spin update', id, state);
		socket.emit('spin-update', id, state);
	};
	const spinDestroy = (id, state) => {
		console.log('SEND spin destroyed', id);
		socket.emit('spin-destroyed', id, state);
	};
	
	socket._onCreate = spinCreate;
	socket._onUpdate = spinUpdate;
	socket._spinDestroy = spinDestroy;
	
	Spin.store.addListener('created', socket._onCreate);
	Spin.store.addListener('update', socket._onUpdate);
	Spin.store.addListener('destroyed', socket._spinDestroy);
	
	socket.on('disconnect', function () {
		console.log('DISCONNECT', socket.request.session);
		
		// process.exit();
		Spin.store.removeListener('created', socket._onCreate);
		Spin.store.removeListener('update', socket._onUpdate);
		Spin.store.removeListener('destroyed', socket._spinDestroy);
	});
	
	socket.emit('spin-store', Spin.store);
	
	// socket.emit('hello', {a: 1});
	
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



/* Create HTTP server for node application */
// var server = http.createServer(app);
/* Node application will be running on 3000 port */
// server.listen(3200);
