import io from 'socket.io-client';

var isSocketConnected = false;
var spinSocket;
var contentPort;

function disconnect(callback) {
	
	if (spinSocket) {
		spinSocket.on('disconnect', () => {
			console.log('Socket disconnect() callback');
			callback();
		});
		spinSocket.disconnect();
	}
	else callback();
}

function connect(onConnect, onDisconnect, postMessage) {
	if (isSocketConnected) {
		console.log('already connected');
		onConnect(spinSocket);
		return;
	}
	var port = 37524;
	console.log('connecting port ' + port + ' ...');
	
	/* Connects to the socket server */
	spinSocket = io.connect('http://localhost:' + port);

	var socket = spinSocket;
	socket.on('connect', () => {
		isSocketConnected = true;
		
		console.log('Socket connected');
		//alert('connected');
		
		console.log('emit hello');
		socket.emit({
			background: 'hello',
		});
		
		
		
		// var c = 0;
		// setInterval(function() {
		// 	console.log('emit spin');
		// 	socket.emit({
		// 		spin: -1
		// 	});
		// }, 3000);
		
		onConnect(socket);
	});
	
	socket.on('disconnect', () => {
		console.log('Socket disconnected');
		// onDisconnect(socket);
		
		isSocketConnected = false;
		
		spinSocket = null;
	});
}

var connectingSocket = false;
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

function listenSpinSocket(postMessage) {
	if (!spinSocket) {
		console.log('no spin socket');
		return;
	}
	
	const onStore = (store) => {
		console.log('BG GOT spin-store', store);
		postMessage({
			spinStore: store
		});
	};
	const onCreated = (id, state) => {
		console.log('BG GOT spin-created', state);
		postMessage({
			spinId: id,
			spinCreated: state
		});
	};
	const onUpdate = (id, state) => {
		console.log('BG GOT spin-update', state);
		postMessage({
			spinId: id,
			spinUpdate: state
		});
	};
	const onDestroyed = (id, state) => {
		console.log('BG GOT spin-destroyed', state);
		postMessage({
			spinId: id,
			spinDestroyed: state
		});
	};
	
	spinSocket.on('spin-store', onStore);
	spinSocket.on('spin-created', onCreated);
	spinSocket.on('spin-update', onUpdate);
	spinSocket.on('spin-destroyed', onDestroyed);
	
	spinSocket.on('disconnect', function() {
		spinSocket.off('spin-store', onStore);
		spinSocket.off('spin-created', onCreated);
		spinSocket.off('spin-update', onUpdate);
		spinSocket.off('spin-destroyed', onDestroyed);
		//isSocketConnected = false;
	});
}


// content script or Popup port
function onConnectListener(port) {
	console.log('onConnect', port);
	
	//onsole.assert(port.name == "knockknock");
	// contentPort = port;
	
	//contentPort = port;
	
	
	function onMessageListener(msg) {
		
		console.log('onMessage YY', msg);
		
		if (msg.disconnectSocket) {
			console.log('got disconnectSocket');
			
			disconnect(() => {
				//const d = getPopupState();
				console.log('disconnectSocket.postMessage');
				//port.postMessage(d);
			});
			
			return;
		}
		if (msg.connectSocket) {
			console.log('got connectSocket');
			
			//sendResponse(getPopupState());
			
			connect((socket) => {
				
				const d = getPopupState();
				console.log('port.postMessage 1', d);
				port.postMessage(d);
				
				
				
				socket.on('disconnect', () => {
					const d = getPopupState();
					console.log('port.postMessage 2', d);
					port.postMessage(d);
				});
				
				socket.once('spin-store', function(data) {
					const store = JSON.parse(data);
					port.postMessage({
						spinStore: store
					});
					
					// listenSpinSocket(function(msg) {
					// 	port.postMessage(msg);
					// });
				});
				socket.emit('get-spin-store');
			});
			
			return;
		}
		if (msg.connectExtension) {
			// connect((socket) => {
			// 	console.log('connected socket');
			// 	//sendResponse({connectedExtension: true});
			// 	contentPort.postMessage({connectedExtension: true});
			// }, (socket) => {
			// 	console.log('diconnected socket');
			//
			// });
			//port.postMessage({connectedExtension: true});
		}
		// else if (msg.connect) {
		// 	port.postMessage({connected: true});
		// }
		else {
			port.postMessage({blah: true});
			sendMessageActiveTab({oops:true});
		}
		
		//
		//
		// 	// if (msg.joke == "Knock knock")
		// 	// 	port.postMessage({question: "Who's there?"});
		// 	// else if (msg.answer == "Madame")
		// 	// 	port.postMessage({question: "Madame who?"});
		// 	// else if (msg.answer == "Madame... Bovary")
		// 	// 	port.postMessage({question: "I don't get it."});
		// 	// else {
		// 	// 	console.log('nopers', msg);
		// 	// }
	}
	
	port.onMessage.addListener(onMessageListener);
	
	port.onDisconnect.addListener(function(event) {
		console.log('port.onDisconnect ----------------');
		chrome.runtime.onConnect.removeListener(onConnectListener);
		port.onMessage.removeListener(onMessageListener);
		//contentPort = null;
	});
}

chrome.runtime.onConnect.addListener(onConnectListener);

// chrome.runtime.onDisconnect.addListener(() => {
// 	chrome.runtime.onConnect.removeListener(onConnectListener);
// 	contentPort = null;
// });

function connectSocket(callback) {
	connect((socket) => {
		console.log('connected socket');
		//sendResponse({connectedExtension: true});
		// contentPort.postMessage({connectedExtension: true});
		
		callback();
	}, (socket) => {
		console.log('diconnected socket');
		// sendResponse({
		// 	socketDisconnected: true
		// });
	}, (msg) => {
		console.log('send to active tab', msg);
		
		//sendMessageActiveTab(msg);
	});
}

function getPopupState(spinStore) {
	return {
		isSocketConnected,
		spinStore
	}
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	
	if (request.connectSocket) {
		connectSocket(() => {
			console.log('connectSocket callback')
			const d = {
				socketConnected: true
			};
			console.log('connectSocket!!!!!!!!!!!!!!!!! sendResponse', d, sender, sendResponse);
			sendResponse(d);
		});
		return;
	}
	if (request.getPopupState) {
		console.log('request.getPopupState isSocketConnected='+isSocketConnected);
		sendResponse(getPopupState());
		// if (isSocketConnected) {
		// 	spinSocket.once('spin-store', function(data) {
		// 		let store = JSON.parse(data);
		// 		sendResponse(getPopupState(store));
		// 	});
		// 	spinSocket.emit('get-spin-store');
		// 	//sendResponse(getPopupState());
		// }
		// else {
		// 	sendResponse(getPopupState());
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


function sendMessageActiveTab(msg) {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		if (tabs.length) {
			chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
				console.log('GOT Response', response);
			});
		}
		
	});
}

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