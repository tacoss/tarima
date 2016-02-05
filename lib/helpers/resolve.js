var path = require('path'),
    exec = require('child_process').execSync;

var globalDir = exec('npm root -g').toString().trim();

var baseDir = path.resolve(__dirname, '../..'),
    moduleDirs = ['/node_modules', globalDir];

function append(directory) {
  directory.split('/').reduce(function(current, prev) {
    var fixedPath = path.join('/', path.join('/', current, prev), 'node_modules');

    if (moduleDirs.indexOf(fixedPath) === -1) {
      moduleDirs.unshift(fixedPath);
    }

    return fixedPath;
  });
}

append(baseDir);
append(process.cwd());

function resolve(name) {
  try {
    return require.resolve(name);
  } catch (e) {}
}

module.exports = function(name) {
  var fixedModule = resolve(name);

  if (!fixedModule) {
    for (var key in moduleDirs) {
      if (fixedModule = resolve(path.join(moduleDirs[key], name))) {
        break;
      }
    }
  }

  return fixedModule;
};
