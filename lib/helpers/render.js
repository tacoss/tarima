var chain = require('siguiente');

var install = require('./install'),
    support = require('../support');

module.exports = function(params, done) {
  var _ = chain();

  var partial = {
    id: params.name,
    ext: params.ext,
    src: params.filename,
    code: params.source,
    track: [],
    locals: params.locals,
    options: params.options
  };

  var exts = params.parts.slice().reverse();

  function push(engine, previous) {
    return function(next) {
      var fixedMethod = previous === 'js' ? 'compile' : 'render';

      partial.next = previous;
      partial.ext = engine.ext || partial.ext;

      engine[fixedMethod](partial, function(err, result) {
        if (!err) {
          delete partial.next;

          partial.code = result.out;

          (result.deps || []).forEach(function(dep) {
            if (partial.track.indexOf(dep) === -1) {
              partial.track.push(dep);
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

    if (engine.requires) {
      engine.requires.forEach(function(dep) {
        _.then(install(dep));
      });
    }

    _.then(push(engine, exts[+key + 1]));
  }

  _.run(function(err) {
    done(err, partial);
  });
};
