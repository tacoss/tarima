var resolve = require('./resolve');

var npm;

function install(name, cb) {
  npm.commands.install([name], function(err) {
    cb(err);
  });
}

module.exports = function(name) {
  return function(next) {
    if (!resolve(name)) {
      npm = npm || require(resolve('npm'));

      npm.load(function(err) {
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
