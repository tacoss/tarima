var chain = require('siguiente');

var merge = require('./merge'),
    support = require('../support');

module.exports = function(params, done) {
  if (params.options.install && typeof params.options.install !== 'function') {
    return done(new Error('`options.install` must be a function.'));
  }

  var _ = chain();

  _.catch(function(err, next) {
    console.log(err);
    next();
  });

  var data = merge({}, params.options.data || {}, params.locals);

  var partial = {
    id: params.name,
    ext: params.ext,
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
          partial.ext = !(previous === 'js') && engine.ext || partial.ext;
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
    if (!(engine = support.exts[exts[key]])) {
      break;
    }

    if (engine.required && params.options.install) {
      engine.required.forEach(function(dep) {
        _.then(params.options.install(dep));
      });
    }

    _.then(push(engine, exts[+key + 1]));
  }

  _.run(function(err) {
    done(err, partial);
  });
};
