// import ext from '../utils/ext';
//
// ext.runtime.onMessage.addListener(function(request, sender, sendResponse) {
// 	if (request.action === 'change-color') {
// 		document.body.style.background = request.data.color;
// 	}
// 	else {
//
// 		// if (request.background === true) {
// 		// 	chrome.runtime.sendMessage({
// 		// 		contentScriptMessage: "hello"
// 		// 	}, function(response) {
// 		// 		console.log('response from background?', response);
// 		// 	});
// 		// }
//
// 		console.log('CONTENT received', sender.tab ?
// 			"from a content script:" + sender.tab.url :
// 			"from the extension");
// 		console.log('CONTENT request', request, 'sender', sender, 'response', sendResponse);
//
// 		// if (request.greeting == "hello")
// 		// 	sendResponse({farewell: "goodbye"});
//
// 		//console.log('onMessage', request);
//
// 		sendResponse({contentScriptResponse: "content says hello"});
//
// 	}
// });

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	console.log('CONTENT received', sender.tab ?
// 		"from a content script:" + sender.tab.url :
// 		"from the extension");
//
// 	// if (request.greeting == "hello")
// 	// 	sendResponse({farewell: "goodbye"});
//
// 	console.log('onMessage', request);
//
// 	sendResponse({contentScriptResponse: "content says hello"});
// });

var bgPort = null;

function disconnectExtension() {
	if (bgPort) {
		bgPort.disconnect();
		bgPort = undefined;
	}
}

function connectExtension() {
	console.log('content sending connectExtension to background');
	
	bgPort = chrome.runtime.connect({
		name:"port-from-cs"
	});
	
	bgPort.onDisconnect.addListener(function() {
		console.log('console port onDisconnect');
		window.postMessage({
			connectedExtension: false,
		}, "*");
	});
	
	bgPort.onMessage.addListener(function(msg) {
		console.log("content received from bg", msg);
		
		if (msg.connectedExtension) {
			
			window.postMessage({
				// isSocketConnected: !!msg.isSocketConnected,
				connectedExtension: !!msg.connectedExtension,
			}, "*");
		}
		
		if (msg.spinStore) {
			alert('got spin store content');
			//debugger;
			window.postMessage(msg, "*");
		}
		if (msg.spinCreated) {
			console.log('spin-created', msg.id, msg.spinCreated);
			window.postMessage(msg, "*");
		}
		if (msg.spinUpdate) {
			console.log('spin-update', msg.id, msg.spinUpdate);
			window.postMessage(msg, "*");
		}
		if (msg.spinDestroyed) {
			console.log('spin-destroyed', msg.id, msg.spinDestroyed);
			window.postMessage(msg, "*");
		}
	});
	
	bgPort.postMessage({
		connectExtension: true
	});
	
}

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window || !event.isTrusted) {
		console.log('NOOOOO');
		return;
	}
	
	if (event.data.disconnectExtension) {
		console.log('content got connectExtension');
		disconnectExtension();
	}
	else if (event.data.connectExtension) {
		console.log('content got connectExtension');
		connectExtension();
		
		//alert('connectExtension1');
		// chrome.runtime.postMessage({
		// 	connectExtension: true
		// }, function(response) {
		// 	console.log('extension connected?', response);
		// });
		
	}
	else if (event.data.type && (event.data.type == "FROM_PAGE")) {
		console.log("Content script received message: " + event.data.text);
		debugger;
	}
});

global.HELLO = 1234;
console.log('DUDE', global.DUDE);

