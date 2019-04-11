// starts Jaxcore Browser Service with Spin and Listen support

var Spin = require('jaxcore-spin');

var BrowserService = require('./service/service');

var modelPath = process.argv[2];
// __dirname+'/../../jaxcore-listen/models';
var config = {
	modelPath: modelPath,
	port: 37524,
	ids: null
};

BrowserService.connect(config,function() {
	console.log('BrowserService ready');
});

Spin.connectAll(function (spin) {
	console.log('spin connected', spin.id);
});