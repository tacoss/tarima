var chain = require('siguiente');

var merge = require('./merge'),
    install = require('./install'),
    support = require('../support');

module.exports = function(params, done) {
  var _ = chain();

  var data = merge({}, params.options.data || {}, params.locals);

  var partial = {
    id: params.name,
    ext: params.ext,
    src: params.filename,
    code: params.source,
    locals: data,
    required: []
  };

  var exts = params.parts.slice().reverse();

  function push(engine, previous) {
    return function(next) {
      var fixedMethod = previous === 'js' ? 'compile' : 'render';

      partial.next = previous;
      partial.ext = previous || engine.ext || params.ext;

      if (engine.raw && (engine.raw.indexOf(previous) > -1)) {
        partial.ext = engine.ext;
      }

      engine[fixedMethod](partial, function(err, result) {
        if (!err) {
          delete partial.next;

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

  delete params.locals;

  var key, engine;

  for (key in exts) {
    if (!(engine = support.exts[exts[key]])) {
      break;
    }

    if (engine.required) {
      engine.required.forEach(function(dep) {
        _.then(install(dep));
      });
    }

    _.then(push(engine, exts[+key + 1]));
  }

  _.run(function(err) {
    done(err, partial);
  });
};
