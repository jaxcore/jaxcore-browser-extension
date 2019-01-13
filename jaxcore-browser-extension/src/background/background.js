import io from 'socket.io-client';

var isConnected = false;
var spinSocket;
var contentPort;

function connect(onConnect, onDisconnect) {
	if (isConnected) {
		onConnect(spinSocket);
		return;
	}
	var port = 37524;
	console.log('connecting port ' + port + ' ...');
	
	/* Connects to the socket server */
	var socket = io.connect('http://localhost:' + port);
	
	spinSocket = socket;
	
	socket.on('connect', () => {
		isConnected = true;
		
		console.log('Socket connected');
		//alert('connected');
		
		console.log('emit hello');
		socket.emit({
			background: 'hello',
		});
		
		const onStore = (store) => {
			console.log('BG GOT spin-store', store);
			contentPort.postMessage({
				spinStore: store
			});
		};
		const onCreated = (id, state) => {
			console.log('BG GOT spin-created', state);
			contentPort.postMessage({
				spinId: id,
				spinCreated: state
			});
		};
		const onUpdate = (id, state) => {
			console.log('BG GOT spin-update', state);
			contentPort.postMessage({
				spinId: id,
				spinUpdate: state
			});
		};
		const onDestroyed = (id, state) => {
			console.log('BG GOT spin-destroyed', state);
			contentPort.postMessage({
				spinId: id,
				spinDestroyed: state
			});
		};
		
		socket.on('spin-store', onStore);
		socket.on('spin-created', onCreated);
		socket.on('spin-update', onUpdate);
		socket.on('spin-destroyed', onDestroyed);
		
		socket.on('disconnect', function() {
			socket.off('spin-store', onStore);
			socket.off('spin-created', onCreated);
			socket.off('spin-update', onUpdate);
			socket.off('spin-destroyed', onDestroyed);
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
		onDisconnect(socket);
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


function onConnectListener(port) {
	console.log('onConnect', port);
	
	//onsole.assert(port.name == "knockknock");
	contentPort = port;
	
	
	
	function onMessageListener(msg) {
		
		console.log('onMessage YY', msg);
		
		if (msg.connectExtension) {
			connect((socket) => {
				console.log('connected socket');
				//sendResponse({connectedExtension: true});
				contentPort.postMessage({connectedExtension: true});
			}, (socket) => {
				console.log('diconnected socket');
				
			});
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


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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