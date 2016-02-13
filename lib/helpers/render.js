var chain = require('siguiente');

var merge = require('./merge'),
    install = require('./install'),
    support = require('../support');

module.exports = function(params, done) {
  var _ = chain();

  var data = merge({}, params.options.data || {}, params.locals);

  var partial = {
    src: params.filename,
    code: params.source,
    locals: data,
    required: []
  };

  var exts = params.parts.reverse();

  function push(engine, previous) {
    return function(next) {
      var fixedMethod = previous === 'js' ? 'compile' : 'render';

      engine[fixedMethod](partial, function(err, result) {
        if (!err) {
          partial.code = result.out;

          (result.deps || []).forEach(function(dep) {
            if (partial.required.indexOf(dep) === -1) {
              partial.required.push(dep);
            }
          });
        }

        next(err);
      });
    };
  }

  var key, engine;

  for (key in exts) {
    if (!(engine = support[exts[key]])) {
      break;
    }

    if (engine.require) {
      engine.require.forEach(function(name) {
        _.then(install(name));
      });
    }

    _.then(push(engine, exts[+key + 1]));
  }

  _.run(function(err) {
    done(err, partial);
  });
};
