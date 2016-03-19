var path = require('path'),
    exec = require('child_process').execSync;

var globalDir;

var baseDir = path.resolve(__dirname, '../..'),
    moduleDirs = [];

var foundModules = {};

function append(directory) {
  var parts = directory.split('/');

  parts[0] = '/';

  while (parts.length) {
    var fixedPath = path.join.apply(null, parts.concat('node_modules'));

    if (moduleDirs.indexOf(fixedPath) === -1) {
      moduleDirs.push(fixedPath);
    }

    parts.pop();
  }
}

append(process.cwd());
append(baseDir);

function resolve(name) {
  try {
    return require.resolve(name);
  } catch (e) {}
}

module.exports = function(name, throws) {
  if (typeof globalDir === 'undefined') {
    try {
      globalDir = exec('npm root -g').toString().trim();
    } catch (e) {
      // nothing
    }

    if (globalDir) {
      moduleDirs.push(globalDir);
    }
  }

  var fixedModule = foundModules[name] || resolve(name);

  if (!fixedModule) {
    for (var key in moduleDirs) {
      if (fixedModule = resolve(path.join(moduleDirs[key], name))) {
        break;
      }
    }
  }

  if (!fixedModule && throws !== false) {
    throw new ReferenceError('Missing `' + name + '` module');
  }

  foundModules[name] = fixedModule;

  return fixedModule;
};

module.exports.baseDir = baseDir;
