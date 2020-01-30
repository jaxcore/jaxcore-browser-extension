const JAXCORE_EXTENSION_VERSION = '0.0.3';
const JAXCORE_PROTOCOL_VERSION = 2;

let bgPort = null;

function disconnectExtension() {
	if (bgPort) {
		postMessage({
			socketDisconnected: true
		});
		bgPort.disconnect();
		bgPort = null;
	}
}

function postHandshakeToWinow(msg) {
	const data = {
		jaxcore: {
			version: JAXCORE_EXTENSION_VERSION,
			protocol: JAXCORE_PROTOCOL_VERSION,
			contentHandshake: msg,
		}
	};
	window.postMessage(data, window.document.location.protocol+window.document.location.host);
}

function postMessageToWinow(msg) {
	const data = {
		jaxcore: {
			version: JAXCORE_EXTENSION_VERSION,
			protocol: JAXCORE_PROTOCOL_VERSION,
			contentMessage: msg,
		}
	};
	window.postMessage(data, window.document.location.protocol+window.document.location.host);
}

function connectExtension(requestPrivileges) {
	console.log('content sending connectExtension to background');
	
	if (bgPort) {
		console.log('Content: already connected to bgPort');
		return;
	}
	
	bgPort = chrome.runtime.connect({
		name:"port-from-cs"
	});
	
	bgPort.onDisconnect.addListener(function() {
		console.log('bgPort disconnected');
		
		postHandshakeToWinow({
			portConnected: false,
			portActive: false,
			grantedPrivileges: null,
			websocketConnected: false
		});
		
		bgPort = null;
		// extension context is invalidated at this point, page reload is necessary
	});
	
	bgPort.onMessage.addListener(function(msg) {
		if ('spinUpdate' in msg) {
			// console.log('CONTENT.JS spinUpdate', msg.spinUpdate);
			postMessageToWinow({
				spinUpdate: msg.spinUpdate
			});
		}
		else if ('portConnected' in msg) {
			postHandshakeToWinow({
				portConnected: msg.portConnected,
				portActive: msg.portActive,
				grantedPrivileges: msg.grantedPrivileges,
				websocketConnected: msg.websocketConnected
			});
		}
		else if ('portActive' in msg) {
			postHandshakeToWinow({
				portActive: msg.portActive
			});
		}
		
		else if ('websocket' in msg) {
			let websocketClientId = msg.websocket.id;
			console.log('websocket', 'websocketClientId='+websocketClientId, msg);
			// debugger;
			postHandshakeToWinow({
				websocketConnected: msg.websocket.connected
			});
		}
	});
	
	bgPort.postMessage({
		connectTab: {
			requestPrivileges
		}
	});
}

window.addEventListener("message", function(event) {
	if (event.source !== window) {
		// console.log('!isTrusted', event.source, window);
		// debugger;
		return;
	}
	
	if (event.data.jaxcore) {
		if (event.data.jaxcore.protocol !== JAXCORE_PROTOCOL_VERSION) {
			console.error('JAXCORE PROTOCOL MISMATCH, REQUIRE PROTOCOL ',JAXCORE_PROTOCOL_VERSION);
			return;
		}
		if (event.data.jaxcore.version !== JAXCORE_EXTENSION_VERSION) {
			console.error('JAXCORE VERSION MISMATCH, REQUIRE VERSION ',JAXCORE_EXTENSION_VERSION);
			return;
		}
		
		if ('pageHandshake' in event.data.jaxcore) {
			if ('connectExtension' in event.data.jaxcore.pageHandshake) {
				let msg = event.data.jaxcore.pageHandshake.connectExtension;
				if ('requestPrivileges' in msg) {
					console.log('content requestPrivileges', msg.requestPrivileges);
					connectExtension(msg.requestPrivileges);
				}
			}
			else if ('disconnectExtension' in event.data.jaxcore.pageHandshake) {
				disconnectExtension();
			}
		}
		else if ('pageMessage' in event.data.jaxcore) {
			// debugger;
			if ('spin' in event.data.jaxcore.pageMessage) {
				// if 'spin' in grantedPriveleges
				if (event.data.jaxcore.pageMessage.spin.command) {
					let spinCommand = event.data.jaxcore.pageMessage.spin.command;
					if (typeof spinCommand.id === 'string' &&
						typeof spinCommand.method === 'string' &&
						typeof spinCommand.args === 'object' && ('length' in spinCommand.args) ) { // todo: method/args validation
						console.log('bgPort sending', spinCommand);
						bgPort.postMessage({
							spinCommand
						});
					}
					else {
						debugger;
					}
				}
				else {
					debugger;
				}
			}
			else {
				debugger;
			}
		}
		else {
			if ('contentHandshake' in event.data.jaxcore) {
				// ignore own message sent to window
			}
			else if ('contentMessage' in event.data.jaxcore) {
				// ignore own message sent to window
			}
			else {
				debugger;
			}
		}
	}
	else {
		// console.log('not _jaxcore_client', event.data);
	}
});

setTimeout(function() {
	console.log('CONTENT sending extensionReady');
	postHandshakeToWinow({
		extensionReady: true
	});
},1);