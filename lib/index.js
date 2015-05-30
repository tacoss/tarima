'use strict';

var fs = require('fs'),
    _ = require('lodash');

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
  require('./engines/us')
];

function partial(params) {
  return {
    params: _.clone(params),

    compile: function(locals) {
      var view = $.reduce(parsers, _.clone(params), locals, true);

      return view.source;
    },

    render: function(locals) {
      var view = $.reduce(parsers, _.clone(params), locals);

      if (typeof view.render === 'function') {
        return view.render(locals);
      }

      return view.source;
    }
  };
}

tarima.add = function(type, callback) {
  parsers[type] = callback;
};

tarima.load = function(path, options) {
  return tarima.parse(path, fs.readFileSync(path).toString(), options);
};

tarima.parse = function(path, source, options) {
  var params = $.options(path),
      key = params.name;

  $.defaults(params, {
    options: options || {},
    source: String(source)
  });

  if (params.options.cwd) {
    key = params.filepath.replace(params.options.cwd, '');
    key = key.replace(/^\/+|\/+$/g, '') + '/' + params.name;
  }

  params.keypath = key.replace(/^\//, '');

  return partial(params);
};

tarima.config = function(type, params) {
  return $.configure(type, params);
};

engines.forEach(function(initialize) {
  initialize(tarima);
});
