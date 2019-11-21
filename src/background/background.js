import Jaxcore from 'jaxcore';
const jaxcore = new Jaxcore();
global.jaxcore = jaxcore;

const JAXCORE_EXTENSION_VERSION = '0.0.3';
const JAXCORE_PROTOCOL_VERSION = 2;

console.log('Jaxcore extension starting', 'version='+JAXCORE_EXTENSION_VERSION, 'protocol='+JAXCORE_PROTOCOL_VERSION);

jaxcore.addPlugin(require('./extension-plugin'));

jaxcore.on('device-connected', function(type, device) {
	if (type === 'contentPort') {
		jaxcore.launchAdapter(device, 'contentPortExtension');
	}
	else if (type === 'websocketSpin') {
		jaxcore.launchAdapter(device, 'spinExtension');
	}
});

jaxcore.startService('extension', null, null, {
	host: 'localhost',
	port: 37524,
	jaxcoreVersion: JAXCORE_EXTENSION_VERSION,
	protocolVersion: JAXCORE_PROTOCOL_VERSION,
	jaxcore
});

jaxcore.startDevice('contentPort');