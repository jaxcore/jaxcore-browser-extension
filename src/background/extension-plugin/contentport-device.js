// import EventEmitter from 'events';

const {Client, createLogger} = require('jaxcore-plugin');

const log = createLogger('ContentPortService');

const schema = {
	id: {
		type: 'string'
	},
	connected: {
		type: 'boolean'
	},
	grantedPrivileges: {
		type: 'object'
	},
	websocketConnected: {
		type: 'boolean'
	},
	portConnected: {
		type: 'boolean'
	},
	portActive: {
		type: 'boolean'
	}
};

let _instance = 0;

const contentPorts = {};

// let activeTabId = null;
// const tabManager = new EventEmitter();
// global.websocketClients = clients;

class ContentPortDevice extends Client {
	constructor(defaults, store, port) {
		super(schema, store, defaults);

		// this.socketTransport = socketTransport;

		this.log = createLogger('ContentPortDevice ' + (_instance++));
		this.log('create', defaults, port);
		
		this._instance = _instance;
		contentPorts[this.state.id] = this;
		
		this.deviceType = 'contentPort';

		this.port = port;

		this._onMessageListener = this.onMessageListener.bind(this);
		port.onMessage.addListener(this._onMessageListener);

		port.onDisconnect.addListener((event) => {
			console.log('port.onDisconnect ----------------');
			debugger;
			port.onMessage.removeListener(this._onMessageListener);
			this.setState({
				connected: false
			});
			this.emit('disconnect');
		});
		
		// this.setState({connected: true});
		
		this.setState({
			connected: true
		});
		this.emit('connect');
		
		// debugger;
	}

	// connect() {
	// 	this.log('connecting content port', this.state);
	// 	debugger;
	// };

	onMessageListener(msg) { 	// message from window
		console.log('onMessageListener', msg);
		
		if ('connectTab' in msg) {
			let requestedPrivileges = msg.connectTab.requestPrivileges;
			console.log('connectTab requestPrivileges=', requestedPrivileges);
			debugger;
			this.emit('connect-tab', requestedPrivileges);
			
			let websocketConnected = this.state.websocketConnected;
			// let portActive = this.state.portActive;
			// let grantedPrivileges = requestPrivileges;
			//
			// this.setState({
			// 	grantedPrivileges
			// });
			//
			// debugger;
			// this.port.postMessage({
			// 	extensionConnected: {
			// 		grantedPrivileges,
			// 		websocketConnected,
			// 		portActive
			// 	}
			// });
			
			// relay to adapter, then to extension service, service emits tab-connected
			
			
			//
			//connectTab(port, msg);
			
			
		}
		else {
			console.log('bg recieved:', msg);
			debugger;
		}


		// if (msg.listenCommand) {
		// 	if (port.__socket) {
		// 		console.log('listenCommand sending to socket', msg);
		// 		// debugger;
		// 		port.__socket.emit('listen-command', msg.listenCommand);
		// 	}
		// 	else {
		// 		console.log('spinCommand no socket for port', msg);
		// 		// debugger;
		// 	}
		// }
		// else if (msg.spinCommand) {
		//
		// 	if (port.__socket) {
		// 		console.log('spinCommand sending to socket', msg);
		// 		// debugger;
		// 		port.__socket.emit('spin-command', msg.spinCommand);
		// 	}
		// 	else {
		// 		console.log('spinCommand no socket for port', msg);
		// 		debugger;
		// 	}
		//
		// }
		// else if (msg.connectExtension) {
		// 	console.log('BG received from content: connectExtension');
		//
		// 	//
		// 	// connectPortSocket(port, (socket) => {
		// 	// 	console.log('port socket connected');
		// 	//
		// 	// 	port.__socket = socket;
		// 	//
		// 	// 	const _dis = function(event) {
		// 	// 		console.log('destroy socket');
		// 	// 		socket.destroy();
		// 	// 		port.onDisconnect.removeListener(_dis);
		// 	// 	};
		// 	// 	port.onDisconnect.addListener(_dis);
		// 	//
		// 	// 	port.postMessage({
		// 	// 		connectedExtension: true
		// 	// 	});
		// 	//
		// 	// }, () => {
		// 	// 	console.log('port socket disconnected');
		// 	//
		// 	// 	port.postMessage({
		// 	// 		connectedExtension: false
		// 	// 	});
		// 	//
		// 	// 	port.disconnect();
		// 	// });
		// }
		// else {
		// 	console.log('unhandled message', msg);
		// }
	};
	
	setConnected(portConnected, msg) {
		this.log('CONTENT PORT setConnected()', portConnected, msg);
		const grantedPrivileges = msg.grantedPrivileges;
		const websocketConnected = msg.websocketConnected;
		
		this.setState({
			portConnected,
			portActive: portConnected,
			grantedPrivileges,
			websocketConnected
		});
		
		this.postToContentScript({
			portConnected,
			portActive: portConnected,
			grantedPrivileges,
			websocketConnected
		});
	}
	
	setActive(portActive) {
		this.setState({
			portActive
		});
		this.postToContentScript({
			portActive
		});
		// this.emit('active', active);
	}
	
	postToContentScript(data) {
		this.port.postMessage(data);
	}
	
	websocketConnected(connected, websocketClientId) {
		debugger;
		
		this.setState({
			websocketConnected: connected,
			websocketClientId
		});
		this.postToContentScript({ // posts to content.js
			websocket: {
				connected,
				id: websocketClientId
			}
		});
	}
	
	spinUpdate(id, changes) {
		this.postToContentScript({
			spinUpdate: {
				id,
				changes
			}
		});
	}
	
	destroy() {
		this.emit('teardown');
		// this.removeAllListeners();
		// delete this.socket;
		// delete clients[this.state.id];
		// debugger;
	}

	static id(serviceConfig) {
		return 'cp:'+serviceConfig.senderId +':'+serviceConfig.tabId;
	}

	// static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
	// 	log('ContentPortServiceService getOrCreateInstance', serviceId, serviceConfig);
	// 	debugger;
	//
	// 	if (serviceId in clients) {
	// 		console.log('wsc', serviceId, 'exists');
	// 		process.exit();
	// 		callback(null, clients[serviceId], false);
	// 	}
	// 	else {
	// 		log('CREATE WSC', serviceId, serviceConfig);
	//
	// 		var instance = ContentPortDevice.create(serviceConfig, serviceStore);
	//
	// 		log('CREATED WSC CLIENT', instance);
	//
	// 		callback(null, clients[serviceId], true);
	//
	// 		// instance.on('connect', function() {
	// 		// 	// console.log('hix');
	// 		// 	// process.exit();
	// 		// 	if (callback) callback(null, instance, true);
	// 		// });
	// 		//
	// 		// instance.connect();
	//
	// 	}
	// 	// if (serviceInstance.clients[serviceId]) {
	// 	// 	let instance = serviceInstance.clients[serviceId];
	// 	// 	log('RETURNING WSC CLIENT', instance);
	// 	// 	// process.exit();
	// 	// 	return instance;
	// 	// }
	// 	// else {
	//
	// 	// }
	// }


	// static create(config, serviceStore) {
	// 	var id = ContentPortDevice.id(config);
	// 	config.id = id;
	// 	log('create wsc', id);
	//
	// 	let client = new ContentPortDevice(config, serviceStore);
	//
	// 	return client;
	// }

	static startJaxcoreDevice(deviceConfig, deviceStore, onDeviceConnectCallback) {

		// function queryActiveTab() {
		// 	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		// 		if (tabs.length) {
		// 			if (activeTabId !== tabs[0].id) {
		// 				activeTabId = tabs[0].id;
		// 				tabManager.emit('active', activeTabId);
		// 			}
		// 		}
		// 	});
		// }
		//
		// function sendMessageActiveTab(msg) {
		// 	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		// 		if (tabs.length) {
		// 			chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
		// 				console.log('GOT Response', response);
		// 			});
		// 		}
		// 	});
		// }
		//
		// chrome.runtime.onInstalled.addListener(function() {
		// 	setInterval(queryActiveTab, 1000);
		// });


		// function isPortActiveTab(port) {
		// 	return port.sender.tab.id === activeTabId;
		// }
		
		// const postMessage = (port, msg) => {
		// 	if (isPortActiveTab(port)) {
		// 		port.postMessage(msg);
		// 	}
		// 	else {
		// 		console.log('not active tab');
		// 	}
		// };


		// function connectTab(port, msg) {
		// 	let requestPermissions = msg.connectTab.requestPermissions;
		// 	console.log('connectTab', requestPermissions, port.sender);
		//
		// 	debugger;
		// 	return;
		//
		// 	// ContentPortService.ids[]
		//
		// 	let id = 'contentPort:'+port.sender.id+':'+port.sender.tab;
		// 	contentPorts[id] = port;
		//
		// 	let adapterConfig = {
		// 		services: {
		// 			contentPort: {
		// 				id: port.sender.id,
		// 				tab: port.sender.tab,
		// 				url: port.sender.url
		// 				// sender: port.sender
		// 				// frameId: 0
		// 				// id: "ghhecchfkpfibdmodnhjfnchjkbjceib"
		// 				// tab: {active: true, audible: false, autoDiscardable: true, discarded: false, favIconUrl: "http://localhost:3000/favicon.ico", …}
		// 				// url: "http://localhost:3000/"
		// 			}
		// 		}
		// 	};
		//
		// 	console.log();
		// 	debugger;
		//
		//
		// 	return;
		//
		// 	connectPortSocket(port, msg,(socket) => {
		// 		console.log('port socket connected');
		//
		// 		port.__socket = socket;
		//
		// 		const _dis = function(event) {
		// 			console.log('destroy socket');
		// 			socket.destroy();
		// 			port.onDisconnect.removeListener(_dis);
		// 		};
		// 		port.onDisconnect.addListener(_dis);
		//
		// 		port.postMessage({
		// 			connectedExtension: true
		// 		});
		//
		// 	}, () => {
		// 		console.log('port socket disconnected');
		//
		// 		port.postMessage({
		// 			connectedExtension: false
		// 		});
		//
		// 		port.disconnect();
		// 	});
		//
		// }

		function onPortConnect(port) {
			console.log('onPortConnect', port);
			
			let config = {
				senderId: port.sender.id,
				tabId: port.sender.tab.id,
				url: port.sender.url
			};
			let id = ContentPortDevice.id(config);
			config.id = id;
			
			
			const contentPort = new ContentPortDevice(config, deviceStore, port);
			// contentPort.on('connect');
			onDeviceConnectCallback(contentPort);
		}

		function onPortMessage(request, sender, _sendResponse) {
			console.log('BG', sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");

			debugger;

			let sendResponse = _sendResponse;

			// POPUP
			if (!sender.tab || !sender.tab.url) {
				debugger;
			}


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
		}

		function onPortDisconnect(port) {
			console.log('onPortDisconnect', port);
			debugger;
		}

		// debugger;
		chrome.runtime.onConnect.addListener(onPortConnect); // connection from web page
		// chrome.runtime.onMessage.addListener(onPortMessage); // message from web page
	}
}

// module.exports = ContentPortDevice;

module.exports = ContentPortDevice;