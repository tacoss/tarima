var chain = require('siguiente');

var merge = require('./merge'),
    install = require('./install'),
    support = require('../support');

module.exports = function(params, done) {
  var _ = chain();

  params.locals = merge({}, params.data, params.locals);
  params.dependencies = [];

  delete params.locals._render;
  delete params.locals._bundle;

  var exts = params.parts.slice().reverse();

  function push(engine, previous) {
    return function(next) {
      var fixedMethod = previous === 'js' ? 'compile' : 'render';

      params.next = previous;

      function push(deps) {
        if (deps) {
          deps.forEach(function(dep) {
            if (params.dependencies.indexOf(dep) === -1) {
              params.dependencies.push(dep);
            }
          });
        }
      }

      var test = engine[fixedMethod](params, function(err, result) {
        push(result);
        next(err);
      });

      if (engine[fixedMethod].length === 1) {
        push(test);
        next();
      }
    };
  }

  var key, engine;

  var fixedExts = [];

  for (key in exts) {
    if (!(engine = support.exts[exts[key]])) {
      fixedExts.unshift(exts[key]);
      continue;
    }

    if (engine.requires) {
      engine.requires.forEach(function(dep) {
        _.then(install(dep));
      });
    }

    _.then(push(engine, exts[+key + 1]));
  }

  _.run(function(err) {
    params.extension = fixedExts.join('.');

    delete params.next;

    done(err, params);
  });
};
