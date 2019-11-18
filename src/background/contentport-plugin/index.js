module.exports = {
	services: {
		contentPort: {
			service: require('./contentport-service'),
			storeType: 'client'
		}
	},
	adapters: {
		contentPort: require('./contentport-adapter')
	}
};