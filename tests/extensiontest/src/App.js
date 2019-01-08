import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      log: 'blah'
    };
  }

  componentWillMount() {
    // global.chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    //     console.info("------------------------------- Got request", request);
    //     let {log} = this.state;
    //     log += request.toString()+"\n";

    //     this.setState({
    //       log
    //     });
    //     //if (request.getSelectedContent) {
    //       //sendResponse("blah blah");        
    //     //}
    //   });

          
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.onSendMessage}>message</button>
        <button onClick={this.onConnect}>connect</button>
        <div>
          <pre>{this.state.log}</pre>
          </div>
      </div>
    );
  }

  onSendMessage = e => {
    console.log('messaging');
    var extensionId = "mlphakhgnijiaidcaddhgpeihkeegdkn";
    global.chrome.runtime.sendMessage(extensionId, { getSelectedContent: "true" },
      response => {
        console.info("----------------- Got response", response);
        if (response) {
          alert(response);
        }
        else {
          alert('no response');
        }
        //debugger;
        // if (response) {
        //   this.text = response;
        // }
      });
  }

  onConnect = e => {
    console.log('connecting');
    var extensionId = "mlphakhgnijiaidcaddhgpeihkeegdkn";
    var port = global.chrome.runtime.connect(extensionId, {name: "knockknock"});
    port.postMessage({joke: "Knock knock"});
    port.onMessage.addListener(function(msg) {
      console.log('got event', msg);

      if (msg.question == "Who's there?")
        port.postMessage({answer: "Madame"});
      else if (msg.question == "Madame who?")
        port.postMessage({answer: "Madame... Bovary"});
    });


  }
}

export default App;
