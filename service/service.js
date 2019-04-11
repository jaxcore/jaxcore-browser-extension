var express = require('express');
var app = express();
var http = require('http');

var EventEmitter = require('events');
var plugin = require('jaxcore-plugin');
var log = plugin.createLogger('Browser Service');

var socketServer = http.createServer(app);
var io = require('socket.io')(socketServer);

var Spin = require('jaxcore-spin');

var Listen = require('jaxcore-listen');

console.log('loading models', __dirname+'/models');

function BrowserService() {
	this.constructor();
	// this._callSpinMethod = this.callSpinMethod.bind(this);
}

BrowserService.prototype = new EventEmitter();
BrowserService.prototype.constructor = EventEmitter;

BrowserService.prototype.connect = function(config, callback) {
	var me = this;
	
	this.listen = new Listen({
		path: config.modelPath  //__dirname+'/../../jaxcore-listen/models'
	});
	
	if (config.ids) {
		this.validIds = config.ids;
	}
	else this.validIds = null;
	
	io.on('connection', function (socket) {
		log('Socket connection established');
		
		me.onConnect(socket);
		
	});
	
	socketServer.listen(config.port, function () {
		log('Socket server listening on : ' + config.port);
		
		callback();
	});
	
	
	const spinCreate = function(id, state) {
		if (me.isValidId(id)) {
			log('SEND spin created', id, state);
			me.emit('spin-created', id, state);
		}
		else log('spinCreate invalid id', id);
	};
	const spinUpdate = function(id, state) {
		if (me.isValidId(id)) {
			log('SEND spin update', id, state);
			me.emit('spin-update', id, state);
		}
		else log('spinUpdate invalid id', id);
	};
	const spinDestroy = function(id, state) {
		if (me.isValidId(id)) {
			log('SEND spin destroyed', id);
			me.emit('spin-destroyed', id, state);
		}
		else log('spinDestroy invalid id', id);
	};
	
	Spin.store.addListener('created', spinCreate);
	Spin.store.addListener('update', spinUpdate);
	Spin.store.addListener('destroyed', spinDestroy);
};

BrowserService.prototype.isValidId = function(id) {
	if (this.validIds) {
		return this.validIds.indexOf(id) > -1;
	}
	else return true;
};

BrowserService.prototype.onConnect = function(socket) {
	
	var listen = this.listen;
	
	var me = this;
	
	socket.emit('spin-store', this.getSpinStore());
	
	socket._onCreated = function (id, state) {
		socket.emit('spin-created', id, state);
	};
	socket._onUpdate = function (id, state) {
		socket.emit('spin-update', id, state);
	};
	socket._onDestroyed  = function (id, state) {
		socket.emit('spin-destroyed', id, state);
	};
	
	this.addListener('spin-created', socket._onCreated);
	this.addListener('spin-update', socket._onUpdate);
	this.addListener('spin-destroyed', socket._onDestroyed);
	
	socket._onStore = function () {
		socket.emit('spin-store',  me.getSpinStore());
	};
	socket.on('get-spin-store', socket._onStore);
	
	// socket.on('spin', this._callSpinMethod);
	
	socket._onSpinCommand = function(command) {
		let id = command.id;
		let method = command.method;
		let args = command.args;
		if (id in Spin.spinIds) {
			console.log('spin-command', id, method, args);
			Spin.spinIds[id].sendCommand(id, method, args);
		}
		else {
			console.log('could not find ', id);
			process.exit();
		}
	};
	
	socket.on('spin-command', socket._onSpinCommand);
	
	const listenOnRecognize = function (text) {
		console.log('\nService Recognized as:', text);
		if (text.length>0) {
			console.log('sockdet emit listen-recognized', text);
			socket.emit('listen-recognized', text);
		}
		else {
			console.log('nothing recognized');
		}
	};
	// const listenOnStart = function () {
	// 	socket.emit('listen-start');
	// };
	// const listenOnStop = function () {
	// 	socket.emit('listen-stop');
	// };
	// const listenOnStartContinuous = function () {
	// 	socket.emit('listen-start-continuous');
	// };
	// const listenOnStopContinuous = function () {
	// 	socket.emit('listen-stop-continuous');
	// };
	
	socket._onListenCommand = function(listenCommand) {
		let command = listenCommand.command;
		let options = listenCommand.options;
		
		if (command === 'start') {
			console.log('Listen starting');
			
			listen.once('recognize', listenOnRecognize);
			
			listen.once('start', function() {
				socket.emit('listen-start');
			});
			listen.start(); // todo: add options
		}
		else if (command === 'stop') {
			console.log('Listen stop');
			listen.once('stop', function() {
				socket.emit('listen-stop');
				console.log('stoppp!!!');
				process.exit();
			});
			// listen.removeListener('recognize', listenOnRecognize);
			listen.stop();
		}
		else if (command === 'start-continuous') {
			console.log('Listen continuous starting');
			listen.on('recognize', listenOnRecognize);
			listen.once('start-continunous', function() {
				socket.emit('listen-start-continuous');
			});
			listen.startContinuous(options);
		}
		else if (command === 'stop-continuous') {
			console.log('Listen continuous stopping');
			listen.once('stop-continunous', function() {
				socket.emit('listen-stop-continuous');
				listen.removeListener('recognize', listenOnRecognize);
			});
			listen.stopContinuous();
		}
		else {
			console.log('listen command not recognized', command);
			process.exit();
		}
	};
	
	socket.on('listen-command', socket._onListenCommand);
	
	socket._onDisconnect = function() {
		log('socket DISCONNECT', socket.request.session);
		
		me.removeListener('spin-created', socket._onCreated);
		me.removeListener('spin-update', socket._onUpdate);
		me.removeListener('spin-destroyed', socket._onDestroyed);
		
		// socket.removeListener('spin', me._callSpinMethod);
		socket.removeListener('get-spin-store', socket._onStore);
		
		socket.removeListener('spin-command', socket._onSpinCommand);
		
		socket.removeListener('listen-command', socket._onListenCommand);
		
		socket.removeListener('disconnect', this._onDisconnect);
	};
	socket.on('disconnect', socket._onDisconnect);
};

BrowserService.prototype.getSpinStore = function() {
	var store = {};
	for (var id in Spin.store.ids) {
		if (this.isValidId(id)) {
			store[id] = Spin.store[id];
		}
	}
	return store;
	//return JSON.stringify(store);
};



// BrowserService.prototype.callSpinMethod = function (id, method, args) {
// 	log('calling method', id, method, args);
// 	var spin = Spins.ids[id];
// 	spin[method].apply(spin, args);
// };

// listen.startContinuous();

module.exports = new BrowserService();
