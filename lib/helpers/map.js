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
  function _end(err) {
    var _error = Array.isArray(err) ? err[0] : err;

    if (_error) {
      cb(_error);
    } else {
      cb();
    }
  }

  if (params === null) {
    Promise.all(tasks.map(function(task) {
      return new Promise(function(resolve, reject) {
        _next(task, null, resolve, reject);
      });
    }))
      .then(_end)
      .catch(_end);
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

        if (b.length < arity) {
          resolve();
        }
      });
    });
  }, Promise.resolve())
    .then(_end)
    .catch(_end);
};
