import Jaxcore from 'jaxcore';
import EventEmitter from 'events';

let activeTabId = null;
const tabManager = new EventEmitter();

const JAXCORE_EXTENSION_VERSION = '0.0.3';
const JAXCORE_PROTOCOL_VERSION = 2;

const WEBSOCKET_HOST = 'localhost';
const WEBSOCKET_PORT = 37524;
const WEBSOCKET_PROTOCOL = 'http';

console.log('Jaxcore extension starting');

const jaxcore = new Jaxcore();

jaxcore.addPlugin(require('./contentport-plugin'));

// jaxcore.addAdapter('basic', require(''));

jaxcore.on('service-disconnected', (type, device) => {
	if (type === 'websocketClient') {
		console.log('websocketClient service-disconnected', type, device.id);
		debugger;
		// connectWebSocket();
	}
	else {
		debugger;
	}
});

jaxcore.on('service-connected', (type, device) => {
	if (type === 'websocketClient') {
		console.log('websocketClient connected', type, device.id);
		debugger;
	}
	else console.log('service-connected', type, device.id);
});


jaxcore.on('device-connected', function(type, device) {
	if (type === 'websocketSpin') {
		const spin = device;
		console.log('websocketSpin connected', spin);
		
		debugger;
		jaxcore.launchAdapter(spin, 'contentPort', {
		
		});
		// jaxcore.launchAdapter(spin, 'contentPort');
	}
	else {
		console.log('device-connected', type);
		process.exit();
	}
});

function connectWebSocket() {
	jaxcore.connectWebsocket({
		protocol: 'http',
		host: WEBSOCKET_HOST,
		port: WEBSOCKET_PORT,
		options: {
			reconnection: true
		}
	}, function (err, websocketClient) {
		if (err) {
			console.log('websocketClient error', err);
			process.exit();
		}
		else if (websocketClient) {
			console.log('websocketClient connected');
		}
	});
}

//connectWebSocket();

const postMessage = (port, msg) => {
	if (isPortActiveTab(port)) {
		port.postMessage(msg);
	}
	else {
		console.log('not active tab');
	}
};

function connectPortSocket(port, onConnect, onDisconnect) {
	console.log('connecting port ' + WEBSOCKET_PORT + ' ...');
	
	return;
	
	var socket = io.connect(WEBSOCKET_PROTOCOL + '://' + WEBSOCKET_HOST + ':' + WEBSOCKET_PORT, {
		reconnection: true
	});
	
	const onStore = function(store) {
		console.log('BG GOT spin-store', store);
		postMessage(port, {
			spin: {
				store
			},
			isActiveTab: port.isActiveTab
		});
	};
	const onCreated = (id, state) => {
		console.log('BG GOT spin-created', state);
		postMessage(port, {
			spin: {
				id,
				created: state
			}
		});
	};
	const onUpdate = (id, state) => {
		console.log('BG GOT spin-update', state);
		
		updateSpinIcon(state);
		
		postMessage(port,{
			spin: {
				id,
				update: state
			}
		});
	};
	const onDestroyed = (id, state) => {
		console.log('BG GOT spin-destroyed', state);
		postMessage(port,{
			spin: {
				id,
				destroyed: state
			}
		});
	};
	
	const onRecognized = (text) => {
		console.log('socket BG GOT listen-recognized', text);
		// debugger;
		postMessage(port,{
			listen: {
				recognizedText: text
			}
		});
	};
	
	
	
	port.isActiveTab = isPortActiveTab(port);
	
	const _onTabActive = (id) => {
		const active = isPortActiveTab(port);
		if (port.isActiveTab !== active) {
			port.isActiveTab = active;
			
			//socket.once('')
			if (active) {
				socket.emit('get-spin-store');
			}
			else {
				postMessage(port, {
					isActiveTab: port.isActiveTab
				});
			}
			
			// postMessage(port, {
			// 	activeTab: active
			// });
		}
	};
	
	socket.on('connect', () => {
		
		socket._didConnect = true;
		console.log('Socket connected');
		
		console.log('turn off reconnect');
		socket.io.opts.reconnect = false;
		
		// spinSocketListener.emit('connect', socket);
		// console.log('emit get-spin-store');
		// socket.emit('get-spin-store');
		
		tabManager.addListener('active', _onTabActive);
		
		socket.on('spin-store', onStore);
		socket.on('spin-created', onCreated);
		socket.on('spin-update', onUpdate);
		socket.on('spin-destroyed', onDestroyed);
		
		socket.on('listen-recognized', onRecognized);
		
		onConnect(socket);
	});
	
	socket.on('disconnect', () => {
		console.log('Socket disconnected');
		
		tabManager.removeListener('active', _onTabActive);
		
		socket.removeListener('spin-store', onStore);
		socket.removeListener('spin-created', onCreated);
		socket.removeListener('spin-update', onUpdate);
		socket.removeListener('spin-destroyed', onDestroyed);
		
		socket.removeAllListeners('connect');
		socket.removeAllListeners('disconnect');
		
		console.log('socket disconnected, calling onDisconnect');
		
		port.postMessage({
			socketDisconnected: true
		});
		
		onDisconnect();
	});
}

const contentPorts = {};

function connectTab(port, msg) {
	let requestPermissions = msg.connectTab.requestPermissions;
	console.log('connectTab', requestPermissions, port.sender);
	
	debugger;
	return;
	
	let id = 'contentPort:'+port.sender.id+':'+port.sender.tab;
	contentPorts[id] = port;
	
	let adapterConfig = {
		services: {
			contentPort: {
				id: port.sender.id,
				tab: port.sender.tab,
				url: port.sender.url
				// sender: port.sender
				// frameId: 0
				// id: "ghhecchfkpfibdmodnhjfnchjkbjceib"
				// tab: {active: true, audible: false, autoDiscardable: true, discarded: false, favIconUrl: "http://localhost:3000/favicon.ico", …}
				// url: "http://localhost:3000/"
			},
			websocketClient: {
				protocol: 'http',
				host: WEBSOCKET_HOST,
				port: WEBSOCKET_PORT,
				options: {
					reconnection: true
				}
			}
		}
	};
	console.log();
	debugger;
	
	
	return;
	
	connectPortSocket(port, msg,(socket) => {
		console.log('port socket connected');
		
		port.__socket = socket;
		
		const _dis = function(event) {
			console.log('destroy socket');
			socket.destroy();
			port.onDisconnect.removeListener(_dis);
		};
		port.onDisconnect.addListener(_dis);
		
		port.postMessage({
			connectedExtension: true
		});
		
	}, () => {
		console.log('port socket disconnected');
		
		port.postMessage({
			connectedExtension: false
		});
		
		port.disconnect();
	});
	
}

function onPortConnect(port) {
	console.log('onPortConnect', port);
	debugger;
	
	
	function onMessageListener(msg) {
		console.log('onMessageListener', msg);
		
		if ('connectTab' in msg) {
			console.log(msg.connectTab);
			connectTab(port, msg);
			debugger;
		}
		else {
			console.log('bg recieved:', msg);
			debugger;
		}
		
		return;
		if (msg.listenCommand) {
			if (port.__socket) {
				console.log('listenCommand sending to socket', msg);
				// debugger;
				port.__socket.emit('listen-command', msg.listenCommand);
			}
			else {
				console.log('spinCommand no socket for port', msg);
				// debugger;
			}
		}
		else if (msg.spinCommand) {
			
			if (port.__socket) {
				console.log('spinCommand sending to socket', msg);
				// debugger;
				port.__socket.emit('spin-command', msg.spinCommand);
			}
			else {
				console.log('spinCommand no socket for port', msg);
				debugger;
			}
			
		}
		else if (msg.connectExtension) {
			console.log('BG received from content: connectExtension');
			
			//
			// connectPortSocket(port, (socket) => {
			// 	console.log('port socket connected');
			//
			// 	port.__socket = socket;
			//
			// 	const _dis = function(event) {
			// 		console.log('destroy socket');
			// 		socket.destroy();
			// 		port.onDisconnect.removeListener(_dis);
			// 	};
			// 	port.onDisconnect.addListener(_dis);
			//
			// 	port.postMessage({
			// 		connectedExtension: true
			// 	});
			//
			// }, () => {
			// 	console.log('port socket disconnected');
			//
			// 	port.postMessage({
			// 		connectedExtension: false
			// 	});
			//
			// 	port.disconnect();
			// });
		}
		else {
			console.log('unhandled message', msg);
		}
	}
	
	port.onMessage.addListener(onMessageListener);
	
	port.onDisconnect.addListener(function(event) {
		console.log('port.onDisconnect ----------------');
		port.onMessage.removeListener(onMessageListener);
	});
}



function onPortMessage(request, sender, _sendResponse) {
	
	let sendResponse = _sendResponse;
	
	// POPUP
	if (!sender.tab || !sender.tab.url) {
		if (request.doDisconnectSocket) {
			disconnectSocket(() => {
				console.log('connectSocket callback')
				const d = {
					isSocketConnected
				};
				console.log('disconnectSocket sendResponse', d, sender, sendResponse);
				sendResponse(d);
			});
			return;
		}
		if (request.doConnectSocket) {
			console.log('request.connectSocket', sender, sendResponse);
			
			connectSocket(() => {
				const d = {
					isSocketConnected
				};
				console.log('connectSocket callback', d);
				sendResponse(d);
			});
			return;
		}
		
		if (request.getExtensionState) {
			// request from Popup
			sendResponse({
				extensionFound: true,
				extensionVersion: JAXCORE_EXTENSION_VERSION,
			});
		}
		
		if (request.getSpinStore) {
			//if (spinStore) {
			// 	sendResponse({
			// 		isSocketConnected,
			// 		spinStore
			// 	});
			
			// spinSocket.once('spin-store', function (data) {
			// 	const store = JSON.parse(data);
			// 	spinStore = store;
			// 	sendResponse({
			// 		isSocketConnected,
			// 		spinStore: store
			// 	});
			// 	// listenSpinSocket(function(msg) {
			// 	// 	port.postMessage(msg);
			// 	// });
			// });
			// console.log('msg.getSpinState emit get-spin-store');
			// spinSocket.emit('get-spin-store');
			// } else {
			// 	sendResponse({
			// 		error: 'no-spin-socket'
			// 	});
			// }
			return;
		}
		// if (request.getSocketState) {
		// 	console.log('request.getPopupState isSocketConnected=' + isSocketConnected);
		//
		// 	sendResponse({
		// 		isSocketConnected
		// 	});
		//
		// 	// if (isSocketConnected) {
		// 	// 	if (spinSocket) {
		// 	// 		console.log('emit get-spin-store');
		// 	// 		spinSocket.emit('get-spin-store');
		// 	// 	}
		// 	// }
		//
		// 	// if (isSocketConnected) {
		// 	// 	spinSocket.once('spin-store', function(data) {
		// 	// 		let store = JSON.parse(data);
		// 	// 		sendResponse(getPopupState(store));
		// 	// 	});
		// 	// 	spinSocket.emit('get-spin-store');
		// 	// 	//sendResponse(getPopupState());
		// 	// }
		// 	// else {
		// 	// 	sendResponse(getPopupState());
		// 	// }
		// 	return;
		// }
		
		return;
	}
	
	console.log('BG', sender.tab ?
		"from a content script:" + sender.tab.url :
		"from the extension");
	
	// if (request.greeting == "hello")
	// 	sendResponse({farewell: "goodbye"});
	
	console.log('onMessage XX', request);
	
	
	if (request.connectExtension) {
		console.log('background received connectExtension ????');
		
		// connect(() => {
		// 	console.log('connected socket');
		// 	sendResponse({connectedExtension: true});
		// }, () => {
		// 	console.log('diconnected socket');
		// });
		//sendResponse({connectingExtension: true});
		
	}
	else {
		sendResponse({backgroundResponse: "background says hello"});
	}
}

chrome.runtime.onConnect.addListener(onPortConnect); // connection from web page
chrome.runtime.onMessage.addListener(onPortMessage); // message from web page


function isPortActiveTab(port) {
	return port.sender.tab.id === activeTabId;
}

function queryActiveTab() {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		if (tabs.length) {
			if (activeTabId !== tabs[0].id) {
				activeTabId = tabs[0].id;
				tabManager.emit('active', activeTabId);
			}
		}
	});
}

function sendMessageActiveTab(msg) {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		if (tabs.length) {
			chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
				console.log('GOT Response', response);
			});
		}
	});
}

chrome.runtime.onInstalled.addListener(function() {
	setInterval(queryActiveTab, 1000);
});
