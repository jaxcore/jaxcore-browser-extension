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

const JAXCORE_PROTOCOL_VERSION = 2;

console.log('Jaxcore content script loaded new');

let bgPort = null;
let isActiveTab = true;

const extensionState = {
	extensionConnected: false, // window connection between page and page tab content script
	tabConnected: false,	// port connection between page tab content script and background.js
	socketConnected: false // socket connection between background.js and desktop jaxco
};

function disconnectExtension() {
	if (bgPort) {
		
		console.log('content post socketDisconnected')
		postMessage({
			socketDisconnected: true
		});
		
		bgPort.disconnect();
		bgPort = undefined;
	}
}

function postHandshake(msg) {
	var data = {
		jaxcore: {
			protocol: JAXCORE_PROTOCOL_VERSION,
			contentHandshake: msg,
		}
	};
	// console.log('content post', data);
	window.postMessage(data, window.document.location.protocol+window.document.location.host);
}

function postMessage(msg) {
	var data = {
		jaxcore: {
			contentMessage: msg,
			protocol: JAXCORE_PROTOCOL_VERSION
		}
	};
	// console.log('content post', data);
	window.postMessage(data, window.document.location.protocol+window.document.location.host);
}

function connectExtension(requestPermissions) {
	console.log('content sending connectExtension to background');
	
	extensionState.extensionConnected = true;
	
	postHandshake({
		extensionConnected: true
	});
	
	connectTab(requestPermissions);
}

function connectTab(requestPermissions) {
	if (bgPort) {
		console.log('Content: already connected to bgPort');
		return;
	}
	
	bgPort = chrome.runtime.connect({
		name:"port-from-cs"
	});
	
	bgPort.onDisconnect.addListener(function() {
		// console.log('console port onDisconnect');
		
		console.log('bgPort disconnected');
		
		postMessage({
			extensionConnected: false,
			bgConnected: false,
			socketConnected: false
		});
		
		bgPort = null;
	});
	
	bgPort.onMessage.addListener(function(msg) {
		console.log("content received from bg", msg);
		debugger;
		return;
		
		if (msg.connectedExtension) {
			
			postMessage({
				// isSocketConnected: !!msg.isSocketConnected,
				connectedExtension: !!msg.connectedExtension,
			});
		}
		
		else if ('isActiveTab' in msg) {
			if (msg.isActiveTab !== isActiveTab) {
				isActiveTab = msg.isActiveTab;
				// console.log('isActiveTab');
				postMessage({
					isActiveTab
				});
			}
		}
		
		// else if (msg.spin) { // spin data from bg
		// 	console.log('got spin store content', msg);
		// 	//debugger;
		// 	postMessage(msg);
		// }
		//
		// else if (msg.listen) { // listen data from bg
		// 	console.log('got listen content', msg);
		// 	// debugger;
		// 	postMessage(msg);
		// }
		
		
	});
	
	bgPort.postMessage({
		connectTab: {
			requestPermissions
		}
	});
}

window.addEventListener("message", function(event) {
	
	
	if (event.source !== window) {
		console.log('!isTrusted', event.source, window);
		debugger;
		return;
	}
	
	if (event.data.jaxcore) {
		if (event.data.jaxcore.protocol !== JAXCORE_PROTOCOL_VERSION) {
			console.error('JAXCORE PROTOCOL MISMATCH, REQUIRE PROTOCOL ',PROTOCOL_VERSION);
			return;
		}
		
		console.log('content script received', event.data);
		// debugger;
		if ('extensionHandshake' in event.data.jaxcore) {
			if ('connectExtension' in event.data.jaxcore.extensionHandshake) {
				if ('requestPermissions' in event.data.jaxcore.extensionHandshake.connectExtension) {
					console.log('content requestPermissions', event.data.jaxcore.extensionHandshake.connectExtension.requestPermissions);
					debugger;
					connectExtension(event.data.jaxcore.extensionHandshake.connectExtension.requestPermissions);
				}
			}
			else if ('disconnectExtension' in event.data.jaxcore.extensionHandshake) {
				console.log('disconnectExtension');
				debugger;
				disconnectExtension();
			}
		}
		else if ('extensionMessage' in event.data.jaxcore) {
			// if ('spin' in event.data.jaxcore.device) {
			// 	console.log('content spin message', event.data.jaxcore.device.spin);
			// 	debugger;
			// }
			debugger;
		}
		else {
			// debugger;
		}
		
		
		// var msg = event.data.jaxcore.message;
		//
		// // if (msg.socketDisconnected) {
		// // 	console.log('content got socketDisconnected');
		// // 	disconnectExtension();
		// // }
		//
		// if (msg.spinCommand) { // spin command to bg
		// 	if (bgPort) {
		// 		console.log('spinCommand sending to bg port', msg);
		// 		bgPort.postMessage(msg);
		// 	}
		// 	else {
		// 		console.log('spinCommand no bgport');
		// 		debugger;
		// 	}
		// 	// postMessage(msg);
		// }
		// else if (msg.listenCommand) {
		// 	if (bgPort) {
		// 		console.log('listenCommand sending to bg port', msg.listenCommand);
		// 		bgPort.postMessage(msg);
		// 	}
		// 	else {
		// 		console.log('listenCommand no bgport');
		// 		// debugger;
		// 	}
		// }
		// else if (msg.disconnectExtension) {
		// 	// console.log('content got disconnectExtension');
		// 	disconnectExtension();
		// }
		// else if (msg.connectExtension) {
		// 	// console.log('content got connectExtension');
		// 	connectExtension();
		// }
		// // else if (event.data.type && (event.data.type == "FROM_PAGE")) {
		// // 	console.log("Content script received message: " + event.data.text);
		// // 	debugger;
		// // }
		// else {
		// 	console.log('content unhandled msg x', msg);
		// 	debugger;
		// }
	}
	else {
		// console.log('not _jaxcore_client', event.data);
	}
});

setTimeout(function() {
	console.log('CONTENT sending extensionReady');
	postHandshake({
		extensionReady: true
	});
},1);