var chain = require('siguiente');

module.exports = function(params, tasks, cb) {
  var _ = chain();

  _.catch(function(err, next) {
    cb(err);
    next();
  });

  tasks.forEach(function(task) {
    _.then(function(next) {
      task(params, next);

      if (task.length < 2) {
        next();
      }
    });
  });

  _.run(function(err) {
    cb(err);
  });
};
