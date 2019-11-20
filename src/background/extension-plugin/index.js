
module.exports = {
	devices: {
		contentPort: {
			device: require('./contentport-device'),
			storeType: 'client'
		}
	},
	services: {
		extension: {
			service: require('./extension-service'),
			storeType: 'service'
		}
	},
	adapters: {
		contentPortExtension: require('./contentport-adapter'),
		spinExtension: require('./extensionspin-adapter')
	}
};