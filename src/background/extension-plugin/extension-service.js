const {Service, createLogger} = require('jaxcore-plugin');

const log = createLogger('ExtensionService');

const schema = {
	id: {
		type: 'string'
	},
	connected: {
		type: 'boolean'
	},
	activeTabId: {
		type: 'string'
	}
};

let instance = null;
let jaxcore = null;

function connectWebSocket(jaxcore, host, port) {
	jaxcore.connectWebsocket({
		protocol: 'http',
		host: host,
		port: port,
		options: {
			reconnection: true
		}
	}, function (err, websocketClient) {
		if (err) {
			console.log('websocketClient error', err);
			debugger;
			// process.exit();
		}
		else if (websocketClient) {
			// debugger;
			console.log('websocketClient connected');
		}
	});
}

class ExtensionService extends Service {
	constructor(defaults, store) {
		super(schema, store, defaults);
		this.log = createLogger('ExtensionService');
		this.log('create', defaults);
		
		
		jaxcore.on('service-connected', (type, device) => {
			if (type === 'websocketClient') {
				console.log('websocketClient connected', type, device.id);
				// debugger;
			}
			else console.log('service-connected', type, device.id);
		});
		
		jaxcore.on('service-disconnected', (type, device) => {
			if (type === 'websocketClient') {
				console.log('websocketClient service-disconnected', type, device.id);
				// debugger;
				this.log('connectWebSocket again', this.state.host, this.state.port);
				connectWebSocket(jaxcore, this.state.host, this.state.port);
			}
			else {
				debugger;
			}
		});
		
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
	
	spinUpdate(id, changes) {
		console.log('ExtensionService spin update', id, changes);
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