import Module from 'module';

// @ts-strict-ignore
import fetch from 'node-fetch';

Module.globalPaths.push(__dirname + '/..');
global.fetch = fetch;

const lazyLoadBackend = async (isDev: boolean) => {
  // eslint-disable-next-line import/extensions
  const bundle = require('loot-core/lib-dist/bundle.desktop.js'); // "require" is needed due to it being a forked processes - it needs to know the origin
  bundle.initApp(isDev);
};

const isDev = false;

// Start the app
lazyLoadBackend(isDev);
