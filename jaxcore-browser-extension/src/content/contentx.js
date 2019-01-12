/* global document */

// import ext from '../utils/ext';
//
// ext.runtime.onMessage.addListener(function(msg) {
// 	if (msg.action === 'change-color') {
// 		document.body.style.background = msg.data.color;
// 	}
// 	else {
// 		console.log('CONTENT SCRIPT', msg);
// 	}
// });

// ext.runtime.onConnectExternal.addListener(function (port) {
// 	console.log();
//     port.onMessage.addListener(function (msg) {
//         // See other examples for sample onMessage handlers.
//         console.log('wuuuu')
//     });
// });

// var port = chrome.runtime.connect({name: "knockknock"});
//
// port.postMessage({joke: "Knock knock"});
//
// port.onMessage.addListener(function (msg) {
//
//
// 	if (msg.question === "Who's there?") {
// 		port.postMessage({answer: "Madame"});
// 	}
// 	else if (msg.question === "Madame who?") {
// 		port.postMessage({answer: "Madame... Bovary"});
// 	}
// 	else {
// 		console.log('received msg', msg);
// 	}
// });
//

var c = 0;
setInterval(function() {
	console.log('content', c++);
}, 10000);