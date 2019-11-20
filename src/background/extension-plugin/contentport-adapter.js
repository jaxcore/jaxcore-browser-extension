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
		const {extension} = services;
		
		// extension.portConnected(contentPort.id);
		
		// extension.getPermissions(contentPort.id);
		// let spinStore = extension.getSpinStore();
		
		let contentPortId = contentPort.id;
		
		this.addEvents(contentPort, {
			connectTab: function (requestedPrivileges) {
				this.log('contentPort connectTab', 'requestedPrivileges', requestedPrivileges);
				debugger;
				extension.connectTab(contentPortId, requestedPrivileges);
				debugger;
			},
			spinCommand: function (command) {
				this.log('contentPort change', changes);
				extension.spinCommand(command);
			}
		});
		
		const extensionEvents = {
			spinUpdate: function (id, changes) {
				this.log('received spin-update from extension service', id, changes);
				contentPort.spinUpdate(id, changes);
			},
			'websocketclientConnect': function (websocketClientId) {
				debugger;
				contentPort.websocketConnected(true, websocketClientId);
			},
			'websocketclientDisconnect': function (websocketClientId) {
				debugger;
				contentPort.websocketConnected(false, websocketClientId);
			}
		};
		
		let connectedEvent = contentPortId + ':connected';
		extensionEvents[connectedEvent] = function (msg) {
			const grantedPrivileges = msg.grantedPrivileges;
			const websocketConnected = msg.websocketConnected;
			console.log('port connected', msg);
			contentPort.setConnected(true, {
				grantedPrivileges,
				websocketConnected
			});
			debugger;
		};
		// extension.portConnected(contentPort.id);
		
		let activatedEvent = contentPortId + ':activated';
		extensionEvents[activatedEvent] = function () {
			console.log('port activated', contentPortId);
			contentPort.setActive(true);
			debugger;
		};
		
		let deactivatedEvent = contentPortId + ':dectivated';
		extensionEvents[deactivatedEvent] = function () {
			console.log('port deactivated', contentPortId);
			contentPort.setActive(false);
			debugger;
		};
		this.addEvents(extension, extensionEvents);
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('ContentPortAdapter adapterConfig', adapterConfig);
		// debugger;
		return {
			extension: true
			// contentPort: adapterConfig.settings.services.contentPort,
			// websocketClient: adapterConfig.settings.services.websocketClient
		};
	}
}

module.exports = ContentPortAdapter;
