'use strict';

var fs = require('fs');

var $ = require('./util');

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

var partial = require('./partial');

var plugin = module.exports = require('./plugin');

plugin.parsers = {};

plugin.add = function(type, callback) {
  plugin.parsers[type] = callback;
};

plugin.load = function(path, options) {
  return plugin.parse(path, fs.readFileSync(path).toString(), options);
};

plugin.parse = function(path, source, options) {
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

plugin.config = function(type, params) {
  return $.configure(type, params);
};

engines.forEach(function(initialize) {
  initialize(plugin);
});
