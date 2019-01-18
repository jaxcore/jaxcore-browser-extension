var Spin = require('jaxcore-spin');

var BrowserService = require('./service/service');

var config = {
	port: 37524,
	ids: null
};
BrowserService.connect(config,function() {
	console.log('ready');
});

Spin.connectAll(function (spin) {
	
	console.log('spin connected', spin.id);
	
	
	// spin.on('spin', function (direction, position) {
	// 	console.log('spin', direction, position);
	// });
	//
	// spin.on('knob', function (pushed) {
	// 	console.log('knob', pushed);
	// });
	//
	// spin.on('button', function (pushed) {
	// 	console.log('button', pushed);
	// });
});