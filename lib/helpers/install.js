var resolve = require('./resolve');

var npm;

// TODO: all logs must be handled from outside!

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
