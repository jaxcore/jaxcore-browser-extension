import React, {Component} from 'react';
import './App.css';
import io from 'socket.io-client';

class App extends Component {
	constructor() {
		super();
		this.state = {
			status: 'disconnected'
		}
	}
	
	render() {
		return (
			<div className="App">
				<a href="/" onClick={this.onConnect}>
					Connect
				</a>
				<br/>
				Status: {this.state.status}
			</div>
		);
	}
	
	onConnect = (e) => {
		e.preventDefault();
		this.setState({status: 'connecting'});
		this.connect();
	};
	
	connect() {
		var port = 37524;
		console.log('connecting port ' + port + ' ...');
		
		/* Connects to the socket server */
		var socket = io.connect('http://localhost:' + port);

		socket.on('connect', () => {
			console.log('Client connected');
			alert('connected');

			this.setState({status: 'connected'});
		});

		socket.on('disconnect', () => {
			this.setState({status: 'disconnected'});
		});
	}
	
}

export default App;
