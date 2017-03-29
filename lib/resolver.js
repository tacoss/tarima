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

Module._resolveFilename = function _resolver(name) {
  if (_resolved[name]) {
    return _resolved[name];
  }

  try {
    /* eslint-disable prefer-spread */
    /* eslint-disable prefer-rest-params */
    return _resolve.apply(null, arguments);
  } catch (e) {
    // avoid relative files
    if (name.indexOf('/') > -1) {
      throw e;
    }
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

  throw new Error(`Cannot find module '${name}'`);
};
