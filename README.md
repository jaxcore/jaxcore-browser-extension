# Jaxcore Web Browser Extension

## Install (direct install)

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/jaxcore-browser-extension/)
- Chrome (coming soon)
- Opera (coming soon)

## Build From Source

```
git clone https://github.com/jaxcore/jaxcore-browser-extension.git
cd jaxcore-browser-extension
npm install
npm run build
```

See the resulting `dev` directory for the 3 extensions for Chrome, Firefox, and Opera.

## Install Extension From Source

In Chrome, go to [chrome://extensions](chrome://extensions) and click "Load Unpacked", and choose the `dev/chrome` directory.

In Firefox, go to [about:addons](about:addons) and click the gear icon and choose "Debug Add-ons", then choose "Load Temporary Add-on" and select the `dev/firefox/manifest.json` file.

In Opera...

## Test It Out

With either the [Jaxcore Desktop app]() install, or the headless [Browser Plugin](https://github.com/jaxcore/browser-plugin) service running try the following:

[https://jaxcore.github.io/jaxcore-listen/examples/web-demo/](https://jaxcore.github.io/jaxcore-listen/examples/web-demo/)

[https://jaxcore.github.io/jaxcore-listen/examples/web-vocab-tester/](https://jaxcore.github.io/jaxcore-listen/examples/web-vocab-tester/)