# Jaxcore Web Browser Extension

The Jaxcore browser extension's primary purpose is to establish a safe communication line to the Jaxcore desktop application
which hosts both the Spin Controller support ([jaxcore-spin](https://github.com/jaxcore/jaxcore-spin)), the Speech Recognition system ([jaxcore-listen](https://github.com/jaxcore/jaxcore-spin)), and other Jaxcore plugins to enable control of other home/computer devices such as home theater receivers, media players, and system audio.

These systems combined enable a next-generation level of motion and voice control over your home, and of web applications, using 100% client-side technologies.


## Step 1: Install Extension

Direct Links:

- [Chrome](https://chrome.google.com/webstore/detail/jaxcore-browser-extension/jjjbjijebbaabkhcelfndgmkklfjmiap?hl=en-US&gl=CA)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/jaxcore-browser-extension/)
- Opera (coming soon)

### Step 1 (alternative) build extension from source

```
git clone https://github.com/jaxcore/jaxcore-browser-extension.git
cd jaxcore-browser-extension
npm install
npm run build
```

See the resulting `dev` directory for the 3 extensions for Chrome, Firefox, and Opera.

To install the resulting zip files:

- Chrome: go to [chrome://extensions](chrome://extensions) and click "Load Unpacked", and choose the `dev/chrome` directory.

- Firefox: go to [about:addons](about:addons) and click the gear icon and choose "Debug Add-ons", then choose "Load Temporary Add-on" and select the `dev/firefox/manifest.json` file.

- Opera: coming soon


## Step 2: Install Jaxcore Desktop Application


See [https://jaxcore.com/download](https://jaxcore.com/download) for desktop app installation

(coming soon: open source version of the desktop software)



### Step 2 (alternative) install headless desktop server

The desktop app is not released yet.  For now, the headless browser plugin can be used to run the required Websocket service using NodeJS:

See: [Jaxcore Browser Plugin](https://github.com/jaxcore/browser-plugin) 

## Test It Out

With both the extension and Desktop App installed, and running, try the following examples to determine if your system is working (make sure your computer's microphone is turned on, and/or your Jaxcore Spin is turned on and connected to Jaxcore):

- basic speech example: [https://jaxcore.github.io/jaxcore-listen/examples/web-demo/](https://jaxcore.github.io/jaxcore-listen/examples/web-demo/)

- speech vocabulary tester: [https://jaxcore.github.io/jaxcore-listen/examples/web-vocab-tester/](https://jaxcore.github.io/jaxcore-listen/examples/web-vocab-tester/)

- Voice Chess game: [https://chess.jaxcore.com](https://chess.jaxcore.com)