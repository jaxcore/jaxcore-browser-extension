/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/content/content.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/content/content.js":
/*!********************************!*\
  !*** ./src/content/content.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

// import ext from '../utils/ext';
//
// ext.runtime.onMessage.addListener(function(request, sender, sendResponse) {
// 	if (request.action === 'change-color') {
// 		document.body.style.background = request.data.color;
// 	}
// 	else {
//
// 		// if (request.background === true) {
// 		// 	chrome.runtime.sendMessage({
// 		// 		contentScriptMessage: "hello"
// 		// 	}, function(response) {
// 		// 		console.log('response from background?', response);
// 		// 	});
// 		// }
//
// 		console.log('CONTENT received', sender.tab ?
// 			"from a content script:" + sender.tab.url :
// 			"from the extension");
// 		console.log('CONTENT request', request, 'sender', sender, 'response', sendResponse);
//
// 		// if (request.greeting == "hello")
// 		// 	sendResponse({farewell: "goodbye"});
//
// 		//console.log('onMessage', request);
//
// 		sendResponse({contentScriptResponse: "content says hello"});
//
// 	}
// });
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	console.log('CONTENT received', sender.tab ?
// 		"from a content script:" + sender.tab.url :
// 		"from the extension");
//
// 	// if (request.greeting == "hello")
// 	// 	sendResponse({farewell: "goodbye"});
//
// 	console.log('onMessage', request);
//
// 	sendResponse({contentScriptResponse: "content says hello"});
// });
console.log('Jaxcore content script loaded');
var bgPort = null;
var isActiveTab = true;

function disconnectExtension() {
  if (bgPort) {
    console.log('content post socketDisconnected');
    postMessage({
      socketDisconnected: true
    });
    bgPort.disconnect();
    bgPort = undefined;
  }
}

function postMessage(msg) {
  var data = {
    '_jaxcore_content': {
      message: msg,
      protocol: 1
    }
  }; // console.log('content post', data);

  window.postMessage(data, window.document.location.protocol + window.document.location.host);
}

function connectExtension() {
  // console.log('content sending connectExtension to background');
  bgPort = chrome.runtime.connect({
    name: "port-from-cs"
  });
  bgPort.onDisconnect.addListener(function () {
    // console.log('console port onDisconnect');
    postMessage({
      connectedExtension: false
    });
  });
  bgPort.onMessage.addListener(function (msg) {
    // console.log("content received from bg", msg);
    if (msg.connectedExtension) {
      postMessage({
        // isSocketConnected: !!msg.isSocketConnected,
        connectedExtension: !!msg.connectedExtension
      });
    }

    if ('isActiveTab' in msg) {
      // activeTab is sent along with .spinStore
      if (msg.isActiveTab !== isActiveTab) {
        isActiveTab = msg.isActiveTab; // console.log('isActiveTab');

        postMessage({
          isActiveTab: isActiveTab
        });
      }
    }

    if (msg.spin) {
      // console.log('got spin store content', msg);
      //debugger;
      postMessage(msg);
    }
  });
  bgPort.postMessage({
    connectExtension: true
  });
}

window.addEventListener("message", function (event) {
  // console.log('content on message', event.data);
  // We only accept messages from ourselves  || !event.isTrusted
  if (event.source !== window) {
    console.log('!isTrusted', event.source, window);
    debugger;
    return;
  }

  if (event.data._jaxcore_client) {
    console.log('content received message', event);
    var msg = event.data._jaxcore_client.message; // if (msg.socketDisconnected) {
    // 	console.log('content got socketDisconnected');
    // 	disconnectExtension();
    // }

    if (msg.disconnectExtension) {
      // console.log('content got disconnectExtension');
      disconnectExtension();
    } else if (msg.connectExtension) {
      // console.log('content got connectExtension');
      connectExtension();
    } // else if (event.data.type && (event.data.type == "FROM_PAGE")) {
    // 	console.log("Content script received message: " + event.data.text);
    // 	debugger;
    // }
    else {
        console.log('content unhandled msg', msg);
      }
  } else {// console.log('not _jaxcore_client', event.data);
  }
});
setTimeout(function () {
  console.log('Jaxcore content script ready');
  postMessage({
    extensionReady: true
  });
}, 1);

/***/ })

/******/ });
//# sourceMappingURL=content.js.map