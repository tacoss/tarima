var path = require('path');
var fs = require('fs');

var _paths = [];

var Module = require('module');

Module.globalPaths.forEach(function(_path) {
  if (_path.indexOf('node_') === -1) {
    Array.prototype.push.apply(_paths, Module._nodeModulePaths(_path));
  } else {
    _paths.push(_path);
  }
});

var node_modules = path.join(process.cwd(), 'node_modules');

if (_paths.indexOf(node_modules) === -1) {
  _paths.unshift(node_modules);
}

var _resolve = Module._resolveFilename;

Module._resolveFilename = function(name) {
  try {
    return _resolve.apply(null, arguments);
  } catch (e) { /* skip */ }

  for (var key in _paths) {
    var fixedDir = path.join(_paths[key], name);

    if (fs.existsSync(fixedDir) && fs.statSync(fixedDir).isDirectory()) {
      return _resolve.apply(null, [fixedDir].concat(Array.prototype.slice.call(arguments, 1)));
    }
  }

  return name;
};
