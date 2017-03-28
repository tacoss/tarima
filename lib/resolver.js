const debug = require('debug')('tarima:resolver');
const path = require('path');
const fs = require('fs');

const _paths = [];

const Module = require('module');

Module.globalPaths.forEach((_path) => {
  if (_path.indexOf('node_') === -1) {
    Array.prototype.push.apply(_paths, Module._nodeModulePaths(_path));
  } else {
    _paths.push(_path);
  }
});

const node_modules = path.join(process.cwd(), 'node_modules');

if (_paths.indexOf(node_modules) === -1) {
  _paths.unshift(node_modules);
}

const _resolve = Module._resolveFilename;
const _resolved = {};

Module._resolveFilename = function _resolver(name) {
  if (_resolved[name]) {
    return _resolved[name];
  }

  try {
    return _resolve.apply(null, arguments);
  } catch (e) {
    // avoid relative files
    if (name.indexOf('/') > -1) {
      throw e;
    }
  }

  for (const key in _paths) {
    const fixedDir = path.join(_paths[key], name);

    if (fs.existsSync(fixedDir)) {
      debug(fixedDir);

      const file = _resolve.apply(null,
        [fixedDir].concat(Array.prototype.slice.call(arguments, 1)));

      _resolved[name] = file;

      return file;
    }
  }

  throw new Error(`Cannot find module '${name}'`);
};
