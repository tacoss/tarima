'use strict';

var fs = require('fs'),
    path = require('path');

var $ = require('./util');

var tarima = module.exports = {};

var parsers = {};

var engines = [
  require('./engines/coffee'),
  require('./engines/css'),
  require('./engines/hbs'),
  require('./engines/html'),
  require('./engines/jade'),
  require('./engines/js'),
  require('./engines/json'),
  require('./engines/less'),
  require('./engines/md'),
  require('./engines/ract'),
  require('./engines/ejs')
];

function partial(params) {
  return {
    params: $.copy(params),

    compile: function(locals) {
      var view = $.reduce(parsers, $.copy(params), locals, true);

      return view.source;
    },

    render: function(locals) {
      var view = $.reduce(parsers, $.copy(params), locals);

      if (typeof view.render === 'function') {
        return view.render(locals);
      }

      return view.source;
    }
  };
}

tarima.add = function(engine, callback) {
  parsers[engine] = callback;
};

tarima.load = function(src, options) {
  return tarima.parse(src, fs.readFileSync(src).toString(), options);
};

tarima.parse = function(src, code, options) {
  var params = $.options(src),
      key = params.name;

  $.defaults(params, {
    source: String(code),
    options: $.copy(options || {})
  });

  if (params.options.cwd) {
    key = path.join(path.relative(params.options.cwd, params.filepath), params.name);
  }

  params.keypath = key;

  return partial(params);
};

engines.forEach(function(initialize) {
  initialize(tarima);
});
