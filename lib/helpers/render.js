var chain = require('siguiente');

var map = require('./map'),
    merge = require('./merge'),
    support = require('../support');

var preFilters = require('./pre-filters'),
    annotatedError = require('./annotated-error');

module.exports = function(params, done) {
  var _ = chain();

  var fixedExts = [];

  var pre = preFilters(params);

  function push(engine, previous) {
    return function(next) {
      var fixedMethod = previous === 'js' ? 'compile' : 'render';

      params.next = previous;

      function push(deps) {
        if (deps) {
          deps.forEach(function(dep) {
            if (params.deps.indexOf(dep) === -1) {
              params.deps.push(dep);
            }
          });
        }

        if (previous === 'js' && engine.included) {
          params.runtimes.push(engine.included);
        }

        if (!previous && fixedExts.indexOf(engine.ext) === -1) {
          fixedExts.push(engine.ext);
        }
      }

      var test = engine[fixedMethod](params, function(err, result) {
        if (err) {
          err = annotatedError(params, err);
        }

        push(result);
        next(err);
      });

      if (engine[fixedMethod].length === 1) {
        push(test);
        next();
      }
    };
  }

  function run() {
    params.locals = merge({}, params.options.locals, params.locals, params.data);
    params.runtimes = [];

    delete params.locals._render;
    delete params.locals._bundle;
    delete params.locals._format;

    var exts = params.parts.slice().reverse();

    function ext(type) {
      return function(next) {
        fixedExts.unshift(exts[type]);
        next();
      };
    }

    var key, engine;

    for (key in exts) {
      if (!(engine = support.resolve(exts[key]))) {
        _.then(ext(key));
      } else  {
        _.then(push(engine, exts[+key + 1]));
      }
    }

    _.run(function(err) {
      params.extension = fixedExts.join('.');

      delete params.next;

      try {
        done(err, params);
      } catch (e) {
        done(err || e, params);
      }
    });
  }

  map(params, pre, function(err) {
    if (!err) {
      run();
    } else {
      done(err, params);
    }
  });
};
