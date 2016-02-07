var chain = require('siguiente');

var merge = require('./merge'),
    install = require('./install'),
    support = require('../support');

module.exports = function(params, done) {
  var _ = chain();

  var data = merge({}, params.options.data || {}, params.locals);

  var stub = {
    code: params.source,
    locals: data,
    required: []
  };

  var exts = params.parts.reverse();

  function push(engine) {
    return function(next) {
      engine.render(stub, function(err, result) {
        if (!err) {
          stub.code = result.out;

          (result.deps || []).forEach(function(dep) {
            if (stub.required.indexOf(dep) === -1) {
              stub.required.push(dep);
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

    _.then(push(engine));
  }

  _.run(function(err) {
    done(err, stub);
  });
};
