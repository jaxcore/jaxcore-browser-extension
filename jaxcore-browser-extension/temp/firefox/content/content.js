!function(e){var n={};function o(t){if(n[t])return n[t].exports;var c=n[t]={i:t,l:!1,exports:{}};return e[t].call(c.exports,c,c.exports,o),c.l=!0,c.exports}o.m=e,o.c=n,o.d=function(e,n,t){o.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,n){if(1&n&&(e=o(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(o.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var c in e)o.d(t,c,function(n){return e[n]}.bind(null,c));return t},o.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(n,"a",n),n},o.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},o.p="",o(o.s=37)}({37:function(e,n){var o=null,t=!0;function c(e){var n={_jaxcore_content:{message:e,protocol:1}};window.postMessage(n,window.document.location.protocol+window.document.location.host)}window.addEventListener("message",function(e){if(e.source===window){if(e.data._jaxcore_client){console.log("content received message",e);var n=e.data._jaxcore_client.message;n.disconnectExtension?o&&(console.log("content post socketDisconnected"),c({socketDisconnected:!0}),o.disconnect(),o=void 0):n.connectExtension?((o=chrome.runtime.connect({name:"port-from-cs"})).onDisconnect.addListener(function(){c({connectedExtension:!1})}),o.onMessage.addListener(function(e){e.connectedExtension&&c({connectedExtension:!!e.connectedExtension}),"isActiveTab"in e&&e.isActiveTab!==t&&c({isActiveTab:t=e.isActiveTab}),e.spin&&c(e)}),o.postMessage({connectExtension:!0})):console.log("content unhandled msg",n)}}else console.log("!isTrusted",e.source,window)}),console.log("content script loaded")}});