import React, {Component} from 'react';
import './popup.scss';
//import icon from '../../../assets/icons/icon-19-white.png';

//import Button from '../../components/button/button';
// import sendMessage from '../../services/comunicationManager';
//
// function setGreen() {
// 	sendMessage('change-color', {color: 'green'});
// }
//
// function setRed() {
// 	sendMessage('change-color', {color: 'red'});
// }

class Popup extends Component {
	constructor() {
		super();
		
		this.state = {
			loading: true,
			isSocketConnected: false,
			isPortConnected: false,
			connecting: false,
			spinStore: null
		};
		
		this.bgPort = null;
	}
	
	
	componentDidMount() {
		this.getSocketState(() => {
			this.getSpinStore();
		});
	}
	
	
	render() {
		return (<div>
			<div id="header">
				<img src="../../../assets/icons/logo-white.svg" className="logo" alt="logo"/>
			</div>
			{this.renderContent()}
		</div>);
	}
	
	renderContent() {
		if (this.state.loading) {
			return (<div id="popupcontainer">loading...
				
				{/*<div>*/}
				{/*Port: {this.state.isPortConnected.toString()}<br/>*/}
				{/*Socket: {this.state.isSocketConnected.toString()}<br/>*/}
				{/*connecting: {this.state.connecting.toString()}*/}
				{/*</div>*/}
			</div>);
		} else {
			return (<div id="popupcontainer">
				<div>
					{/*Port: {this.state.isPortConnected.toString()}*/}
					{/*<button onClick={e => this.toggleConnectPort()}>*/}
					{/*{this.getConnectPortLabel()}*/}
					{/*</button>*/}
					{/*<br/>*/}
					{/*{this.state.isSocketConnected.toString()}*/}
					Desktop App:
					<button onClick={e => this.toggleConnectSocket()}>
						{this.getConnectSocketLabel()}
					</button>
				</div>
				{this.renderSpins()}
			
			</div>);
		}
	}
	
	
	getSocketState(cb) {
		chrome.runtime.sendMessage({getSocketState: true}, (response) => {
			console.log('getSocketState response', response);
			if (response) {
				this.setState({
					isSocketConnected: response.isSocketConnected,
					loading: false
				});
				
				if (cb) cb();
				// if (response.isSocketConnected) {
				// 	this.getSpinState();
				// }
			} else {
				debugger;
			}
		});
	}
	
	toggleConnectSocket() {
		console.log('toggleConnectSocket');
		if (this.state.isSocketConnected) {
			this.sendSocketDisonnect();
		} else {
			this.sendSocketConnect();
		}
	}
	
	sendSocketConnect() {
		
		chrome.runtime.sendMessage({doConnectSocket: true}, (response) => {
			console.log('doConnectSocket response', response);
			if (response) {
				this.setState({
					isSocketConnected: response.isSocketConnected
				});
				
				debugger;
			} else {
				debugger;
				setTimeout(() => {
					this.getSpinStore();
				}, 1000)
			}
		});
		// chrome.runtime.sendMessage({connectSocket: true}, (response) => {
		// 	if (!response) {
		// 		console.log('sendSocketConnect');
		// 		debugger;
		// 		return;
		// 	}
		// 	console.log('sendSocketConnect response', response);
		// 	debugger;
		// 	this.setState({
		// 		isSocketConnected: response.isSocketConnected
		// 	});
		// });
	}
	
	sendSocketDisonnect() {
		console.log('sendSocketDisonnect');
		chrome.runtime.sendMessage({doDisconnectSocket: true}, (response) => {
			console.log('sendSocketConnect response', response);
			debugger;
			this.setState({
				isSocketConnected: response.isSocketConnected,
				spinStore: {}
			});
		});
	}
	
	getSpinStore() {
		chrome.runtime.sendMessage({getSpinStore: true}, (response) => {
			console.log('getSpinStore response', response);
			if (response) {
				this.setState({
					isSocketConnected: response.isSocketConnected,
					spinStore: response.spinStore,
					loading: false
				});
				
			} else {
				debugger;
			}
		});
	}
	
	
	renderSpins() {
		const ids = [];
		if (!this.state.isSocketConnected || !this.state.spinStore) return (<div>
			<h3>Not Connected</h3>
		</div>);
		
		for (let id in this.state.spinStore.ids) {
			let handler = (e) => {
				e.preventDefault();
				this.clickSpin(id);
			};
			ids.push((<div key={id}>
				Spin: <a href="/" onClick={handler}>{id}</a>
			</div>));
		}
		return (<div>
			<h3>Connected Devices:</h3>
			{ids}
		</div>);
	}
	
	clickSpin(id) {
		console.log('click', id);
		//<pre>
		//	{JSON.stringify(this.state.spinStore)}
		//</pre>
	}
	
	
	getConnectSocketLabel() {
		// if (this.state.connecting) return 'Connecting...';
		return (this.state.isSocketConnected) ? 'Disconnect' : 'Connect';
	}
	
	
	//
	//
	// toggleConnectPort() {
	// 	console.log('toggleConnectPort connecting=',this.state.connecting, 'isPortConnected', this.state.isPortConnected)
	// 	if (this.state.isPortConnected) {
	// 		this.disconnectPort();
	// 	} else {
	// 		this.connectPort();
	// 	}
	// }
	//
	//
	//
	//
	// connectSocket() {
	// 	if (this.bgPort) {
	// 		console.log('new bg port postMessage({connectSocket: true})');
	// 		this.bgPort.postMessage({connectSocket: true});
	// 	} else {
	// 		console.log('no port?');
	// 		this.connectPort(() => {
	// 			console.log('no port? connect socket');
	// 			this.bgPort.postMessage({connectSocket: true});
	// 		});
	// 	}
	// }
	//
	// disconnectSocket() {
	// 	console.log('Socket disconnecting...');
	// 	this.setState({
	// 		connecting: false,
	// 		isSocketConnected: false,
	// 		spinStore: {}
	// 	});
	// 	if (this.bgPort) {
	// 		this.bgPort.postMessage({disconnectSocket: true});
	// 	}
	// }
	//
	// disconnectPort() {
	// 	console.log('Port disconnecting...');
	// 	if (this.bgPort) this.bgPort.disconnect();
	// 	this.setState({
	// 		connecting: false,
	// 		isPortConnected: false,
	// 		//isSocketConnected: false,
	// 		spinStore: {}
	// 	});
	// 	if (this.bgPort) {
	// 		// this.bgPort.onMessage.removeListener(this._onMessage);
	// 		// this.bgPort.onDisconnect.removeListener(this._onPortDisconnect);
	// 		this.bgPort.disconnect();
	// 	}
	// 	delete this.bgPort;
	// }
	//
	// connectPort(cb) {
	// 	console.log('Port connecting...');
	//
	// 	this.setState({
	// 		//isPortConnected: false,
	// 		connecting: true
	// 	});
	//
	// 	if (this.bgPort) {
	// 		console.log('bg port exists');
	// 		this.bgPort.postMessage({connectSocket: true});
	// 		this.setState({
	// 			isPortConnected: true,
	// 			connecting: false
	// 		});
	// 		//this.disconnectPort();
	// 	}
	//
	// 	if (true) {
	//
	//
	// 		console.log('new bg port');
	//
	// 		this.bgPort = chrome.runtime.connect({
	// 			name: "port-from-popup"
	// 		});
	//
	// 		const onMessage = (msg) => {
	// 			console.log("popup received from bg", msg);
	//
	// 			if (cb) {
	// 				cb();
	// 			}
	//
	// 			this.setState({
	// 				isPortConnected: true,
	// 				connecting: false,
	// 				loading: false,
	// 			});
	//
	// 			if ('isSocketConnected' in msg) {
	// 				console.log('got \'isSocketConnected\' in msg');
	// 				this.setState({
	// 					isSocketConnected: msg.isSocketConnected,
	// 				});
	//
	// 				if (msg.isSocketConnected) {
	// 					console.log('sending getSpinState');
	// 					this.bgPort.postMessage({getSpinState: true});
	// 				}
	// 			}
	// 			if (msg.spinStore) {
	// 				console.log('got spin store', msg.spinStore);
	// 				this.setState({
	// 					spinStore: msg.spinStore
	// 				});
	// 			}
	// 		};
	// 		this._onMessage = onMessage.bind(this);
	//
	// 		this.bgPort.onMessage.addListener(this._onMessage);
	//
	// 		const onPortDisconnect = function () {
	// 			this.bgPort.onMessage.removeListener(this._onMessage);
	//
	// 			this.bgPort.onDisconnect.removeListener(this._onPortDisconnect);
	//
	// 			console.log('onPortDisconnect');
	// 			this.setState({
	// 				isPortConnected: false,
	// 				connecting: false
	// 			});
	// 			debugger;
	// 			delete this.bgPort;
	// 		};
	// 		// this._onPortDisconnect = onPortDisconnect.bind(this);
	// 		// this.bgPort.onDisconnect.addListener(this._onPortDisconnect);
	//
	// 		console.log('sending getPopupState')
	// 		this.bgPort.postMessage({getPopupState: true});
	// 		// this.setState({
	// 		// 	isPortConnected: true
	//
	// 		// });
	// 	}
	//
	//
	// 	// chrome.runtime.sendMessage({connectSocket: true},
	// 	// 	(response) => {
	// 	// 		console.log('response from bg', response);
	// 	// 		if (response) {
	// 	// 			if (response.isSocketConnected) {
	// 	// 				this.setState({
	// 	// 					isSocketConnected: true,
	// 	// 					connecting: false
	// 	// 				});
	// 	// 				debugger;
	// 	// 			} else {
	// 	// 				debugger;
	// 	// 			}
	// 	// 		}
	// 	//
	// 	// 		//tabURL = response.navURL
	// 	// 	});//callback will be invoked somewhere in the future
	// }
	//
	// getConnectPortLabel() {
	// 	// if (this.state.connecting) return 'Connecting...';
	// 	return (this.state.isPortConnected) ? 'Disconnect' : 'Connect';
	// }
	//
	// getConnectSocketLabel() {
	// 	// if (this.state.connecting) return 'Connecting...';
	// 	return (this.state.isSocketConnected) ? 'Disconnect' : 'Connect';
	// }
	//
}

export default Popup;