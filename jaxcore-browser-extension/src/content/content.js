// import ext from '../utils/ext';

// ext.runtime.onMessage.addListener(function(msg) {
// 	if (msg.action === 'change-color') {
// 		document.body.style.background = msg.data.color;
// 	}
// 	else {
// 		console.log('CONTENT SCRIPT', msg);
//
// 		if (msg.background === true) {
// 			chrome.runtime.sendMessage({
// 				contentScriptMessage: "hello"
// 			}, function(response) {
// 				console.log('response from background?', response);
// 			});
// 		}
// 	}
// });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(sender.tab ?
		"from a content script:" + sender.tab.url :
		"from the extension");
	
	// if (request.greeting == "hello")
	// 	sendResponse({farewell: "goodbye"});
	
	console.log('onMessage', request);
	
	sendResponse({contentScriptResponse: "content says hello"});
});

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window)
		return;
	
	if (event.data.type && (event.data.type == "FROM_PAGE")) {
		console.log("Content script received message: " + event.data.text);
		
		debugger;
	}
});

global.HELLO = 1234;
console.log('DUDE', global.DUDE);

