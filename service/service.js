var express = require('express');
var app = express();
var http = require('http');

var EventEmitter = require('events');
var plugin = require('jaxcore-plugin');
var log = plugin.createLogger('Browser Service');

var socketServer = http.createServer(app);
var io = require('socket.io')(socketServer);

var Spin = require('jaxcore-spin');

function BrowserService() {
	this.constructor();
	this._callSpinMethod = this.callSpinMethod.bind(this);
	this._onDisconnect = this.onDisconnect.bind(this);
}

BrowserService.prototype = new EventEmitter();
BrowserService.prototype.constructor = EventEmitter;

BrowserService.prototype.connect = function(config, callback) {
	var me = this;
	
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
	
	socket.on('spin', this._callSpinMethod);
	socket.on('disconnect', this._onDisconnect);
};

BrowserService.prototype.onDisconnect = function (socket) {
	log('socket DISCONNECT', socket.request.session);
	
	this.removeListener('spin-created', socket._onCreated);
	this.removeListener('spin-update', socket._onUpdate);
	this.removeListener('spin-destroyed', socket._onDestroyed);
	
	socket.off('spin', this._callSpinMethod);
	socket.off('get-spin-store', socket._onStore);
	socket.off('disconnect', this._onDisconnect);
};

BrowserService.prototype.getSpinStore = function() {
	var store = {};
	for (var id in Spin.ids) {
		if (this.isValidId(id)) {
			store[id] = Spin.store.ids[id];s
		}
	}
	return store;
};



BrowserService.prototype.callSpinMethod = function (id, method, args) {
	var spin = Spins.ids[id];
	spin[method].apply(spin, args);
};

module.exports = new BrowserService();
