'use strict';

const debug = require('debug')('tarima:resolver');
const path = require('path');
const fs = require('fs');

const _paths = [];

const Module = require('module');

Module.globalPaths.forEach(_path => {
  if (_path.indexOf('node_') === -1) {
    Array.prototype.push.apply(_paths, Module._nodeModulePaths(_path));
  } else {
    _paths.push(_path);
  }
});

const nodeModules = path.join(process.cwd(), 'node_modules');

if (_paths.indexOf(nodeModules) === -1) {
  _paths.unshift(nodeModules);
}

const _resolve = Module._resolveFilename;
const _resolved = {};

const _known = [
  'chokidar',
  'rollup',
  'webpack',
  'fuse-box',
  'tarima-browser-sync',
  'tarima-bower',
  'tarima-lr',
  'tarima-juice',
  'talavera',
  'node-notifier',
  'csso',
  'google-closure-compiler-js',
].concat(require('./support').getDependencies());

Module._resolveFilename = function _resolver(name) {
  let _err;

  try {
    /* eslint-disable prefer-spread */
    /* eslint-disable prefer-rest-params */
    return _resolve.apply(null, arguments);
  } catch (e) {
    _err = e;

    // avoid relative files
    if (name.indexOf('/') > -1) {
      throw e;
    }
  }

  if (_resolved[name]) {
    return _resolved[name];
  }

  for (let i = 0, c = _paths.length; i < c; i += 1) {
    const fixedDir = path.join(_paths[i], name);

    if (fs.existsSync(fixedDir)) {
      debug(fixedDir);

      /* eslint-disable prefer-rest-params */
      const file = _resolve.apply(null,
        [fixedDir].concat(Array.prototype.slice.call(arguments, 1)));

      _resolved[name] = file;

      return file;
    }
  }

  if (_err && _err.code === 'MODULE_NOT_FOUND' && _known.indexOf(name) > -1) {
    throw new Error(`'${name}' is not installed, please try:\n  npm install --save-dev ${name}`);
  }

  throw _err;
};
