var Async = require('async-parts');

var jadeEngine = {
  input: ['jade'],
  render: function(params, cb) {
    var jade = require('jade');
    var tpl = jade.compile(params.code);
    cb(null, { out: tpl(params.locals), deps: tpl.dependencies });
  }
};

var ractEngine = {
  input: ['ract'],
  render: function(params, cb) {
    var Ractive = require('ractive');
    Ractive.DEBUG = false;
    cb(null, { out: new Ractive({ template: params.code, data: params.locals }).toHTML() });
  }
};

var engines = [jadeEngine, ractEngine];

var expandedEngines = {};

engines.forEach(function(engine) {
  engine.input.forEach(function(ext) {
    expandedEngines[ext] = engine;
  });
});

function compile(params, parts, done) {
  var _ = new Async();

  var stub = {
    code: params.source,
    locals: params.locals,
    required: []
  };

  var exts = parts.slice().reverse();

  function push(compile) {
    return function(next) {
      compile(stub, function(err, result) {
        stub.code = result.out;

        if (result.deps) {
          Array.prototype.push.apply(stub.required, result.deps);
        }

        next();
      });
    };
  }

  var key, engine;

  for (key in exts) {
    if (!(engine = expandedEngines[exts[key]])) {
      break;
    }

    _.then(push(engine.render));
  }

  _.run(function(err) {
    done(err, stub);
  });
}

// tests
var raw = ['jade'],
    js = ['js', 'jade'],
    html = ['html', 'jade'],
    other = ['other', 'jade'],
    ractive = ['html', 'ract', 'jade'];

var exts = [raw, js, html, other, ractive];

var code = 'h1 It works! ({{foo}} | #{foo})';

var chain = new Async();

var data = { foo: 'bar' };

var params = { source: code, locals: data };

exts.forEach(function(parts) {
  chain.then(function(next) {
    compile(params, parts, function(err, result) {
      console.log('>', parts.join('.'));
      console.log(result);
      next();
    });
  });
});

chain.run(function(err) {
  console.log(err || 'OK');
});
