import Jaxcore from 'jaxcore';

const JAXCORE_EXTENSION_VERSION = '0.0.3';
const JAXCORE_PROTOCOL_VERSION = 2;

console.log('Jaxcore extension starting', 'version='+JAXCORE_EXTENSION_VERSION, 'protocol='+JAXCORE_PROTOCOL_VERSION);

const WEBSOCKET_HOST = 'localhost';
const WEBSOCKET_PORT = 37524;

const jaxcore = new Jaxcore();
global.jaxcore = jaxcore;

jaxcore.addPlugin(require('./extension-plugin'));

// jaxcore.addAdapter('basic', require(''));

jaxcore.on('device-connected', function(type, device) {
	if (type === 'contentPort') {
		const contentPort = device;
		console.log('contentPort connected', contentPort);
		debugger;
		jaxcore.launchAdapter(contentPort, 'contentPortExtension');
	}
	else if (type === 'websocketSpin') {
		const spin = device;
		jaxcore.launchAdapter(spin, 'spinExtension');
	}
	else {
		console.log('device-connected', type);
		debugger;
	}
});

jaxcore.startService('extension', null, null, {
	host: WEBSOCKET_HOST,
	port: WEBSOCKET_PORT,
	jaxcoreVersion: JAXCORE_EXTENSION_VERSION,
	protocolVersion: JAXCORE_PROTOCOL_VERSION,
	jaxcore
}, function(err, extensionService) {
	console.log('extensionService', extensionService);
	// debugger;
});

jaxcore.startDevice('contentPort');


// function connectPortSocket(port, onConnect, onDisconnect) {
// 	console.log('connecting port ' + WEBSOCKET_PORT + ' ...');
//
// 	// debugger;
//
// 	return;
//
// 	var socket = io.connect(WEBSOCKET_PROTOCOL + '://' + WEBSOCKET_HOST + ':' + WEBSOCKET_PORT, {
// 		reconnection: true
// 	});
//
// 	const onStore = function(store) {
// 		console.log('BG GOT spin-store', store);
// 		postMessage(port, {
// 			spin: {
// 				store
// 			},
// 			isActiveTab: port.isActiveTab
// 		});
// 	};
// 	const onCreated = (id, state) => {
// 		console.log('BG GOT spin-created', state);
// 		postMessage(port, {
// 			spin: {
// 				id,
// 				created: state
// 			}
// 		});
// 	};
// 	const onUpdate = (id, state) => {
// 		console.log('BG GOT spin-update', state);
//
// 		updateSpinIcon(state);
//
// 		postMessage(port,{
// 			spin: {
// 				id,
// 				update: state
// 			}
// 		});
// 	};
// 	const onDestroyed = (id, state) => {
// 		console.log('BG GOT spin-destroyed', state);
// 		postMessage(port,{
// 			spin: {
// 				id,
// 				destroyed: state
// 			}
// 		});
// 	};
//
// 	const onRecognized = (text) => {
// 		console.log('socket BG GOT listen-recognized', text);
// 		// debugger;
// 		postMessage(port,{
// 			listen: {
// 				recognizedText: text
// 			}
// 		});
// 	};
//
//
//
// 	port.isActiveTab = isPortActiveTab(port);
//
// 	const _onTabActive = (id) => {
// 		const active = isPortActiveTab(port);
// 		if (port.isActiveTab !== active) {
// 			port.isActiveTab = active;
//
// 			//socket.once('')
// 			if (active) {
// 				socket.emit('get-spin-store');
// 			}
// 			else {
// 				postMessage(port, {
// 					isActiveTab: port.isActiveTab
// 				});
// 			}
//
// 			// postMessage(port, {
// 			// 	activeTab: active
// 			// });
// 		}
// 	};
//
// 	socket.on('connect', () => {
//
// 		socket._didConnect = true;
// 		console.log('Socket connected');
//
// 		console.log('turn off reconnect');
// 		socket.io.opts.reconnect = false;
//
// 		// spinSocketListener.emit('connect', socket);
// 		// console.log('emit get-spin-store');
// 		// socket.emit('get-spin-store');
//
// 		tabManager.addListener('active', _onTabActive);
//
// 		socket.on('spin-store', onStore);
// 		socket.on('spin-created', onCreated);
// 		socket.on('spin-update', onUpdate);
// 		socket.on('spin-destroyed', onDestroyed);
//
// 		socket.on('listen-recognized', onRecognized);
//
// 		onConnect(socket);
// 	});
//
// 	socket.on('disconnect', () => {
// 		console.log('Socket disconnected');
//
// 		tabManager.removeListener('active', _onTabActive);
//
// 		socket.removeListener('spin-store', onStore);
// 		socket.removeListener('spin-created', onCreated);
// 		socket.removeListener('spin-update', onUpdate);
// 		socket.removeListener('spin-destroyed', onDestroyed);
//
// 		socket.removeAllListeners('connect');
// 		socket.removeAllListeners('disconnect');
//
// 		console.log('socket disconnected, calling onDisconnect');
//
// 		port.postMessage({
// 			socketDisconnected: true
// 		});
//
// 		onDisconnect();
// 	});
// }
