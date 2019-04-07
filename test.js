var Spin = require('jaxcore-spin');

var BrowserService = require('./service/service');

var config = {
	port: 37524,
	ids: null
};
BrowserService.connect(config,function() {
	console.log('BrowserService ready');
});

Spin.connectAll(function (spin) {
// Spin.connectUSB(function (spin) {
	console.log('spin connected', spin.id);
	spin.setThrottle(0);
});