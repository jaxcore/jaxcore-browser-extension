import io from 'socket.io-client';

function connect(onConnect, onDisconnect) {
	var port = 37524;
	console.log('connecting port ' + port + ' ...');
	
	/* Connects to the socket server */
	var socket = io.connect('http://localhost:' + port);
	
	socket.on('connect', () => {
		console.log('Socket connected');
		//alert('connected');
		
		var c = 0;
		setInterval(function() {
			socket.send({
				background: 'hello',
				count: c++
			});
		}, 3000);
		
		onConnect(socket);
	});
	
	socket.on('disconnect', () => {
		console.log('Socket disconnected');
		onDisconnect(socket);s
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

chrome.runtime.onConnect.addListener(function (port) {
	console.log('onConnect', port);
	
	//onsole.assert(port.name == "knockknock");
	
	port.onMessage.addListener(function (msg) {
		
		console.log('onMessage YY', msg);
		
		if (msg.connectExtension) {
			connect((socket) => {
				console.log('connected socket');
				//sendResponse({connectedExtension: true});
				port.postMessage({connectedExtension: true});
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
	});
});


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

var c = 0;
setInterval(function() {
	console.log('background', c++);
	sendMessageActiveTab({
		background: true,
		greeting: "hello",
		count: c
	});
}, 5000);

//connect();