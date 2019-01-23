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

let bgPort = null;
let isActiveTab = true;



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

function postMessage(msg) {
	var data = {
		'_jaxcore_content': {
			message: msg,
			protocol: 1
		}
	};
	console.log('content post', data);
	window.postMessage(data, '*');
		//window.document.location.protocol+window.document.location.host);
}

function connectExtension() {
	console.log('content sending connectExtension to background');
	
	bgPort = chrome.runtime.connect({
		name:"port-from-cs"
	});
	
	bgPort.onDisconnect.addListener(function() {
		console.log('console port onDisconnect');
		
		postMessage({
			connectedExtension: false,
		});
	});
	
	bgPort.onMessage.addListener(function(msg) {
		console.log("content received from bg", msg);
		
		
		
		if (msg.connectedExtension) {
			
			postMessage({
				// isSocketConnected: !!msg.isSocketConnected,
				connectedExtension: !!msg.connectedExtension,
			});
		}
		
		if ('isActiveTab' in msg) { // activeTab is sent along with .spinStore
			if (msg.isActiveTab !== isActiveTab) {
				isActiveTab = msg.isActiveTab;
				console.log('isActiveTab');
				postMessage({
					isActiveTab
				});
			}
		}
		
		if (msg.spin) {
			console.log('got spin store content', msg);
			
			//debugger;
			postMessage(msg);
		}
	});
	
	bgPort.postMessage({
		connectExtension: true
	});
	
}

window.addEventListener("message", function(event) {
	console.log('content on message', event.data);
	
	// We only accept messages from ourselves
	if (event.source != window || !event.isTrusted) {
		console.log('!isTrusted');
		return;
	}
	
	if (event.data._jaxcore_client) {
		var msg = event.data._jaxcore_client.message;
		
		// if (msg.socketDisconnected) {
		// 	console.log('content got socketDisconnected');
		// 	disconnectExtension();
		// }
		if (msg.disconnectExtension) {
			console.log('content got disconnectExtension');
			disconnectExtension();
		}
		else if (msg.connectExtension) {
			console.log('content got connectExtension');
			connectExtension();
		}
		// else if (event.data.type && (event.data.type == "FROM_PAGE")) {
		// 	console.log("Content script received message: " + event.data.text);
		// 	debugger;
		// }
		else {
			console.log('content unhandled msg', msg);
		}
	}
	else {
		console.log('not _jaxcore_client', event.data);
	}
});

