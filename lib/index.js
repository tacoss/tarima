'use strict';

var fs = require('fs');

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

tarima.load = function(path, options) {
  return tarima.parse(path, fs.readFileSync(path).toString(), options);
};

tarima.parse = function(path, source, options) {
  var params = $.options(path),
      key = params.name;

  $.defaults(params, {
    source: String(source),
    options: $.copy(options || {})
  });

  if (params.options.cwd) {
    key = params.filepath.replace(params.options.cwd, '');
    key = key.replace(/^\/+|\/+$/g, '') + '/' + params.name;
  }

  params.keypath = key.replace(/^\//, '');

  return partial(params);
};

engines.forEach(function(initialize) {
  initialize(tarima);
});
