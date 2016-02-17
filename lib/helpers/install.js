var resolve = require('./resolve');

var npm;

function install(name, cb) {
  // TODO: remove once this closes https://github.com/npm/npm/issues/10732
  process.stdout.write('\n');

  npm.commands.install(resolve.baseDir, [name], function(err) {
    cb(err);
  });
}

module.exports = function(name) {
  return function(next) {
    if (!resolve(name.split('@')[0])) {
      npm = npm || require(resolve('npm'));

      npm.load({
        loaded: false,
        progress: false,
        loglevel: 'silent',
        forceInstall: true
      }, function(err) {
        if (!err) {
          install(name, next);
        } else {
          next(err);
        }
      });
    } else {
      next();
    }
  };
};
