var Promise = require('es6-promise');

function _next(cb, params, resolve, reject) {
  function _end(err) {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  }

  if (params) {
    cb(params, _end);
  } else {
    cb(_end);
  }
}

module.exports = function(params, tasks, cb) {
  if (params === null) {
    Promise.all(tasks.map(function(task) {
      return new Promise(function(resolve, reject) {
        _next(task, null, resolve, reject);
      });
    }))
      .then(function() { cb(); })
      .catch(function(e) { cb(e); });
    return;
  }

  if (Array.isArray(params)) {
    cb = tasks;
    tasks = params;
    params = null;
  }

  tasks.reduce(function(a, b) {
    return a.then(function() {
      return new Promise(function(resolve, reject) {
        var arity = params ? 2 : 1;

        if (params) {
          _next(b, params, resolve, reject);
        } else {
          _next(b, null, resolve, reject);
        }

        if (b.length <= arity) {
          resolve();
        }
      });
    });
  }, Promise.resolve())
    .then(function() { cb(); })
    .catch(function(e) { cb(e); });
};
