const {Adapter} = require('jaxcore-plugin');

class SpinExtensionAdapter extends Adapter {
	static getDefaultState() {
		return {
		
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {spin} = devices;
		const {extension} = services;
		
		const extensionEvents = {};
		const evt = 'spin-command-'+spin.id;
		extensionEvents[evt] = function(id, method, args) {
			let commandArgs = args;
			commandArgs.unshift(method);
			// commandArgs.unshift(id);
			this.log('extensionSevice spin sendCommand', commandArgs);
			
			spin.sendCommand.apply(spin, commandArgs);
		};
		this.addEvents(extension, extensionEvents);
		
		this.addEvents(spin, {
			update: function(changes) {
				this.log('spin update to extensionSevice', changes);
				extension.spinUpdate(spin.id, changes);
			}
		});
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('SpinExtensionAdapter adapterConfig', adapterConfig);
		return {
			extension: true
			// contentPort: adapterConfig.settings.services.contentPort,
			// websocketClient: adapterConfig.settings.services.websocketClient
		};
	}
}

module.exports = SpinExtensionAdapter;
