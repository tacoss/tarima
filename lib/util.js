var Async = require('async-parts');

var engines = require('./support');

var support = {};

for (var prop in engines) {
  engines[prop].input.forEach(function(ext) {
    support[ext] = engines[prop];
  });
}

function render(params, done) {
  var _ = new Async();

  var stub = {
    code: params.source,
    locals: params.locals,
    required: []
  };

  var exts = params.parts.slice().reverse();

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

    _.then(push(engine));
  }

  _.run(function(err) {
    done(err, stub);
  });
}

module.exports = {
  render: render
};
