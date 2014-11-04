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

var Partial = require('./partial');

var Chain = module.exports = function() {
  this.parsers = {};

  engines.forEach(function(bind) {
    bind(this);
  }, this);
};

Chain.prototype.add = function(type, callback) {
  this.parsers[type] = callback;
};

Chain.prototype.load = function(path, options) {
  return this.parse(path, fs.readFileSync(path).toString(), options);
};

Chain.prototype.parse = function(path, source, options) {
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

  return new Partial(params, this.parsers);
};

Chain.prototype.config = function(type, params) {
  return $.configure(type, params);
};
