'use strict';

function onServerConnect() {
    console.log('hi');

    /* Connects to the socket server */
    var socket = io.connect('http://localhost:3201');
    socket.on('connect', function () {
        console.log('Client connected');
        
    });
}

function onConnect() {
    global.chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "knockknock");
    
    console.log('added listener', port);


    port.onMessage.addListener(function(msg) {

      console.log('got knock message', msg);


      if (msg.joke == "Knock knock")
        port.postMessage({question: "Who's there?"});
      else if (msg.answer == "Madame")
        port.postMessage({question: "Madame who?"});
      else if (msg.answer == "Madame... Bovary")
        port.postMessage({question: "I don't get it."});
    });
  });
}

  function onMessage() {
    chrome.runtime.sendMessage({greeting: "hello message"}, function(response) {
        console.log('onMessage response', response);
      });
  }

// function click(e) {
//   chrome.tabs.executeScript(null,
//       {code:"document.body.style.backgroundColor='" + e.target.id + "'"});
//   window.close();
// }

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('server').addEventListener('click', onServerConnect);
   document.getElementById('message').addEventListener('click', onMessage);
   document.getElementById('connect').addEventListener('click', onConnect);

    //   var divs = document.querySelectorAll('div');
    //   for (var i = 0; i < divs.length; i++) {
    //     divs[i].addEventListener('click', click);
    //   }
});

// For simple requests:
chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {
        // if (sender.id == blocklistedExtension)
        //     return;  // don't allow this extension access

        console.log('received', request);
        
        document.body.style.backgroundColor = 'green';

        // if (request.getTargetData) {
        //     sendResponse({ targetData: targetData });
        // }
        // else if (request.activateLasers) {
        //     var success = activateLasers();
        //     sendResponse({ activateLasers: success });
        // }
    });

// For long-lived connections:
chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        // See other examples for sample onMessage handlers.
        console.log('wuuuu')
    });
});