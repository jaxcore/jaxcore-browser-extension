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

var bgPort;

function connectExtension() {
	console.log('content sending connectExtension to background');
	
	bgPort = chrome.runtime.connect({
		name:"port-from-cs"
	});
	
	bgPort.onMessage.addListener(function(msg) {
		console.log("content received from bg", msg);
		
		if (msg.connectedExtension) {
			console.log('GOT it');
			alert('connectedExtension');
		}
	});
	
	bgPort.postMessage({
		connectExtension: true
	});
	
}

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window || !event.isTrusted)
		return;
	
	
	if (event.data.connectExtension) {
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

