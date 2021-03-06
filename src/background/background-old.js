import io from 'socket.io-client';
import EventEmitter from 'events';

let activeTabId = null;

const tabManager = new EventEmitter();

const EXTENSION_VERSION = '0.0.3';
const WEBSOCKET_HOST = 'localhost';
const WEBSOCKET_PORT = 37524;
const WEBSOCKET_PROTOCOL = 'http';

console.log('Jaxcore extension ready');

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


function onPortConnect(port) {
	console.log('onPortConnect', port);
	
	function onMessageListener(msg) {
		console.log('onMessageListener', msg);
		
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
			
			
			connectPortSocket(port, (socket) => {
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

chrome.runtime.onConnect.addListener(onPortConnect);


chrome.runtime.onMessage.addListener(function (request, sender, _sendResponse) {
	
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
				extensionVersion: EXTENSION_VERSION,
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
});

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

// let jaxcoreRotateIcons = [1, "idle", 8, 16, 24];
// let jaxcoreRotateIndex = 0;
// const setIcon = function() {
// 	chrome.browserAction.setIcon({path: 'assets/icons/rotate/' + jaxcoreRotateIcons[jaxcoreRotateIndex] + '.png'});
// };
//
// function updateSpinIcon(state) {
// 	jaxcoreRotateIndex++;
// 	if (jaxcoreRotateIndex >= jaxcoreRotateIcons.length) jaxcoreRotateIndex = 0;
// 	// setIcon();
// }

chrome.runtime.onInstalled.addListener(function() {
	setInterval(queryActiveTab, 1000);
	// setIcon();
	// setInterval(updateSpinIcon, 2000);
});


// var c = 0;
// setInterval(function() {
// 	console.log('background', c++);
// 	sendMessageActiveTab({
// 		background: true,
// 		greeting: "hello",
// 		count: c
// 	});
// }, 5000);

//connect();