var resolve = require('./resolve');

var npm;

function install(name, cb) {
  npm.commands.install([name], function(err) {
    cb(err);
  });

  npm.on('log', function(message) {
    console.log(message);
  });
}

module.exports = function(name) {
  return function(next) {
    if (!resolve(name)) {
      console.log('Installing `' + name + '` module...');

      npm = npm || require(resolve('npm'));

      npm.load({
        loaded: false
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
