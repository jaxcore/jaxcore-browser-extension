console.log('bg listening!');

var selectedContent = null;
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    console.info("------------------------------- Got request", request);

    //if (request.getSelectedContent) {
      sendResponse("blah blah");        
    //}
  });

// setInterval(function() {
//     chrome.runtime.sendMessage({message: "hello"}, function(response) {
//         console.log('response', response);
//       });
// })

  

  setInterval(function() {
      console.log('yo')
  }, 4000);

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