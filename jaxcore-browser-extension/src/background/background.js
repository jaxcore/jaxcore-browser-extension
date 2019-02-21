import io from 'socket.io-client';
import EventEmitter from 'events';

let activeTabId = null;

const tabManager = new EventEmitter();

console.log('Jaxcore extension ready');

// var isSocketConnected = false;
// // var spinSocket;
// // var contentPort;
// var spinStore;
// const spinSocketListener = new EventEmitter();
//
// function disconnectSocket(socket, callback) {
//
// 	if (socket) {
//
// 		isSocketConnected = false;
// 		socket.on('disconnect', () => {
//
// 			spinSocketListener.emit('disconnect', spinSocket);
//
// 			console.log('Socket disconnect() callback');
// 			callback();
// 		});
// 		socket.disconnect();
// 	}
// 	else callback();
// }

const postMessage = (port, msg) => {
	if (isPortActiveTab(port)) {
		port.postMessage(msg);
	}
	else {
		console.log('not active tab');
	}
};

function connectPortSocket(port, onConnect, onDisconnect) {
	
	var socketPort = 37524;
	console.log('connecting port ' + socketPort + ' ...');
	//console.log(port);
	
	/* Connects to the socket server */
	var socket = io.connect('http://localhost:' + socketPort, {
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
		
		// isSocketConnected = true;
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
		
		// if (socket._didConnect) {
		//
		// }
		// else {
		// 	console.log('socket reconnect manual');
		// 	socket.connect(function() {
		// 		console.log('manually reconnected');
		// 	});
		// }
	});
	
	// console.log('emit get-spin-store 1');
	// socket.emit('get-spin-store');
}

// var connectingSocket = false;
// function connectSocket() {
// 	if (connectingSocket) return;
// 	connectingSocket = true;
// 	connect(() => {
// 		console.log('connected socket');
// 		sendResponse({connectedExtension: true});
// 	}, () => {
// 		console.log('diconnected socket');
// 	});
// }

// function listenSpinSocket(callback, postMessage, onDisconnect) {
// 	if (!spinSocket) {
// 		console.log('no spin socket');
// 		return;
// 	}
//
// 	const onStore = (store) => {
// 		console.log('BG GOT spin-store', store);
// 		postMessage({
// 			spinStore: store
// 		});
// 	};
// 	const onCreated = (id, state) => {
// 		console.log('BG GOT spin-created', state);
// 		postMessage({
// 			spinId: id,
// 			spinCreated: state
// 		});
// 	};
// 	const onUpdate = (id, state) => {
// 		console.log('BG GOT spin-update', state);
// 		postMessage({
// 			spinId: id,
// 			spinUpdate: state
// 		});
// 	};
// 	const onDestroyed = (id, state) => {
// 		console.log('BG GOT spin-destroyed', state);
// 		postMessage({
// 			spinId: id,
// 			spinDestroyed: state
// 		});
// 	};
//
// 	spinSocket.on('spin-store', onStore);
// 	spinSocket.on('spin-created', onCreated);
// 	spinSocket.on('spin-update', onUpdate);
// 	spinSocket.on('spin-destroyed', onDestroyed);
//
// 	const onDis = function() {
//
// 		console.log('DISCSSSSSCONNECCCCTTTTTT');
// 		debugger;
//
// 		spinSocket.removeListener('spin-store', onStore);
// 		spinSocket.removeListener('spin-created', onCreated);
// 		spinSocket.removeListener('spin-update', onUpdate);
// 		spinSocket.removeListener('spin-destroyed', onDestroyed);
// 		//isSocketConnected = false;
//
// 		spinSocket.removeListener(onDis);
//
// 		onDisconnect();
// 	};
//
// 	spinSocket.on('disconnect', onDis);
//
// 	callback(onDis);
// }


function onPortConnect(port) {
	console.log('onPortConnect', port);
	
	function onMessageListener(msg) {
		console.log('onMessageListener', msg);
		
		if (msg.spinCommand) {
			
			if (port.__socket) {
				console.log('spinCommand sending to socket', msg);
				debugger;
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
		if (request.getSpinStore) {
			//if (spinStore) {
				sendResponse({
					isSocketConnected,
					spinStore
				});
				
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
setInterval(queryActiveTab, 1000);

function sendMessageActiveTab(msg) {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		if (tabs.length) {
			chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
				console.log('GOT Response', response);
			});
		}
	});
}

let jaxcoreRotateIcons = [1, "idle", 8, 16, 24];
let jaxcoreRotateIndex = 0;
const setIcon = function() {
	chrome.browserAction.setIcon({path: 'assets/icons/rotate/' + jaxcoreRotateIcons[jaxcoreRotateIndex] + '.png'});
};

function updateSpinIcon(state) {
	jaxcoreRotateIndex++;
	if (jaxcoreRotateIndex >= jaxcoreRotateIcons.length) jaxcoreRotateIndex = 0;
	setIcon();
}

chrome.runtime.onInstalled.addListener(function() {
	setIcon();
	
	setInterval(updateSpinIcon, 2000);
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