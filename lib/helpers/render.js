var debug = require('debug')('tarima:renderer');
var chain = require('siguiente');

var map = require('./map'),
    parse = require('./parse'),
    merge = require('./merge'),
    support = require('../support');

var preFilters = require('./pre-filters');

var _ctx = {};
var _engines = support.getEngines();

Object.keys(_engines).forEach(function(_id) {
  _engines[_id].requires.forEach(function(moduleName) {
    var key = moduleName.replace(/\W([a-z])/g, function(_, word) {
      return word.toUpperCase();
    });

    Object.defineProperty(_ctx, key, {
      get: function() {
        return require(moduleName);
      }
    });
  });
});

module.exports = function render(params, done) {
  var _ = chain();

  var fixedExts = [];

  _ctx.parse = parse;
  _ctx.render = render;
  _ctx.support = support;

  debug(params.filename);

  try {
    var pre = preFilters(params);
  } catch (e) {
    return done(e, params);
  }

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

      var test = engine[fixedMethod].call(_ctx, params, function(err, result) {
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
    params.locals = merge({},
      params.options.globals,
      params.options.locals,
      params.locals,
      params.data);

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
    var extensions = params.options.extensions || {};

    for (key in exts) {
      if (extensions[exts[key]] !== false) {
        if (!(engine = support.resolve(exts[key]))) {
          _.then(ext(key));
        } else {
          _.then(push(engine, exts[+key + 1]));
        }
      }
    }

    _.run(function(err) {
      params.extension = fixedExts.join('.') || exts[0];

      delete params.next;
      done(err, params);
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
