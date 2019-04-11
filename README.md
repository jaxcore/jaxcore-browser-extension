# Jaxcore Browser Plugin

This NodeJS library provides the web communication channel from Jaxcore Desktop app to the Jaxcore web browser extension.

To run Jaxcore headless (without the desktop app) run the following:

```
git clone https://github.com/jaxcore/browser-plugin.gif
cd browser-plugin
npm install
```

Download DeepSpeech English language model:

```
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.4.1/deepspeech-0.4.1-models.tar.gz
tar xvfz deepspeech-0.4.1-models.tar.gz
```

The tar.gz file can then be deleted:
```
rm deepspeech-0.4.1-models.tar.gz
```

Run the headless server:

```
node run.js ./models
```

With the Jaxcore web browser extension installed you can now try the Jaxcore Listen demos at:

[https://jaxcore.github.io/jaxcore-listen/](https://jaxcore.github.io/jaxcore-listen/)

Or the Voice Chess game at:

[https://chess.jaxcore.com](https://chess.jaxcore.com)