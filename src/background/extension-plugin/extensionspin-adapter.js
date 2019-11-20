const {Adapter} = require('jaxcore-plugin');

class ExtensionSpinAdapter extends Adapter {
	static getDefaultState() {
		return {
		
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {spin} = devices;
		const {extension} = services;
		
		this.addEvents(extension, {
			spinCommand: function(command) {
				this.log('extensionSevice spin command', command);
				spin.spinUpdate(command);
			}
		});
		
		this.addEvents(spin, {
			update: function(changes) {
				this.log('spin update to extensionSevice', changes);
				extension.spinUpdate(spin.id, changes);
			}
		});
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('ExtensionSpinAdapter adapterConfig', adapterConfig);
		return {
			extension: true
			// contentPort: adapterConfig.settings.services.contentPort,
			// websocketClient: adapterConfig.settings.services.websocketClient
		};
	}
}

module.exports = ExtensionSpinAdapter;
