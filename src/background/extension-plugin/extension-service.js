const {Service, createLogger} = require('jaxcore');

const log = createLogger('ExtensionService');

const schema = {
	id: {
		type: 'string'
	},
	connected: {
		type: 'boolean'
	},
	activePortId: {
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
		
		this.tabsToContentPortId = {};
		
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
				
				websocketClient.on('speech-recognize', (text) => {
					console.log('SPEECH-RECOGNIZE', text);
					this.emit('speech-recognize', text);
				});
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
		
		this.startActiveTabMonitor();
		
	}
	
	startActiveTabMonitor() {
		setInterval(() => {
			chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
				if (tabs.length) {
					let activeTabId = tabs[0].id;
					if (this.state.activeTabId !== activeTabId) {
						if (activeTabId in this.tabsToContentPortId) {
							this.log('activeTabId', activeTabId);
							const contentPortId = this.tabsToContentPortId[activeTabId];
							this.setState({
								activeTabId
							});
							// this.log('setting active tab to', contentPortId);
							this.setActivePort(contentPortId);
							// this.emit('active-tab', activeTabId);
						}
						else {
							if (this.state.activeTabId !== null) {
								this.setState({
									activeTabId: null
								});
								// active tab is not connected
								// this.log('active tab is not a jaxcore tab', this.tabsToContentPortId);
								this.setActivePort(null);
							}
						}
					}
				}
			});
		}, 200);
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
		if (this.state.activePortId === contentPortId) {
			// debugger;
			return;
		}
		
		this.log('setActivePort', contentPortId);
		
		if (this.state.activePortId) {
			let activePortId = this.state.activePortId;
			this.log('deactiving tab', activePortId);
			this.setState({
				activePortId: null
			});
			this.activePort = null;
			this.emit(activePortId+':deactivated');
		}
		
		if (contentPortId) {
			this.setState({
				activePortId: contentPortId
			});
			
			this.emit(contentPortId + ':activated');
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
			else {
				console.log('not connected');
			}
		}
		return store;
	}
	
	connectTab(contentPortId, requestedPrivileges, senderId, tabId) {
		this.tabsToContentPortId[tabId] = contentPortId;
		this.state.activeTabId = tabId;
		// debugger;
		/*senderId: port.sender.id,
		tabId: port.sender.tab.id,
		url: port.sender.url*/
		// debugger;
		
		this.setActivePort(contentPortId);
		const grantedPrivileges = requestedPrivileges;
		
		this.state.contentPrivileges[contentPortId] = grantedPrivileges;
		
		this.emit(this.state.activePortId+':connected', {
			grantedPrivileges,
			websocketConnected: this.state.websocketClientConnected
		});
	}
	
	spinCommand(id, method, args) {
		this.emit('spin-command-'+id, id, method, args);
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
		this.emit(this.state.activePortId + ':spin-update', id, changes);
		// todo store contentPort reference and call direclty?
	}
	
	static id() {
		return 'extension';
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		log('ExtensionServiceService getOrCreateInstance', serviceId, serviceConfig);
		
		console.log('serviceConfig', serviceId, serviceConfig);
		
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