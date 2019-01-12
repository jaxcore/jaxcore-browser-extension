import io from 'socket.io-client';

function connect() {
	var port = 37524;
	console.log('connecting port ' + port + ' ...');
	
	/* Connects to the socket server */
	var socket = io.connect('http://localhost:' + port);
	
	socket.on('connect', () => {
		console.log('Socket connected');
		alert('connected');
	});
	
	socket.on('disconnect', () => {
		console.log('Socket disconnected');
	});
}

chrome.runtime.onConnect.addListener(function (port) {
	console.log('onConnect', port);
	
	//onsole.assert(port.name == "knockknock");
	
	port.onMessage.addListener(function (msg) {
		
		console.log('onMessage', msg);
		
		if (msg.connect) {
			port.postMessage({connected: true});
		}
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
	
	console.log('onMessage', request);
	
	sendResponse({backgroundResponse: "background says hello"});
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