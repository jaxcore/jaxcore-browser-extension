const {Client, createLogger} = require('jaxcore-plugin');

const log = createLogger('ContentPortService');

const schema = {
	id: {
		type: 'string'
	},
	host: {
		type: 'string'
	},
	port: {
		type: 'integer'
	},
	options: {
		type: 'object'
	},
	connected: {
		type: 'boolean'
	}
};

let _instance = 0;

const clients = {};

// global.websocketClients = clients;

class ContentPortService extends Client {
	constructor(defaults, store, port) {
		super(schema, store, defaults);
		
		// this.socketTransport = socketTransport;
		
		this.log = createLogger('ContentPortService ' + (_instance++));
		this.port = port;
		this.log('create', defaults, port);
		this._instance = _instance;
		clients[this.state.id] = this;
		debugger;
	}
	
	connect() {
		this.log('connecting content port', this.state);
	};
	
	
	destroy() {
		this.emit('teardown');
		// this.removeAllListeners();
		// delete this.socket;
		// delete clients[this.state.id];
		// debugger;
	}
	
	static id(serviceConfig) {
		return 'wsc:'+serviceConfig.host+':'+serviceConfig.port;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		log('ContentPortServiceService getOrCreateInstance', serviceId, serviceConfig);
		
		if (serviceId in clients) {
			console.log('wsc', serviceId, 'exists');
			process.exit();
			callback(null, clients[serviceId], false);
		}
		else {
			log('CREATE WSC', serviceId, serviceConfig);
			
			var instance = ContentPortService.create(serviceConfig, serviceStore);
			
			log('CREATED WSC CLIENT', instance);
			
			callback(null, clients[serviceId], true);
			
			// instance.on('connect', function() {
			// 	// console.log('hix');
			// 	// process.exit();
			// 	if (callback) callback(null, instance, true);
			// });
			//
			// instance.connect();
			
		}
		// if (serviceInstance.clients[serviceId]) {
		// 	let instance = serviceInstance.clients[serviceId];
		// 	log('RETURNING WSC CLIENT', instance);
		// 	// process.exit();
		// 	return instance;
		// }
		// else {
		
		// }
	}
	
	
	static create(config, serviceStore) {
		var id = ContentPortService.id(config);
		config.id = id;
		log('create wsc', id);
		
		// console.log('serviceStore', serviceStore);
		// process.exit();
		
		if (!transportSpinStore) {
			
			// serviceInstance = new ContentPortServiceService();
		}
		
		let client = new ContentPortService(config, serviceStore);
		
		// clients[id].once('disconnect', () => {
		// 	debugger;
		// 	log('wsc disconnect');
		// 	delete
		// });
		
		return client;
	}
	
	// static startService() {
	//
	// }
	
	// static destroyInstance(serviceId, serviceConfig) {
	// 	if (volumeInstance) {
	// 		volumeInstance.destroy();
	// 		volumeInstance = null;
	// 	}
	// }
}

module.exports = ContentPortService;