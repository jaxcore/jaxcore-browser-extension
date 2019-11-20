const {Adapter} = require('jaxcore-plugin');

class ContentPortAdapter extends Adapter {
	static getDefaultState() {
		return {
			tabActive: false
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {contentPort} = devices;
		const {extensionSevice} = services;
		
		this.addEvents(contentPort, {
			spinCommand: function(command) {
				this.log('contentPort change', changes);
				contentPort.spinUpdate(command);
			}
		});
		
		this.addEvents(spin, {
			update: function(changes) {
				this.log('websocketClient change', changes);
				contentPort.spinUpdate(changes);
			}
		});
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('ContentPortAdapter adapterConfig', adapterConfig);
		debugger;
		return {
			contentPort: adapterConfig.settings.services.contentPort,
			// websocketClient: adapterConfig.settings.services.websocketClient
		};
	}
}

module.exports = ContentPortAdapter;
