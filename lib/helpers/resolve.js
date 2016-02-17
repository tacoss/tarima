var path = require('path'),
    exec = require('child_process').execSync;

var globalDir = exec('npm root -g').toString().trim();

var baseDir = path.resolve(__dirname, '../..'),
    moduleDirs = [globalDir];

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

module.exports = function(name) {
  var fixedModule = foundModules[name] || resolve(name);

  if (!fixedModule) {
    for (var key in moduleDirs) {
      if (fixedModule = resolve(path.join(moduleDirs[key], name))) {
        break;
      }
    }
  }

  foundModules[name] = fixedModule;

  return fixedModule;
};
