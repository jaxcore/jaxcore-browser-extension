const {Adapter} = require('jaxcore-plugin');

class ContentPortAdapter extends Adapter {
	static getDefaultState() {
		return {
		
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
				// debugger;
				const senderId = contentPort.state.senderId;
				const tabId = contentPort.state.tabId;
				
				extension.connectTab(contentPortId, requestedPrivileges, senderId, tabId);
				
				// debugger;
				//
				
			},
			spinCommand: function (id, method, args) {
				this.log('contentPort spinCommand', id, method, args);
				// debugger;
				extension.spinCommand(id, method, args);
			}
		});
		
		const extensionEvents = {
			// spinUpdate: function (id, changes) {
			// 	this.log('received spin-update from extension service', id, changes);
			// 	contentPort.spinUpdate(id, changes);
			// },
			'websocketclientConnect': function (websocketClientId) {
				// debugger;
				contentPort.websocketConnected(true, websocketClientId);
			},
			'websocketclientDisconnect': function (websocketClientId) {
				// debugger;
				contentPort.websocketConnected(false, websocketClientId);
			}
			
		};
		
		let spinUpdateEvent = contentPortId + ':spin-update';
		extensionEvents[spinUpdateEvent] = function (id, changes) {
			this.log('spin update', id, changes);
			contentPort.spinUpdate(id, changes);
			// debugger;
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
			
			const spinStore = extension.getSpinStore();
			console.log(spinStore);
			
			for (let id in spinStore) {
				contentPort.spinUpdate(id, spinStore[id]);
			}
			// debugger;
		};
		// extension.portConnected(contentPort.id);
		
		let activatedEvent = contentPortId + ':activated';
		extensionEvents[activatedEvent] = function () {
			this.log('port activated', contentPortId);
			contentPort.setActive(true);
			// debugger;
		};
		
		let deactivatedEvent = contentPortId + ':deactivated';
		extensionEvents[deactivatedEvent] = function () {
			this.log('port deactivated', contentPortId);
			contentPort.setActive(false);
			// debugger;
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
