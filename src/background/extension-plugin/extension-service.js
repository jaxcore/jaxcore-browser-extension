const {Service, createLogger} = require('jaxcore-plugin');

const log = createLogger('ExtensionService');

const schema = {
	id: {
		type: 'string'
	},
	connected: {
		type: 'boolean'
	},
	activePort: {
		type: 'string'
	},
	contentPrivileges: {
		type: 'object'
	},
	websocketClientConnected: {
		type: 'boolean'
	}
};

let instance = null;
let jaxcore = null;

let extensionWebsocketClient = null;

function connectWebSocket(jaxcore, host, port) {
	if (extensionWebsocketClient) {
		console.log('extensionWebsocketClient exists');
		debugger;
		return;
	}
	
	jaxcore.connectWebsocket({
		protocol: 'http',
		host: host,
		port: port,
		options: {
			reconnection: true,
			pingTimeout: 120000
		}
	}, function (err, websocketClient) {
		if (err) {
			console.log('websocketClient error', err);
			debugger;
			// process.exit();
		}
		else if (websocketClient) {
			// debugger;
			// extensionWebsocketClient = websocketClient;
			console.log('websocketClient connected');
		}
	});
}

class ExtensionService extends Service {
	constructor(defaults, store) {
		super(schema, store, defaults);
		this.log = createLogger('ExtensionService');
		this.log('create', defaults);
		
		const onConnect = (type, device) => {
			if (type === 'websocketClient') {
				let websocketClient = device;
				extensionWebsocketClient = websocketClient;
				
				console.log('websocketClient connected', type, device.id);
				// debugger;
				this.setState({
					websocketClientConnected: true
				});
				this.emit('websocketclient-connect', device.id);
			}
			else console.log('service-connected', type, device.id);
		};
		
		const onDisconnect = (type, device) => {
			if (type === 'websocketClient') {
				console.log('websocketClient service-disconnected', type, device.id);
				this.setState({
					websocketClientConnected: false
				});
				this.emit('websocketclient-disconnect', device.id);
				this.log('RECONNECTING connectWebSocket again', this.state.host, this.state.port);
				
				extensionWebsocketClient = null;
				// debugger;
				connectWebSocket(jaxcore, this.state.host, this.state.port);
			}
			else {
				debugger;
			}
		};
		
		jaxcore.on('service-connected', onConnect);
		jaxcore.on('service-disconnected', onDisconnect);
		
		this.log('connectWebSocket', this.state.host, this.state.port);
		// debugger;
		connectWebSocket(jaxcore, this.state.host, this.state.port);
		
		// host: WEBSOCKET_HOST,
		// port: WEBSOCKET_PORT,
		// jaxcoreVersion: JAXCORE_EXTENSION_VERSION,
		// protocolVersion: JAXCORE_PROTOCOL_VERSION
		// jaxcore
	}
	
	connect() {
		this.log('connecting extension service', this.state);
		this.setState({
			connected: true
		});
		this.emit('connect');
	};
	
	destroy() {
		this.emit('teardown');
	}
	
	setActivePort(contentPortId) {
		this.log('setActivePort', contentPortId);
		if (this.state.activePortId === contentPortId) {
			debugger;
			return;
		}
		if (this.state.activePortId) {
			this.setState({
				activePortId: null
			});
			this.activePort = null;
			// this.emit(this.state.activePortId+':deactivated');
		}
		
		if (contentPortId) {
			this.setState({
				activePortId: contentPortId
			});
			
			// this.emit(this.state.activePortId + ':activated');
			// debugger;
		}
		// this.emit('port-activated', contentPort.id);
	}
	
	getSpinStore() { // ToActivePort
		let store = {};
		for (let id in jaxcore.deviceClasses.websocketSpin.spinIds) {
			if (jaxcore.deviceClasses.websocketSpin.spinIds[id].state.connected) {
				store[id] = jaxcore.deviceClasses.websocketSpin.spinIds[id].state;
				// debugger;
				// this.emit(this.state.activePortId + ':spin-update', id, jaxcore.deviceClasses.websocketSpin.spinIds[id].state);
			}
		}
		return store;
	}
	
	connectTab(contentPortId, requestedPrivileges) {
		
		debugger;
		this.setActivePort(contentPortId);
		const grantedPrivileges = requestedPrivileges;
		
		this.state.contentPrivileges[contentPortId] = grantedPrivileges;
		
		this.emit(this.state.activePortId+':connected', {
			grantedPrivileges,
			websocketConnected: this.state.websocketClientConnected
		});
	}
	
	// portConnected(contentPortId) {
	// 	console.log('DELETE THIS?');
	// 	// this.log('websocketSpin', jaxcore.stores.devices['websocketSpin']);
	// 	debugger;
	//
	// 	// for (let id in jaxcore.stores.devices['websocketSpin']) {
	//
	//
	// }
	
	spinUpdate(id, changes) {
		console.log('ExtensionService spin update', id, changes);
		this.emit(this.state.activePort + ':spin-update', id, changes);
	}
	
	static id() {
		return 'extension';
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		log('ExtensionServiceService getOrCreateInstance', serviceId, serviceConfig);
		
		console.log('serviceConfig', serviceId, serviceConfig);
		
		// debugger;
		if (serviceConfig.jaxcore) {
			if (!jaxcore) {
				jaxcore = serviceConfig.jaxcore;
				console.log('got jaxcore');
			}
			// remove jaxcore from the config because it becomes a state property
			delete serviceConfig.jaxcore;
		}
		
		serviceConfig.id = 'extension';
		
		if (instance) {
			callback(null, instance, false);
		}
		else {
			log('CREATE ExtensionService', serviceId, serviceConfig);
			
			instance = new ExtensionService(serviceConfig, serviceStore);
			// debugger;
			callback(null, instance, true);
		}
	}
}

module.exports = ExtensionService;