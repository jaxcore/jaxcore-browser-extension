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
		setTimeout(() => {
			chrome.runtime.sendMessage({getPopupState: true}, (response) => {
				console.log('popup response', response);
				if (response) {
					this.setState({
						isSocketConnected: response.isSocketConnected,
						loading: false
					});
					//if (response.isSocketConnected) {
					
					this.connect();
					
					//}
				}
				else {
					debugger;
				}
			});
			
		}, 1000);
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
				
				<div>
					Port: {this.state.isPortConnected.toString()}<br/>
					Socket: {this.state.isSocketConnected.toString()}<br/>
					connecting: {this.state.connecting.toString()}
				</div>
			</div>);
		} else {
			return (<div id="popupcontainer">
				<button disabled={this.state.connecting} onClick={e => this.toggleConnect()}>
					{this.getConnectLabel()}
				</button>
				
				<div>
					Port: {this.state.isPortConnected.toString()}<br/>
					Server: {this.state.isSocketConnected.toString()}<br/>
					connecting: {this.state.connecting.toString()}
				</div>
				{this.renderSpins()}
			
			</div>);
		}
	}
	
	renderSpins() {
		const ids = [];
		if (!this.state.spinStore || !this.state.spinStore.ids) return;
		for (let id in this.state.spinStore.ids) {
			let handler = (e) => {
				this.clickSpin(id);
			};
			ids.push((<div key={id}>
				<a href="/" onClick={handler}>{id}</a>
			</div>));
		}
		return ids;
	}
	
	clickSpin(id) {
		console.log('click', id);
		//<pre>
		//	{JSON.stringify(this.state.spinStore)}
		//</pre>
	}
	
	toggleConnect() {
		if (this.state.connecting) return;
		if ((this.state.isSocketConnected && this.state.isPortConnected)) {
			this.disconnect();
		} else {
			this.connect();
		}
	}
	
	disconnect() {
		console.log('disconnecting...');
		this.setState({
			connecting: false,
			isSocketConnected: false,
			isPortConnected: false,
			spinStore: {}
		});
		this.bgPort.postMessage({disconnectSocket: true});
	}
	
	connect() {
		console.log('connecting...');
		
		this.setState({
			//isPortConnected: false,
			connecting: true
		});
		
		if (this.bgPort) {
			console.log('bg port exists');
			this.bgPort.postMessage({connectSocket: true});
			this.setState({
				isPortConnected: true,
				connecting: false
			});
			
		} else {
			
			console.log('new bg port');
			
			this.bgPort = chrome.runtime.connect({
				name: "port-from-popup"
			});
			
			const onMessage = (msg) => {
				console.log("popup received from bg", msg);
				if ('isSocketConnected' in msg) {
					this.setState({
						isSocketConnected: msg.isSocketConnected,
						isPortConnected: true,
						loading: false,
						connecting: false
					});
				}
				if (msg.spinStore) {
					console.log('got spin store', msg.spinStore);
					this.setState({
						spinStore: msg.spinStore
					});
				}
			};
			this._onMessage = onMessage.bind(this);
			this.bgPort.onMessage.addListener(this._onMessage);
			
			console.log('new bg port postMessage({connectSocket: true})');
			this.bgPort.postMessage({connectSocket: true});
			
			// this.setState({
			// 	isPortConnected: true
			// });
		}
		
		
		// chrome.runtime.sendMessage({connectSocket: true},
		// 	(response) => {
		// 		console.log('response from bg', response);
		// 		if (response) {
		// 			if (response.isSocketConnected) {
		// 				this.setState({
		// 					isSocketConnected: true,
		// 					connecting: false
		// 				});
		// 				debugger;
		// 			} else {
		// 				debugger;
		// 			}
		// 		}
		//
		// 		//tabURL = response.navURL
		// 	});//callback will be invoked somewhere in the future
	}
	
	getConnectLabel() {
		if (this.state.connecting) return 'Connecting...';
		return (this.state.isSocketConnected && this.state.isPortConnected) ? 'Disconnect' : 'Connect';
	}
}

export default Popup;